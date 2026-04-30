import { NextResponse } from 'next/server';
import { sendQuestionEmail } from '@/lib/email';
import {
  checkRateLimit,
  getClientIp,
  FEEDBACK_LIMIT,
  FEEDBACK_WINDOW_MS,
} from '@/lib/rate-limit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 4000;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email, message } = body as {
    name?: unknown;
    email?: unknown;
    message?: unknown;
  };

  if (typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  if (trimmedMessage.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: `Message must be ${MAX_MESSAGE} characters or fewer` },
      { status: 400 },
    );
  }

  let safeName: string | null = null;
  if (name !== undefined && name !== null && name !== '') {
    if (typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    const trimmed = name.trim();
    if (trimmed.length > MAX_NAME) {
      return NextResponse.json(
        { error: `Name must be ${MAX_NAME} characters or fewer` },
        { status: 400 },
      );
    }
    safeName = trimmed.length > 0 ? trimmed : null;
  }

  let safeEmail: string | null = null;
  if (email !== undefined && email !== null && email !== '') {
    if (typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    const trimmed = email.trim();
    if (trimmed.length > 0) {
      if (trimmed.length > MAX_EMAIL || !EMAIL_REGEX.test(trimmed)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }
      safeEmail = trimmed;
    }
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, 'feedback:question', FEEDBACK_LIMIT, FEEDBACK_WINDOW_MS);
  if (!rl.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: "You've hit the daily limit. Please try again tomorrow." },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  try {
    await sendQuestionEmail({
      name: safeName,
      email: safeEmail,
      message: trimmedMessage,
    });
  } catch (err) {
    console.error('[feedback/question] send failed:', err);
    return NextResponse.json(
      { error: 'Could not send your message. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
