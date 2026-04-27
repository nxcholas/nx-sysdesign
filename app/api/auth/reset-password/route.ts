import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.token || !body?.password) {
    return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
  }

  const { token, password } = body as { token: string; password: string };

  if (typeof token !== 'string' || token.length > 512) {
    return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length > 1024) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters and include a number and a special character.' },
      { status: 400 }
    );
  }

  if (!PASSWORD_REGEX.test(password)) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters and include a number and a special character.' },
      { status: 400 }
    );
  }

  const hashedToken = hashToken(token);
  const record = await db.passwordResetToken.findUnique({ where: { token: hashedToken } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired. Please request a new one.' },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
