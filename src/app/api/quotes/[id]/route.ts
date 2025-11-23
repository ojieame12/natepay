import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    const quote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!quote || quote.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.quote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Quote Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const body = await req.json();

    const quote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!quote || quote.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Allow updating status, clientName, projectTitle for now
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        status: body.status,
        clientName: body.clientName,
        projectTitle: body.projectTitle,
        mode: body.mode,
        itemsJson: body.items ?? undefined,
        retainerNegotiation: body.retainerNegotiation ?? undefined,
      },
    });

    return NextResponse.json({ quote: updatedQuote });
  } catch (error) {
    console.error('Update Quote Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
