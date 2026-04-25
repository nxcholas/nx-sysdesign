import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { parseDiagramBody } from '@/lib/diagram-schema';

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

  const body = await parseDiagramBody(req);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, components, connections, frames, viewport } = body;
  const safeName = name?.trim() || undefined;

  // Downgrade enforcement: free users can only save their oldest diagram
  if (session.user.tier !== 'pro') {
    const oldest = await db.diagram.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (oldest && oldest.id !== id) {
      return NextResponse.json({ error: 'Read-only in free tier' }, { status: 403 });
    }
  }

  const updated = await db.diagram.update({
    where: { id, userId: session.user.id },
    data: {
      name: safeName ?? existing.name,
      data: { components, connections, frames, viewport } as never,
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
