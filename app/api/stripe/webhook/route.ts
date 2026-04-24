import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Resolve userId from customer metadata
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata?.userId;
        if (!userId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = sub.items.data[0]?.current_period_end ?? 0;

        await db.$transaction([
          db.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: sub.status,
              currentPeriodEnd: new Date(periodEnd * 1000),
            },
            update: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: sub.status,
              currentPeriodEnd: new Date(periodEnd * 1000),
            },
          }),
          db.user.update({ where: { id: userId }, data: { tier: 'pro' } }),
        ]);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const existing = await db.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        if (!existing) break;

        const isActive = sub.status === 'active' || sub.status === 'trialing';
        const periodEnd = sub.items.data[0]?.current_period_end ?? 0;
        await db.$transaction([
          db.subscription.update({
            where: { stripeCustomerId: customerId },
            data: {
              status: sub.status,
              currentPeriodEnd: new Date(periodEnd * 1000),
            },
          }),
          db.user.update({
            where: { id: existing.userId },
            data: { tier: isActive ? 'pro' : 'free' },
          }),
        ]);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const existing = await db.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        if (!existing) break;

        await db.$transaction([
          db.subscription.update({
            where: { stripeCustomerId: customerId },
            data: { status: 'canceled' },
          }),
          db.user.update({ where: { id: existing.userId }, data: { tier: 'free' } }),
        ]);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const existing = await db.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        if (!existing) break;

        await db.subscription.update({
          where: { stripeCustomerId: customerId },
          data: { status: 'past_due' },
        });
        break;
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
