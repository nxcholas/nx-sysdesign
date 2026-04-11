'use client';

import { useState, useRef, useCallback, type RefObject } from 'react';
import type { CanvasTransform, PlacedComponent, SelectionRect } from '@/lib/types';
import { screenToCanvas, rectsIntersect } from '@/lib/canvas-utils';

export function useMarqueeSelect(
  canvasRef: RefObject<HTMLElement | null>,
  transform: CanvasTransform,
  placedComponents: PlacedComponent[],
  selectMany: (ids: string[]) => void,
  selectComponent: (id: string | null) => void,
  selectConnection: (id: string | null) => void,
) {
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    didDrag: boolean;
  }>({ active: false, startX: 0, startY: 0, didDrag: false });
  const endRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const didMarqueeRef = useRef(false);

  const handleSelectionPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = screenToCanvas(e.clientX, e.clientY, rect, transform);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      didMarqueeRef.current = false;
      dragRef.current = { active: true, startX: pos.x, startY: pos.y, didDrag: false };
      endRef.current = { x: pos.x, y: pos.y };
      setSelectionRect({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });
    },
    [canvasRef, transform],
  );

  const handleSelectionPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = screenToCanvas(e.clientX, e.clientY, rect, transform);

      if (!dragRef.current.didDrag) {
        const dx = pos.x - dragRef.current.startX;
        const dy = pos.y - dragRef.current.startY;
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
        dragRef.current.didDrag = true;
      }

      didMarqueeRef.current = true;
      endRef.current = { x: pos.x, y: pos.y };
      setSelectionRect({
        startX: dragRef.current.startX,
        startY: dragRef.current.startY,
        endX: pos.x,
        endY: pos.y,
      });
    },
    [canvasRef, transform],
  );

  const handleSelectionPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

      if (!dragRef.current.didDrag) {
        // Click without drag — deselect all
        selectComponent(null);
        selectConnection(null);
        didMarqueeRef.current = true;
      } else {
        // Normalize rectangle from refs (avoids stale closure)
        const { startX, startY } = dragRef.current;
        const { x: ex, y: ey } = endRef.current;
        const x = Math.min(startX, ex);
        const y = Math.min(startY, ey);
        const w = Math.abs(ex - startX);
        const h = Math.abs(ey - startY);
        const selRect = { x, y, width: w, height: h };

        const matchedIds = placedComponents
          .filter((c) =>
            rectsIntersect(selRect, { x: c.x, y: c.y, width: c.width, height: c.height }),
          )
          .map((c) => c.id);

        selectMany(matchedIds);
      }

      setSelectionRect(null);
    },
    [placedComponents, selectMany, selectComponent, selectConnection],
  );

  return {
    selectionRect,
    didMarqueeRef,
    handleSelectionPointerDown,
    handleSelectionPointerMove,
    handleSelectionPointerUp,
  };
}
