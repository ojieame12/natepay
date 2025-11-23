import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const STRIPE_API_VERSION: Stripe.StripeConfig['apiVersion'] = '2025-11-17.clover';
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: STRIPE_API_VERSION }) : null;

export async function POST() {
  try {
    const { userId } = await auth();
    if (!stripe || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.stripeAccountId) {
            return NextResponse.json({ error: 'No Stripe account found' }, { status: 400 });
        }

        const accountSession = await stripe.accountSessions.create({
            account: user.stripeAccountId,
            components: {
                payouts: { enabled: true, features: { instant_payouts: true, standard_payouts: true, edit_payout_schedule: true } },
                balances: { enabled: true, features: { instant_payouts: true, standard_payouts: true, edit_payout_schedule: true } },
            },
        });

        return NextResponse.json({ clientSecret: accountSession.client_secret });
    } catch (error) {
        console.error('Account Session Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
