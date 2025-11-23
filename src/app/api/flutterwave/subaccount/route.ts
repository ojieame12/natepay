import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Flutterwave from 'flutterwave-node-v3';
import { prisma } from '@/lib/prisma';

const flwPublicKey = process.env.FLUTTERWAVE_PUBLIC_KEY;
const flwSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!flwPublicKey || !flwSecretKey) {
    return NextResponse.json({ error: 'Flutterwave not configured' }, { status: 500 });
  }

  let body: {
    account_number?: string;
    account_bank?: string;
    business_name?: string;
    percentage_charge?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { account_number, account_bank, business_name, percentage_charge } = body ?? {};

  if (!account_number || !account_bank || !business_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const flw = new Flutterwave(flwPublicKey, flwSecretKey);

  try {
    const response = await flw.Subaccount.create({
      account_number,
      account_bank,
      business_name,
      split_type: 'percentage',
      split_value: percentage_charge ?? 5,
    });

    const subaccountId = response?.data?.subaccount_id || response?.data?.id;
    if (!subaccountId) {
      throw new Error('No subaccount id returned');
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: { email: user.emailAddresses[0]?.emailAddress },
      create: { id: userId, email: user.emailAddresses[0]?.emailAddress },
    });

    await prisma.userSettings.upsert({
      where: { userId },
      update: {
        flutterwaveSubaccountId: subaccountId,
        preferredProvider: 'flutterwave',
      },
      create: {
        userId,
        currency: 'USD',
        flutterwaveSubaccountId: subaccountId,
        preferredProvider: 'flutterwave',
      },
    });

    return NextResponse.json({ subaccountId });
  } catch (error) {
    console.error('Flutterwave subaccount error:', error);
    return NextResponse.json({ error: 'Failed to create Flutterwave subaccount' }, { status: 500 });
  }
}
