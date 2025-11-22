import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' }) : null;
const DEFAULT_PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || '5');

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  let body: { slug?: string; amount?: number; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug, amount, description } = body;
  if (!slug || !amount || amount < 5) {
    return NextResponse.json({ error: 'Missing slug or invalid amount' }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { slug },
    include: { user: true },
  });

  if (!quote || !quote.user?.stripeAccountId) {
    return NextResponse.json({ error: 'Quote or payout account not found' }, { status: 404 });
  }

  const settings = await prisma.userSettings.findUnique({ where: { userId: quote.userId } });
  const platformFeePercent = settings?.platformFeePercent ?? DEFAULT_PLATFORM_FEE_PERCENT;
  const currency = settings?.currency || 'USD';

  const successUrl =
    process.env.STRIPE_SUCCESS_URL?.replace('{slug}', quote.slug) ||
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/q/success?slug=${quote.slug}`;
  const cancelUrl =
    process.env.STRIPE_CANCEL_URL?.replace('{slug}', quote.slug) ||
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/q/cancel?slug=${quote.slug}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description || `${quote.projectTitle} Retainer`,
            },
            unit_amount: Math.round(amount * 100),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        application_fee_percent: platformFeePercent,
        transfer_data: {
          destination: quote.user.stripeAccountId,
        },
        metadata: {
          quoteId: quote.id,
          slug: quote.slug,
        },
      },
      metadata: {
        quoteId: quote.id,
        slug: quote.slug,
        type: 'retainer',
      },
    });

    // Mark retainer intent as pending
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        retainerStatus: 'pending',
        retainerAmount: amount,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Subscription checkout error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
