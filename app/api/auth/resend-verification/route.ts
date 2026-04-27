import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, emailVerified: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: 'Email is already verified.' }, { status: 400 });
  }

  // Invalidate any existing unused verification tokens
  await db.emailVerificationToken.updateMany({
    where: { userId: session.user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Generate new 6-digit OTP (15 min expiry)
  const otp = generateOtp();
  const hashedOtp = hashCode(otp);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.emailVerificationToken.create({
    data: {
      token: hashedOtp,
      userId: session.user.id,
      expiresAt,
    },
  });

  await sendVerificationEmail(user.email, user.name, otp);

  return NextResponse.json({ success: true });
}
