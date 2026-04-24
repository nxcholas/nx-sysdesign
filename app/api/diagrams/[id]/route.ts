import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const diagram = await db.diagram.findFirst({ where: { id, userId: session.user.id } });
  if (!diagram) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({
    id: diagram.id,
    name: diagram.name,
    createdAt: diagram.createdAt.toISOString(),
    updatedAt: diagram.updatedAt.toISOString(),
    ...(diagram.data as object),
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const existing = await db.diagram.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => null) as {
    name?: string;
    components?: unknown;
    connections?: unknown;
    frames?: unknown;
    viewport?: unknown;
  } | null;

  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, components, connections, frames, viewport } = body;
  const safeName = typeof name === 'string' ? name.trim().slice(0, 256) : undefined;

  const updated = await db.diagram.update({
    where: { id, userId: session.user.id },
    data: {
      name: safeName ?? existing.name,
      data: {
        components: components ?? [],
        connections: connections ?? [],
        frames: frames ?? [],
        viewport: viewport ?? { scale: 1, translateX: 0, translateY: 0 },
      },
    },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    ...(updated.data as object),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const existing = await db.diagram.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await db.diagram.delete({ where: { id, userId: session.user.id } });
  return new NextResponse(null, { status: 204 });
}
