import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quoteId, type } = body as { quoteId?: string; type?: string };

    if (!quoteId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'VIEW') {
      await prisma.quote.update({
        where: { id: quoteId },
        data: { views: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
