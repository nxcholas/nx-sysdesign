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
    let customer;
    try {
      const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
      customer = await stripe.customers.create({
        email: user?.email ?? undefined,
        name: user?.name ?? undefined,
        metadata: { userId },
      });
    } catch (err) {
      console.error('[stripe/checkout] customer create failed:', err);
      return NextResponse.json({ error: 'Failed to create Stripe customer.' }, { status: 500 });
    }
    stripeCustomerId = customer.id;
  }

  const origin =
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000');

  console.log('[stripe/checkout] origin:', origin, '| priceId:', priceId);

  let checkoutSession;
  try {
    checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/app`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[stripe/checkout] session create failed:', message);
    return NextResponse.json({ error: 'Failed to create checkout session.', detail: message }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
