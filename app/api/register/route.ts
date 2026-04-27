import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { track } from '@vercel/analytics/server';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { name, email, password } = body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (normalizedEmail.length > 254) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  if (name && name.trim().length > 128) {
    return NextResponse.json({ error: 'Name must be 128 characters or fewer.' }, { status: 400 });
  }

  if (password.length > 1024 || !PASSWORD_REGEX.test(password)) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters and include a number and a special character.' },
      { status: 400 }
    );
  }

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json(
      { error: 'An account with that email already exists.' },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);
  const trimmedName = name?.trim() || null;

  const user = await db.user.create({
    data: {
      name: trimmedName,
      email: normalizedEmail,
      password: hashed,
    },
  });

  await track('account_created');

  // Generate 6-digit OTP (15 min expiry)
  const otp = generateOtp();
  const hashedOtp = hashCode(otp);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.emailVerificationToken.create({
    data: {
      token: hashedOtp,
      userId: user.id,
      expiresAt,
    },
  });

  await sendVerificationEmail(normalizedEmail, trimmedName, otp);

  return NextResponse.json({ success: true }, { status: 201 });
}
