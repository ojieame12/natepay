import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  return NextResponse.json({ settings: settings || null });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) return new NextResponse('Unauthorized', { status: 401 });

  let body: {
    userType?: string;
    jobType?: string;
    businessName?: string;
    currency?: string;
    baseHourlyRate?: number;
    minHourlyRate?: number;
    defaultDeposit?: number;
    simplifiedUI?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { userType, jobType, businessName, currency, baseHourlyRate, minHourlyRate, defaultDeposit, simplifiedUI } = body ?? {};
  const safeCurrency = currency && currency.length === 3 ? currency.toUpperCase() : 'USD';
  const safeBase = baseHourlyRate && baseHourlyRate > 0 ? Number(baseHourlyRate) : undefined;
  const safeMin = minHourlyRate && minHourlyRate > 0 ? Number(minHourlyRate) : undefined;
  const safeDeposit =
    defaultDeposit && defaultDeposit >= 0 && defaultDeposit <= 1 ? Number(defaultDeposit) : undefined;

  await prisma.user.upsert({
    where: { id: userId },
    update: { email: user.emailAddresses[0]?.emailAddress },
    create: { id: userId, email: user.emailAddresses[0]?.emailAddress },
  });

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: {
      userType,
      jobType,
      businessName,
      currency: safeCurrency,
      baseHourlyRate: safeBase,
      minHourlyRate: safeMin,
      defaultDeposit: safeDeposit,
      simplifiedUI,
      onboardingComplete: true,
    },
    create: {
      userId,
      userType,
      jobType,
      businessName,
      currency: safeCurrency,
      baseHourlyRate: safeBase,
      minHourlyRate: safeMin,
      defaultDeposit: safeDeposit,
      simplifiedUI: simplifiedUI ?? false,
      onboardingComplete: true,
    },
  });

  return NextResponse.json({ settings });
}
