import { auth, currentUser } from '@clerk/nextjs/server';
import type { Prisma, Quote as PrismaQuote, QuotePackage, PaymentPlan } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/slug';

type QuoteItem = { description: string; amount: number };
type QuoteWithRelations = PrismaQuote & {
  packages?: QuotePackage[];
  paymentPlans?: PaymentPlan[];
  itemsJson?: Prisma.JsonValue | null;
};

function serializeQuote(quote: QuoteWithRelations) {
  const { itemsJson, packages = [], paymentPlans = [], ...rest } = quote;
  const items = (itemsJson as QuoteItem[] | null) ?? [];
  return { ...rest, items, packages, paymentPlans };
}

async function uniqueSlug() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = generateSlug(8);
    const existing = await prisma.quote.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  throw new Error('Could not generate unique slug');
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const quotes = await prisma.quote.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { packages: true, paymentPlans: true },
  });

  return NextResponse.json({ quotes: quotes.map(serializeQuote) });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    clientName?: string;
    projectTitle?: string;
    totalAmount?: number | null;
    rawNotes?: string;
    items?: QuoteItem[];
    aiSummary?: string;
    packages?: {
      name: string;
      price: number;
      description: string;
      features: string[];
      isRecommended?: boolean;
      timeline?: string;
      revisions?: string;
      supportLevel?: string;
    }[];
    paymentPlans?: { type: string; deposit: number; total: number }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retainerNegotiation?: any;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { clientName, projectTitle, totalAmount, rawNotes, items, aiSummary, packages, paymentPlans, retainerNegotiation } = body ?? {};

  if (!clientName || !projectTitle) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Ensure user exists for relation
    await prisma.user.upsert({
      where: { id: userId },
      update: { email: user.emailAddresses[0]?.emailAddress },
      create: {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress,
      },
    });

    const slug = await uniqueSlug();

    const baseTotal = totalAmount ?? (items ?? []).reduce((sum, i) => sum + i.amount, 0) ?? 0;

    const packagesSeed =
      packages?.length
        ? packages
        : [
          {
            name: 'Essential',
            price: Math.max(baseTotal * 0.9, 500),
            description: 'Lean scope to ship quickly.',
            features: ['Core deliverables', 'Email support', '1 revision'],
            isRecommended: false,
          },
          {
            name: 'Recommended',
            price: Math.max(baseTotal, 750),
            description: 'Balanced scope and polish.',
            features: ['Everything in Essential', 'Polish & QA', '2 revisions'],
            isRecommended: true,
          },
          {
            name: 'Complete',
            price: Math.max(baseTotal * 1.4, 1000),
            description: 'Premium experience and priority.',
            features: ['Everything in Recommended', 'Priority support', 'Launch assistance'],
            isRecommended: false,
          },
        ];

    const paymentPlansSeed =
      paymentPlans?.length
        ? paymentPlans
        : [
          { type: 'light', deposit: Math.round(baseTotal * 0.3), total: Math.round(baseTotal) },
          { type: 'balanced', deposit: Math.round(baseTotal * 0.5), total: Math.round(baseTotal) },
          { type: 'full', deposit: Math.round(baseTotal), total: Math.round(baseTotal * 0.95) },
        ];

    const quote = await prisma.quote.create({
      data: {
        userId,
        slug,
        status: 'Draft',
        clientName,
        projectTitle,
        totalAmount: baseTotal || null,
        rawNotes,
        aiSummary,
        itemsJson: items ?? [],
        retainerNegotiation: retainerNegotiation ?? undefined,
        packages: {
          create: packagesSeed,
        },
        paymentPlans: {
          create: paymentPlansSeed,
        },
      },
      include: { packages: true, paymentPlans: true },
    });

    return NextResponse.json({ quote: serializeQuote(quote) }, { status: 201 });
  } catch (error) {
    console.error('Failed to create quote', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}
