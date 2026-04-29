import { NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createHmac } from 'crypto';
import { db } from '@/lib/db';

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

// Signs a short-lived token binding userId + expiry so the Credentials authorize()
// can trust it came from this server and not from a client-supplied userId.
function signOneTapToken(userId: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set');
  const expiresAt = Date.now() + 30_000; // 30 second window
  const payload = `${userId}:${expiresAt}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}:${sig}`;
}

export function verifyOneTapToken(token: string): string | null {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;
    const parts = token.split(':');
    if (parts.length !== 3) return null;
    const [userId, expiresAtStr, sig] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;
    const payload = `${userId}:${expiresAt}`;
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    // Constant-time comparison to prevent timing attacks
    if (sig.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    if (diff !== 0) return null;
    return userId;
  } catch {
    return null;
  }
}

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

  // Validate required fields before trusting the payload
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

  // Upsert user — find by email or create, then ensure Account row exists for google provider
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

  // Ensure an Account row exists for this Google sub so the OAuth flow stays consistent
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
