import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const flwSecret = process.env.FLUTTERWAVE_SECRET_KEY;

export async function POST(req: Request) {
  if (!flwSecret) {
    return NextResponse.json({ error: 'Flutterwave not configured' }, { status: 500 });
  }

  const signature = req.headers.get('verif-hash');
  if (!signature || signature !== flwSecret) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const body = await req.json();
  const event = body?.event;

  try {
    if (event === 'charge.completed' || event === 'payment.completed') {
      const quoteId = body?.data?.meta?.quoteId;
      if (quoteId) {
        await prisma.quote.update({
          where: { id: quoteId },
          data: { status: 'Paid' },
        });
      }
    }
  } catch (error) {
    console.error('Flutterwave webhook error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
