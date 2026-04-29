import { createHmac } from 'crypto';

export function signOneTapToken(userId: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set');
  const expiresAt = Date.now() + 30_000;
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
    if (sig.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    if (diff !== 0) return null;
    return userId;
  } catch {
    return null;
  }
}
