import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' }) : null;

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const quoteId = session.metadata?.quoteId;
      if (quoteId) {
        if (session.mode === 'payment') {
          await prisma.payment.updateMany({
            where: { stripeSessionId: session.id },
            data: { status: 'paid' },
          });
          await prisma.quote.update({
            where: { id: quoteId },
            data: { status: 'Paid' },
          });
        }
        if (session.mode === 'subscription') {
          await prisma.quote.update({
            where: { id: quoteId },
            data: { retainerStatus: 'pending' },
          });
        }
      }
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const quoteId = invoice.subscription_details?.metadata?.quoteId || invoice.metadata?.quoteId;
      if (quoteId) {
        await prisma.quote.update({
          where: { id: quoteId },
          data: {
            status: 'Paid',
            retainerStatus: 'active',
            retainerSubscriptionId: invoice.subscription?.toString(),
            retainerAmount: invoice.amount_paid ? invoice.amount_paid / 100 : undefined,
          },
        });
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const quoteId = invoice.subscription_details?.metadata?.quoteId || invoice.metadata?.quoteId;
      if (quoteId) {
        await prisma.quote.update({
          where: { id: quoteId },
          data: { retainerStatus: 'past_due' },
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const quoteId = subscription.metadata?.quoteId;
      if (quoteId) {
        await prisma.quote.update({
          where: { id: quoteId },
          data: { retainerStatus: 'canceled' },
        });
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const quoteId = subscription.metadata?.quoteId;
      if (quoteId && subscription.status === 'canceled') {
        await prisma.quote.update({
          where: { id: quoteId },
          data: { retainerStatus: 'canceled' },
        });
      }
    }
  } catch (error) {
    console.error('Webhook handling failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
