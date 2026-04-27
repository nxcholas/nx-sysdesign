import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code.trim() : '';

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Please enter a valid 6-digit code.' }, { status: 400 });
  }

  // Find the most recent unused, unexpired token for this user
  const record = await db.emailVerificationToken.findFirst({
    where: {
      userId: session.user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return NextResponse.json(
      { error: 'Your code has expired. Please request a new one.' },
      { status: 400 }
    );
  }

  // Check attempt limit
  if (record.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: 'Too many incorrect attempts. Please request a new code.', locked: true },
      { status: 400 }
    );
  }

  const hashed = hashCode(code);

  if (hashed !== record.token) {
    // Atomic increment — read the post-increment value to eliminate race conditions
    const { attempts: newAttempts } = await db.emailVerificationToken.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });

    const remaining = MAX_ATTEMPTS - newAttempts;
    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new code.', locked: true },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
      { status: 400 }
    );
  }

  // Correct code — commit verification in a transaction
  const user = await db.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: session.user.id },
      data: { emailVerified: new Date() },
      select: { email: true, name: true },
    });
    await tx.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    return updated;
  });

  await sendWelcomeEmail(user.email, user.name);

  return NextResponse.json({ success: true });
}
