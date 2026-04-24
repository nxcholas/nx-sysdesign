import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { status: true, currentPeriodEnd: true },
  });

  if (!subscription) {
    return NextResponse.json({ status: null });
  }

  return NextResponse.json({
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
  });
}
