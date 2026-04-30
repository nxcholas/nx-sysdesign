'use client';

import { useRef, useCallback } from 'react';
import type { PlacedComponent, Connection, Frame } from '@/lib/types';

interface ClipboardSnapshot {
  components: PlacedComponent[];
  connections: Connection[];
  frames: Frame[];
}

export function useClipboard(
  getSelectedIds: () => string[],
  getComponents: () => PlacedComponent[],
  getConnections: () => Connection[],
  getFrames: () => Frame[],
  getSelectedFrameId: () => string | null,
  onPaste: (components: PlacedComponent[], connections: Connection[], frames: Frame[]) => void,
) {
  const clipRef = useRef<ClipboardSnapshot | null>(null);
  const pasteCountRef = useRef(0);

  const copy = useCallback(() => {
    const ids = new Set(getSelectedIds());
    const selectedFrameId = getSelectedFrameId();

    // Collect selected frames — start with the explicitly selected frame
    const allFrames = getFrames();
    const selectedFrameIds = new Set<string>();
    if (selectedFrameId) selectedFrameIds.add(selectedFrameId);

    // Also include any frame whose children are entirely within the selected component set
    // (frames implicitly selected via their contained components being selected)
    for (const frame of allFrames) {
      const frameComponents = getComponents().filter((c) => c.frameId === frame.id);
      if (frameComponents.length > 0 && frameComponents.every((c) => ids.has(c.id))) {
        selectedFrameIds.add(frame.id);
      }
    }

    const frames = allFrames.filter((f) => selectedFrameIds.has(f.id));

    if (ids.size === 0 && selectedFrameIds.size === 0) return;

    // Components: include explicitly selected + all components inside selected frames
    const componentIds = new Set(ids);
    for (const frame of frames) {
      for (const comp of getComponents()) {
        if (comp.frameId === frame.id) componentIds.add(comp.id);
      }
    }

    const components = getComponents().filter((c) => componentIds.has(c.id));

    // Connections: keep only those where both endpoints are in the copied set
    const connections = getConnections().filter(
      (c) => componentIds.has(c.sourceId) && componentIds.has(c.targetId)
    );

    clipRef.current = { components, connections, frames };
    pasteCountRef.current = 0;
  }, [getSelectedIds, getSelectedFrameId, getComponents, getConnections, getFrames]);

  const paste = useCallback(() => {
    const clip = clipRef.current;
    if (!clip || (clip.components.length === 0 && clip.frames.length === 0)) return;
    pasteCountRef.current += 1;
    const offset = pasteCountRef.current * 16;

    // Remap component IDs
    const compIdMap = new Map<string, string>();
    clip.components.forEach((c) => compIdMap.set(c.id, crypto.randomUUID()));

    // Remap frame IDs
    const frameIdMap = new Map<string, string>();
    clip.frames.forEach((f) => frameIdMap.set(f.id, crypto.randomUUID()));

    const newFrames = clip.frames.map((f) => ({
      ...f,
      id: frameIdMap.get(f.id)!,
      x: f.x + offset,
      y: f.y + offset,
      // Remap parentFrameId if the parent was also copied
      parentFrameId: f.parentFrameId && frameIdMap.has(f.parentFrameId)
        ? frameIdMap.get(f.parentFrameId)
        : undefined,
    }));

    const newComponents = clip.components.map((c) => ({
      ...c,
      id: compIdMap.get(c.id)!,
      x: c.x + offset,
      y: c.y + offset,
      // Remap frameId if the parent frame was also copied, otherwise clear it
      frameId: c.frameId && frameIdMap.has(c.frameId)
        ? frameIdMap.get(c.frameId)
        : undefined,
      tableData: c.tableData
        ? { ...c.tableData, rows: c.tableData.rows.map((r) => ({ ...r })) }
        : undefined,
    }));

    const newConnections = clip.connections.map((conn) => ({
      ...conn,
      id: crypto.randomUUID(),
      sourceId: compIdMap.get(conn.sourceId)!,
      targetId: compIdMap.get(conn.targetId)!,
    }));

    onPaste(newComponents, newConnections, newFrames);
  }, [onPaste]);

  return { copy, paste };
}
