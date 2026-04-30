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

  // Resend signs webhooks with svix — extract the three required headers.
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
      // Not an inbound email event — acknowledge and ignore.
      return NextResponse.json({ ok: true });
    }
    event = parsed as EmailReceivedEvent;
  } catch (err) {
    console.error('[resend-inbound] Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { email_id, from, subject } = event.data;

  // Fetch the full email body — the webhook payload only carries metadata.
  const { data: received, error: fetchError } = await resend.emails.receiving.get(email_id);
  if (fetchError || !received) {
    console.error('[resend-inbound] Failed to fetch received email:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch email body' }, { status: 500 });
  }

  const forwardSubject = `Fwd: ${subject ?? '(no subject)'}`;
  const originalFrom = from ?? 'Unknown sender';

  const htmlBody = received.html
    ? `<p style="color:#6b7280;font-size:13px;margin-bottom:16px">
         -------- Forwarded message --------<br>
         <strong>From:</strong> ${originalFrom}<br>
         <strong>Subject:</strong> ${subject ?? '(no subject)'}
       </p>
       ${received.html}`
    : undefined;

  const textBody = received.text
    ? `-------- Forwarded message --------\nFrom: ${originalFrom}\nSubject: ${subject ?? '(no subject)'}\n\n${received.text}`
    : `-------- Forwarded message --------\nFrom: ${originalFrom}\nSubject: ${subject ?? '(no subject)'}\n\n(No plain-text body)`;

  try {
    await resend.emails.send({
      from: FROM,
      to: forwardTo,
      subject: forwardSubject,
      ...(htmlBody ? { html: htmlBody } : {}),
      text: textBody,
      // replyTo so replying from Gmail addresses the original sender directly.
      replyTo: originalFrom,
    });
  } catch (err) {
    console.error('[resend-inbound] Forward send failed:', err);
    return NextResponse.json({ error: 'Failed to forward email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
