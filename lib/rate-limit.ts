// Simple in-memory IP rate limiter.
// Per-instance only — on Vercel multiple lambdas may run, so the effective
// limit is "soft" (limit * N instances). Acceptable per the chosen approach;
// upgrade path is to swap internals to Upstash/Vercel KV without changing callers.

export const FEEDBACK_LIMIT = 3;
export const FEEDBACK_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  ip: string,
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const mapKey = `${key}:${ip}`;
  const existing = store.get(mapKey);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(mapKey, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
