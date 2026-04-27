import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.email || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const email = body.email.toLowerCase().trim();

  if (email.length > 254) {
    return NextResponse.json({ success: true }); // don't reveal validation failure
  }

  const user = await db.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user || !user.password) {
    return NextResponse.json({ success: true });
  }

  // Invalidate any existing unused tokens for this user
  await db.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.passwordResetToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt,
    },
  });

  await sendPasswordResetEmail(user.email, rawToken);

  return NextResponse.json({ success: true });
}
