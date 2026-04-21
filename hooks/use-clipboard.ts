'use client';

import { useRef, useCallback } from 'react';
import type { PlacedComponent, Connection } from '@/lib/types';

interface ClipboardSnapshot {
  components: PlacedComponent[];
  connections: Connection[];
}

export function useClipboard(
  getSelectedIds: () => string[],
  getComponents: () => PlacedComponent[],
  getConnections: () => Connection[],
  onPaste: (components: PlacedComponent[], connections: Connection[]) => void,
) {
  const clipRef = useRef<ClipboardSnapshot | null>(null);
  const pasteCountRef = useRef(0);

  const copy = useCallback(() => {
    const ids = new Set(getSelectedIds());
    if (ids.size === 0) return;
    const components = getComponents().filter((c) => ids.has(c.id));
    const connections = getConnections().filter(
      (c) => ids.has(c.sourceId) && ids.has(c.targetId)
    );
    clipRef.current = { components, connections };
    pasteCountRef.current = 0;
  }, [getSelectedIds, getComponents, getConnections]);

  const paste = useCallback(() => {
    const clip = clipRef.current;
    if (!clip || clip.components.length === 0) return;
    pasteCountRef.current += 1;
    const offset = pasteCountRef.current * 16;

    const idMap = new Map<string, string>();
    clip.components.forEach((c) => idMap.set(c.id, crypto.randomUUID()));

    const newComponents = clip.components.map((c) => ({
      ...c,
      id: idMap.get(c.id)!,
      x: c.x + offset,
      y: c.y + offset,
      frameId: undefined,
      tableData: c.tableData
        ? { ...c.tableData, rows: c.tableData.rows.map((r) => ({ ...r })) }
        : undefined,
    }));
    const newConnections = clip.connections.map((conn) => ({
      ...conn,
      id: crypto.randomUUID(),
      sourceId: idMap.get(conn.sourceId)!,
      targetId: idMap.get(conn.targetId)!,
    }));

    onPaste(newComponents, newConnections);
  }, [onPaste]);

  return { copy, paste };
}
