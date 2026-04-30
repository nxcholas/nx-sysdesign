import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import type { EmailReceivedEvent } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'NX-Design <noreply@nxdesign.app>';

export async function POST(req: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  const forwardTo = process.env.RESEND_FORWARD_TO;

  if (!webhookSecret) {
    console.error('[resend-inbound] RESEND_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Misconfigured' }, { status: 500 });
  }
  if (!forwardTo) {
    console.error('[resend-inbound] RESEND_FORWARD_TO is not set');
    return NextResponse.json({ error: 'Misconfigured' }, { status: 500 });
  }

  const payload = await req.text();

  const svixId        = req.headers.get('svix-id') ?? '';
  const svixTimestamp = req.headers.get('svix-timestamp') ?? '';
  const svixSignature = req.headers.get('svix-signature') ?? '';

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing webhook signature headers' }, { status: 400 });
  }

  let event: EmailReceivedEvent;
  try {
    const parsed = resend.webhooks.verify({
      payload,
      headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
      webhookSecret,
    });
    if (parsed.type !== 'email.received') {
      return NextResponse.json({ ok: true });
    }
    event = parsed as EmailReceivedEvent;
  } catch (err) {
    console.error('[resend-inbound] Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { email_id } = event.data;

  // Use the SDK's built-in forward() — handles body fetching internally.
  // passthrough: true preserves the original email headers/body as-is.
  const { error: forwardError } = await resend.emails.receiving.forward({
    emailId: email_id,
    to: forwardTo,
    from: FROM,
    passthrough: true,
  });

  if (forwardError) {
    console.error('[resend-inbound] Forward failed:', forwardError);
    return NextResponse.json({ error: 'Failed to forward email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
