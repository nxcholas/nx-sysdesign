'use client';

import { useState, useRef, useCallback, type RefObject } from 'react';
import type { CanvasTransform, PlacedComponent, Frame, CanvasTool } from '@/lib/types';
import { screenToCanvas, snapToGrid } from '@/lib/canvas-utils';
import { findOverlappingComponents } from '@/lib/frame-utils';
import { FRAME_DEFAULT_LABEL, FRAME_MIN_WIDTH, FRAME_MIN_HEIGHT } from '@/lib/constants';

export interface FrameDrawRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useFrameDraw(
  canvasRef: RefObject<HTMLElement | null>,
  transform: CanvasTransform,
  placedComponents: PlacedComponent[],
  addFrame: (payload: Omit<Frame, 'id' | 'zIndex'>, childIds?: string[]) => void,
  setActiveTool: (tool: CanvasTool) => void,
) {
  const [frameDrawRect, setFrameDrawRect] = useState<FrameDrawRect | null>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    didDrag: boolean;
  }>({ active: false, startX: 0, startY: 0, didDrag: false });
  const endRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleFramePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = screenToCanvas(e.clientX, e.clientY, rect, transform);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { active: true, startX: pos.x, startY: pos.y, didDrag: false };
      endRef.current = { x: pos.x, y: pos.y };
    },
    [canvasRef, transform],
  );

  const handleFramePointerMove = useCallback(
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

      endRef.current = { x: pos.x, y: pos.y };
      const { startX, startY } = dragRef.current;
      const { x: ex, y: ey } = endRef.current;
      setFrameDrawRect({
        x: Math.min(startX, ex),
        y: Math.min(startY, ey),
        width: Math.abs(ex - startX),
        height: Math.abs(ey - startY),
      });
    },
    [canvasRef, transform],
  );

  const handleFramePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      setFrameDrawRect(null);

      if (!dragRef.current.didDrag) return;

      const { startX, startY } = dragRef.current;
      const { x: ex, y: ey } = endRef.current;

      const rawX = Math.min(startX, ex);
      const rawY = Math.min(startY, ey);
      const rawW = Math.abs(ex - startX);
      const rawH = Math.abs(ey - startY);

      const x = snapToGrid(rawX);
      const y = snapToGrid(rawY);
      const width = Math.max(FRAME_MIN_WIDTH, snapToGrid(rawW));
      const height = Math.max(FRAME_MIN_HEIGHT, snapToGrid(rawH));

      const drawRect = { x: rawX, y: rawY, width: rawW, height: rawH };
      const overlapping = findOverlappingComponents(drawRect, placedComponents);
      const childIds = overlapping.map((c) => c.id);

      addFrame(
        { label: FRAME_DEFAULT_LABEL, x, y, width, height },
        childIds.length > 0 ? childIds : undefined,
      );
      setActiveTool('select');
    },
    [placedComponents, addFrame, setActiveTool],
  );

  return {
    frameDrawRect,
    handleFramePointerDown,
    handleFramePointerMove,
    handleFramePointerUp,
  };
}
