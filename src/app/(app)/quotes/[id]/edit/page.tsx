import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditQuoteClient from './EditQuoteClient';

export default async function EditQuotePage({ params }: { params: { id: string } }) {
    const { userId } = await auth();
    if (!userId) return <div>Unauthorized</div>;

    const { id } = params;

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
    return <EditQuoteClient quote={serializedQuote as any} />;
}
