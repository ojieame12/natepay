import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' }) : null;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!stripe || !userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

        // 1. Get or Create User in DB
        let dbUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    id: userId,
                    email: user.emailAddresses[0].emailAddress,
                },
            });
        }

        // 2. Create Stripe Account if needed
        if (!dbUser.stripeAccountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'US', // Default to US for MVP
                email: dbUser.email || undefined,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            dbUser = await prisma.user.update({
                where: { id: userId },
                data: { stripeAccountId: account.id },
            });
        }

        // 3. Create Account Link
        // Use origin from request or fallback to localhost
        const origin = req.headers.get('origin') || 'http://localhost:3000';

        const accountLink = await stripe.accountLinks.create({
            account: dbUser.stripeAccountId!,
            refresh_url: `${origin}/finance`,
            return_url: `${origin}/finance`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error) {
        console.error('Onboarding Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
