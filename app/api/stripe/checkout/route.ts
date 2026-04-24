import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ALLOWED_PRICE_IDS = new Set([
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  ]);

  const body = await req.json().catch(() => null) as { priceId?: string } | null;
  const priceId = body?.priceId;
  if (!priceId || !ALLOWED_PRICE_IDS.has(priceId)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  const userId = session.user.id;

  // Get or create Stripe customer
  let stripeCustomerId: string;
  const existing = await db.subscription.findUnique({ where: { userId } });

  if (existing?.stripeCustomerId) {
    stripeCustomerId = existing.stripeCustomerId;
  } else {
    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    const customer = await stripe.customers.create({
      email: user?.email ?? undefined,
      name: user?.name ?? undefined,
      metadata: { userId },
    });
    stripeCustomerId = customer.id;
  }

  const origin = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${origin}/app?checkout=success`,
    cancel_url: `${origin}/app`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
