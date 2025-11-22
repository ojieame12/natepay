import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import QuoteDetailClient from './QuoteDetailClient';

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    if (!userId) return <div>Unauthorized</div>;

    const { id } = await params;

    const quote = await prisma.quote.findUnique({
        where: { id },
        include: {
            packages: true,
            paymentPlans: true,
        },
    });

    if (!quote || quote.userId !== userId) {
        notFound();
    }

    // Serialize dates
    const serializedQuote = {
        ...quote,
        createdAt: quote.createdAt.toISOString(),
        expiresAt: quote.expiresAt?.toISOString() || null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <QuoteDetailClient quote={serializedQuote as any} />;
}
