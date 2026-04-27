import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

async function createStripeCustomer(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  const customer = await stripe.customers.create({
    email: user?.email ?? undefined,
    name: user?.name ?? undefined,
    metadata: { userId },
  });
  return customer.id;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const MONTHLY_PRICE_ID = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const ANNUAL_PRICE_ID = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
  const ALLOWED_PRICE_IDS = new Set([MONTHLY_PRICE_ID, ANNUAL_PRICE_ID]);

  const body = await req.json().catch(() => null) as { priceId?: string } | null;
  const priceId = body?.priceId;
  if (!priceId || !ALLOWED_PRICE_IDS.has(priceId)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  const userId = session.user.id;

  // Get or create a valid live-mode Stripe customer
  let stripeCustomerId: string;
  const existing = await db.subscription.findUnique({ where: { userId } });

  if (existing?.stripeCustomerId) {
    stripeCustomerId = existing.stripeCustomerId;
  } else {
    try {
      stripeCustomerId = await createStripeCustomer(userId);
    } catch (err) {
      console.error('[stripe/checkout] customer create failed:', err);
      return NextResponse.json({ error: 'Failed to create Stripe customer.' }, { status: 500 });
    }
  }

  const origin =
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000');

  const interval = priceId === MONTHLY_PRICE_ID ? 'monthly' : 'yearly';
  const successUrl = `${origin}/canvas?checkout=success&interval=${interval}`;
  const cancelUrl = `${origin}/canvas`;

  let checkoutSession;
  try {
    checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  } catch (err) {
    // If the stored customer ID is stale (e.g. from test mode), delete it and retry once with a fresh customer.
    if (err instanceof Stripe.errors.StripeInvalidRequestError && err.message.includes('No such customer')) {
      console.warn('[stripe/checkout] stale customer ID detected, recreating:', stripeCustomerId);
      try {
        await db.subscription.deleteMany({ where: { userId } });
        stripeCustomerId = await createStripeCustomer(userId);
        checkoutSession = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          line_items: [{ price: priceId, quantity: 1 }],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
      } catch (retryErr) {
        console.error('[stripe/checkout] retry after stale customer failed:', retryErr);
        return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
      }
    } else {
      console.error('[stripe/checkout] session create failed:', err);
      return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
    }
  }

  return NextResponse.json({ url: checkoutSession.url });
}
