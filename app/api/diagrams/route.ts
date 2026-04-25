import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { parseDiagramBody } from '@/lib/diagram-schema';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const diagrams = await db.diagram.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  type DiagramRow = (typeof diagrams)[number];
  return NextResponse.json(
    diagrams.map((d: DiagramRow) => ({
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

  const body = await parseDiagramBody(req);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, components, connections, frames, viewport } = body;
  const safeName = (name?.trim()) || 'Untitled Diagram 1';

  const userId = session.user.id;

  // Atomic check-and-create — limit is tier-aware
  type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];
  const diagram = await db.$transaction(async (tx: Tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { tier: true } });
    const isPro = user?.tier === 'pro';
    if (!isPro) {
      const count = await tx.diagram.count({ where: { userId } });
      if (count >= 1) return null;
    }
    return tx.diagram.create({
      data: {
        userId,
        name: safeName,
        data: { components, connections, frames, viewport } as never,
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
