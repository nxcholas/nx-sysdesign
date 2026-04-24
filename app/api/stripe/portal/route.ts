import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
  }

  const origin = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  let portalSession;
  try {
    portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/app`,
    });
  } catch (err) {
    console.error('[stripe/portal] session create failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  return NextResponse.json({ url: portalSession.url });
}
