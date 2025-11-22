import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { selectProvider } from '@/lib/providers';
import Flutterwave from 'flutterwave-node-v3';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' }) : null;
const DEFAULT_PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || '5');
const flwSecret = process.env.FLUTTERWAVE_SECRET_KEY;
const flw = flwSecret ? new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY || '', flwSecret) : null;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  let body: { slug?: string; packageId?: string | null; planId?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug, packageId, planId } = body;
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { slug },
    include: { packages: true, paymentPlans: true, user: true },
  });

  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  if (!quote.user?.stripeAccountId) {
    return NextResponse.json({ error: 'Seller has not set up payouts yet.' }, { status: 400 });
  }

  const settings = await prisma.userSettings.findUnique({ where: { userId: quote.userId } });
  const provider = selectProvider(settings, quote);
  const pkg =
    (packageId ? quote.packages.find((p) => p.id === packageId) : null) ??
    quote.packages.find((p) => p.isRecommended) ??
    quote.packages[0];
  const plan =
    (planId ? quote.paymentPlans.find((p) => p.id === planId) : null) ??
    quote.paymentPlans[1] ??
    quote.paymentPlans[0];

  const baseTotal = pkg ? pkg.price : quote.totalAmount || 0;
  const payToday = Math.max(plan ? plan.deposit : Math.round(baseTotal * 0.5), 50);
  const platformFeePercent = settings?.platformFeePercent ?? DEFAULT_PLATFORM_FEE_PERCENT;
  const currency = (quote.currency || settings?.currency || 'USD').toUpperCase();

  const successUrl =
    process.env.STRIPE_SUCCESS_URL?.replace('{slug}', quote.slug) ||
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/q/success?slug=${quote.slug}`;
  const cancelUrl =
    process.env.STRIPE_CANCEL_URL?.replace('{slug}', quote.slug) ||
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/q/cancel?slug=${quote.slug}`;

  if (provider === 'flutterwave') {
    if (!flw) return NextResponse.json({ error: 'Flutterwave not configured' }, { status: 500 });
    try {
      const payload: Record<string, unknown> = {
        tx_ref: `${quote.slug}-${Date.now()}`,
        amount: payToday,
        currency,
        redirect_url: successUrl,
        customer: {
          email: quote.clientName || 'client@example.com',
          name: quote.clientName || 'Client',
        },
        customizations: {
          title: quote.projectTitle,
        },
        meta: {
          quoteId: quote.id,
          slug: quote.slug,
          packageId: pkg?.id ?? '',
          planId: plan?.id ?? '',
        },
      };

      if (settings?.flutterwaveSubaccountId) {
        payload.subaccounts = [
          {
            id: settings.flutterwaveSubaccountId,
            transaction_charge_type: 'percentage',
            transaction_charge: 100 - platformFeePercent,
          },
        ];
      }

    const response = await flw.Payment.initiate(payload as Record<string, string | number | undefined | object>);
    const link = response?.data?.link;
      if (!link) throw new Error('No payment link from Flutterwave');

      await prisma.payment.create({
        data: {
          amount: payToday,
          status: 'pending',
          stripeSessionId: response?.data?.id?.toString() || '',
          quoteId: quote.id,
        },
      });

      await prisma.quote.update({
        where: { id: quote.id },
        data: { paymentProvider: 'flutterwave', providerReference: response?.data?.id?.toString() },
      });

      return NextResponse.json({ url: link });
    } catch (err) {
      console.error('Flutterwave Checkout Error:', err);
      return NextResponse.json({ error: 'Flutterwave payment failed' }, { status: 500 });
    }
  }

  try {
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `${quote.projectTitle} (Deposit)`,
            description: `Deposit for ${quote.projectTitle}`,
          },
          unit_amount: Math.round(payToday * 100), // Stripe expects cents
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_intent_data: {
        application_fee_amount: Math.round(payToday * (platformFeePercent / 100)),
        transfer_data: {
          destination: quote.user.stripeAccountId,
        },
      },
      metadata: {
        quoteId: quote.id,
        slug: quote.slug,
        packageId: pkg?.id ?? '',
        planId: plan?.id ?? '',
      },
    });

    await prisma.payment.create({
      data: {
        amount: payToday,
        status: 'pending',
        stripeSessionId: session.id,
        quoteId: quote.id,
      },
    });

    await prisma.quote.update({
      where: { id: quote.id },
      data: { paymentProvider: 'stripe', providerReference: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
