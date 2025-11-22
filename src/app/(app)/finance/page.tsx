import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import FinanceClient from './FinanceClient';
import { prisma } from '@/lib/prisma';

export default async function FinancePage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();
  if (!userId) return <div>Unauthorized</div>;

  // Ensure user record exists
  await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
    },
    create: {
      id: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
    },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return <FinanceClient stripeAccountId={user?.stripeAccountId} />;
}
