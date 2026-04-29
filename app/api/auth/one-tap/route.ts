import { NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { db } from '@/lib/db';
import { signOneTapToken } from '@/lib/one-tap-token';

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.credential !== 'string') {
    return NextResponse.json({ error: 'Missing credential.' }, { status: 400 });
  }

  const clientId = process.env.AUTH_GOOGLE_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }

  let payload: {
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
    picture?: string;
  };

  try {
    const { payload: verified } = await jwtVerify(body.credential, GOOGLE_JWKS, {
      audience: clientId,
      issuer: 'https://accounts.google.com',
    });
    payload = verified as typeof payload;
  } catch {
    return NextResponse.json({ error: 'Invalid credential.' }, { status: 401 });
  }

  if (typeof payload.email_verified !== 'boolean' || !payload.email_verified) {
    return NextResponse.json({ error: 'Google email not verified.' }, { status: 401 });
  }

  if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.trim().length === 0) {
    return NextResponse.json({ error: 'Invalid credential.' }, { status: 401 });
  }

  if (!payload.email || typeof payload.email !== 'string') {
    return NextResponse.json({ error: 'Invalid credential.' }, { status: 401 });
  }

  const email = payload.email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Invalid credential.' }, { status: 401 });
  }

  const sub = payload.sub.trim();

  const user = await db.user.upsert({
    where: { email },
    create: {
      email,
      name: payload.name ?? null,
      image: payload.picture ?? null,
      emailVerified: new Date(),
    },
    update: {
      emailVerified: new Date(),
      ...(payload.picture ? { image: payload.picture } : {}),
    },
  });

  await db.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: 'google',
        providerAccountId: sub,
      },
    },
    create: {
      userId: user.id,
      type: 'oidc',
      provider: 'google',
      providerAccountId: sub,
    },
    update: {},
  });

  // Return a signed token instead of the raw userId — the Credentials authorize()
  // verifies the HMAC signature so a raw userId cannot be replayed client-side.
  const oneTapToken = signOneTapToken(user.id);
  return NextResponse.json({ oneTapToken });
}
