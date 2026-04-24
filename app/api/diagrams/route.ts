import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const diagrams = await db.diagram.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(
    diagrams.map((d) => ({
      id: d.id,
      name: d.name,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      ...(d.data as object),
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as {
    name?: string;
    components?: Prisma.InputJsonValue;
    connections?: Prisma.InputJsonValue;
    frames?: Prisma.InputJsonValue;
    viewport?: Prisma.InputJsonValue;
  } | null;

  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, components, connections, frames, viewport } = body;
  const safeName = (typeof name === 'string' ? name.trim().slice(0, 256) : undefined) || 'Untitled Diagram 1';

  const userId = session.user.id;

  // Atomic check-and-create to prevent TOCTOU race on free-tier cap
  const diagram = await db.$transaction(async (tx) => {
    const count = await tx.diagram.count({ where: { userId } });
    if (count >= 1) return null;
    return tx.diagram.create({
      data: {
        userId,
        name: safeName,
        data: {
          components: components ?? [],
          connections: connections ?? [],
          frames: frames ?? [],
          viewport: viewport ?? { scale: 1, translateX: 0, translateY: 0 },
        },
      },
    });
  });

  if (!diagram) {
    return NextResponse.json(
      { error: 'Free tier limit: 1 diagram. Upgrade to Pro for unlimited diagrams.' },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      id: diagram.id,
      name: diagram.name,
      createdAt: diagram.createdAt.toISOString(),
      updatedAt: diagram.updatedAt.toISOString(),
      ...(diagram.data as object),
    },
    { status: 201 }
  );
}
