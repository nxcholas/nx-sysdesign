import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sendBugReportEmail } from '@/lib/email';
import {
  checkRateLimit,
  getClientIp,
  FEEDBACK_LIMIT,
  FEEDBACK_WINDOW_MS,
} from '@/lib/rate-limit';

const MAX_DESCRIPTION = 4000;
const MAX_STEPS = 4000;
const MAX_DIAGRAM_ID = 64;
const MAX_DIAGRAM_NAME = 200;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { description, stepsToReproduce, diagramId, diagramName } = body as {
    description?: unknown;
    stepsToReproduce?: unknown;
    diagramId?: unknown;
    diagramName?: unknown;
  };

  if (typeof description !== 'string') {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }

  const trimmedDescription = description.trim();
  if (trimmedDescription.length === 0) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }
  if (trimmedDescription.length > MAX_DESCRIPTION) {
    return NextResponse.json(
      { error: `Description must be ${MAX_DESCRIPTION} characters or fewer` },
      { status: 400 },
    );
  }

  let safeSteps: string | null = null;
  if (stepsToReproduce !== undefined && stepsToReproduce !== null && stepsToReproduce !== '') {
    if (typeof stepsToReproduce !== 'string') {
      return NextResponse.json({ error: 'Invalid steps to reproduce' }, { status: 400 });
    }
    const trimmed = stepsToReproduce.trim();
    if (trimmed.length > MAX_STEPS) {
      return NextResponse.json(
        { error: `Steps must be ${MAX_STEPS} characters or fewer` },
        { status: 400 },
      );
    }
    safeSteps = trimmed.length > 0 ? trimmed : null;
  }

  let safeDiagramId: string | null = null;
  if (diagramId !== undefined && diagramId !== null && diagramId !== '') {
    if (typeof diagramId !== 'string' || diagramId.length > MAX_DIAGRAM_ID) {
      return NextResponse.json({ error: 'Invalid diagram id' }, { status: 400 });
    }
    safeDiagramId = diagramId;
  }

  let safeDiagramName: string | null = null;
  if (diagramName !== undefined && diagramName !== null && diagramName !== '') {
    if (typeof diagramName !== 'string' || diagramName.length > MAX_DIAGRAM_NAME) {
      return NextResponse.json({ error: 'Invalid diagram name' }, { status: 400 });
    }
    safeDiagramName = diagramName;
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, 'feedback:bug', FEEDBACK_LIMIT, FEEDBACK_WINDOW_MS);
  if (!rl.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: "You've hit the daily limit. Please try again tomorrow." },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  // Always source identity from the session, never from the client body.
  const sessionUser = session.user as {
    id: string;
    email?: string | null;
    tier?: string | null;
  };

  try {
    await sendBugReportEmail({
      user: {
        id: sessionUser.id,
        email: sessionUser.email ?? null,
        tier: sessionUser.tier ?? null,
      },
      diagram: {
        id: safeDiagramId,
        name: safeDiagramName,
      },
      description: trimmedDescription,
      stepsToReproduce: safeSteps,
    });
  } catch (err) {
    console.error('[feedback/bug] send failed:', err);
    return NextResponse.json(
      { error: 'Could not send your bug report. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
