import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { slug },
    include: { packages: true, paymentPlans: true },
  });

  if (!quote) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { itemsJson, ...rest } = quote as { itemsJson: unknown };
  return NextResponse.json({
    quote: { ...rest, items: itemsJson ?? [], packages: quote.packages, paymentPlans: quote.paymentPlans },
  });
}
