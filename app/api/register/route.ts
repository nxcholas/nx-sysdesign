import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;

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

  if (!PASSWORD_REGEX.test(password)) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters and include a number and a special character.' },
      { status: 400 }
    );
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'An account with that email already exists.' },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  await db.user.create({
    data: {
      name: name?.trim() || null,
      email,
      password: hashed,
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
