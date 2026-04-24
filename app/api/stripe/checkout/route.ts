import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as { priceId?: string } | null;
  const priceId = body?.priceId;
  if (!priceId) {
    return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
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

  const origin = req.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    ui_mode: 'form',
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    return_url: `${origin}/app?checkout=success`,
  });

  return NextResponse.json({ clientSecret: checkoutSession.client_secret });
}
