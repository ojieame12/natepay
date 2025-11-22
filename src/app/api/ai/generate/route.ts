import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateQuoteDetails } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { projectTitle?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { projectTitle, notes } = body ?? {};
  if (!projectTitle) {
    return NextResponse.json({ error: 'projectTitle is required' }, { status: 400 });
  }

  const settings = await prisma.userSettings.findUnique({ where: { userId } });

  try {
    const result = await generateQuoteDetails(projectTitle, notes ?? '', {
      businessName: settings?.businessName ?? undefined,
      currency: settings?.currency ?? 'USD',
      baseHourlyRate: settings?.baseHourlyRate ?? undefined,
      minHourlyRate: settings?.minHourlyRate ?? undefined,
      defaultDeposit: settings?.defaultDeposit ?? undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI generation failed', error);
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 });
  }
}
