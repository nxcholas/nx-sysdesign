import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// NextAuth's own internal routes must never be rate-limited — they handle session fetches,
// CSRF tokens, OAuth callbacks, and sign-out. Blocking them produces ClientFetchError and
// breaks the URL constructor inside NextAuth's redirect logic.

// Diagram save limiter: 60 requests per 60 seconds per IP
const diagramRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '60 s'),
  analytics: false,
  prefix: 'rl:diagrams',
});

// Application API limiter (non-auth, non-diagram routes): 30 requests per 60 seconds per IP.
// Raised from 12/45s — the previous limit was too aggressive for normal session activity.
const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'),
  analytics: false,
  prefix: 'rl:api',
});

// Per-email limiter for registration and forgot-password: 5 requests per 15 minutes per address.
// Applied on top of IP limiting to stop proxy-rotation abuse on those specific endpoints.
const emailRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: false,
  prefix: 'rl:email',
});

// Strict limiter for One Tap credential submission: 10 requests per 60 seconds per IP.
// Tighter than the general API limit since this is an auth credential endpoint.
const oneTapRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: false,
  prefix: 'rl:onetap',
});

// App-level auth endpoints that accept an email body (not NextAuth internals)
const EMAIL_KEYED_PATHS = ['/api/register', '/api/auth/forgot-password'];

function isNextAuthPath(pathname: string): boolean {
  // Excludes all /api/auth/* except our own app-level routes under that prefix.
  // Our app routes: /api/auth/verify-code, /api/auth/resend-verification,
  // /api/auth/forgot-password, /api/auth/reset-password, /api/auth/one-tap
  // NextAuth internals: /api/auth/session, /api/auth/csrf, /api/auth/signout,
  // /api/auth/callback/*, /api/auth/providers, /api/auth/[...nextauth]
  const NEXTAUTH_INTERNAL = [
    '/api/auth/session',
    '/api/auth/csrf',
    '/api/auth/signout',
    '/api/auth/signin',
    '/api/auth/callback/',
    '/api/auth/providers',
    '/api/auth/error',
  ];
  return NEXTAUTH_INTERNAL.some((p) => pathname === p || pathname.startsWith(p));
}

function isDiagramPath(pathname: string): boolean {
  return pathname.startsWith('/api/diagrams/') || pathname === '/api/diagrams';
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',').at(0)?.trim() ?? '127.0.0.1';
}

function rateLimitResponse(limit: number, remaining: number, reset: number) {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(retryAfter),
      },
    }
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isApiPath(pathname)) {
    return NextResponse.next();
  }

  // Never rate-limit NextAuth's own session/csrf/callback/signout routes
  if (isNextAuthPath(pathname)) {
    return NextResponse.next();
  }

  const ip = getIp(req);

  // One Tap credential endpoint: stricter auth-specific limiter
  if (pathname === '/api/auth/one-tap') {
    const { success, limit, remaining, reset } = await oneTapRatelimit.limit(ip);
    if (!success) return rateLimitResponse(limit, remaining, reset);
    return NextResponse.next();
  }

  // Diagram endpoints: dedicated higher-throughput limiter
  if (isDiagramPath(pathname)) {
    const { success, limit, remaining, reset } = await diagramRatelimit.limit(ip);
    if (!success) return rateLimitResponse(limit, remaining, reset);
    return NextResponse.next();
  }

  // All other app API routes: general IP-based limiter
  const { success, limit, remaining, reset } = await apiRatelimit.limit(ip);
  if (!success) return rateLimitResponse(limit, remaining, reset);

  // For email-body auth routes: also apply a per-email limit to stop proxy rotation abuse
  if (EMAIL_KEYED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    try {
      const cloned = req.clone();
      const body = await cloned.json().catch(() => null);
      const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : null;
      if (email && email.length <= 254) {
        const emailResult = await emailRatelimit.limit(`email:${email}`);
        if (!emailResult.success) {
          return rateLimitResponse(emailResult.limit, emailResult.remaining, emailResult.reset);
        }
      }
    } catch {
      // Body parse failure is handled by the route handler itself
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
