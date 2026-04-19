'use client';

import { useState, useRef, useCallback, type RefObject } from 'react';
import type { CanvasTransform, PaletteItemKind, CanvasTool, ShapeKind, PlacedComponent } from '@/lib/types';
import { screenToCanvas, snapToGrid } from '@/lib/canvas-utils';
import { SHAPE_MIN_WIDTH, SHAPE_MIN_HEIGHT, DEFAULT_SHAPE_STYLE, DEFAULT_SHAPE_TEXT_STYLE } from '@/lib/constants';

export interface ShapeDrawRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type AddComponentFn = (
  kind: PaletteItemKind,
  x: number,
  y: number,
  width: number,
  height: number,
  frameId?: string,
  extras?: Partial<Pick<PlacedComponent, 'text' | 'textStyle' | 'shapeStyle'>>,
) => void;

export function useShapeDraw(
  canvasRef: RefObject<HTMLElement | null>,
  transform: CanvasTransform,
  activeShape: ShapeKind | null,
  addComponent: AddComponentFn,
  setActiveTool: (tool: CanvasTool) => void,
) {
  const [shapeDrawRect, setShapeDrawRect] = useState<ShapeDrawRect | null>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    didDrag: boolean;
  }>({ active: false, startX: 0, startY: 0, didDrag: false });
  const endRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleShapePointerDown = useCallback(
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

  const handleShapePointerMove = useCallback(
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
      setShapeDrawRect({
        x: Math.min(startX, ex),
        y: Math.min(startY, ey),
        width: Math.abs(ex - startX),
        height: Math.abs(ey - startY),
      });
    },
    [canvasRef, transform],
  );

  const handleShapePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      setShapeDrawRect(null);

      if (!dragRef.current.didDrag) return;
      if (!activeShape) return;

      const { startX, startY } = dragRef.current;
      const { x: ex, y: ey } = endRef.current;

      const rawX = Math.min(startX, ex);
      const rawY = Math.min(startY, ey);
      const rawW = Math.abs(ex - startX);
      const rawH = Math.abs(ey - startY);

      const x = snapToGrid(rawX);
      const y = snapToGrid(rawY);
      const width = Math.max(SHAPE_MIN_WIDTH, snapToGrid(rawW));
      const height = Math.max(SHAPE_MIN_HEIGHT, snapToGrid(rawH));

      addComponent(
        { type: 'shape', shape: activeShape },
        x,
        y,
        width,
        height,
        undefined,
        {
          text: '',
          shapeStyle: { ...DEFAULT_SHAPE_STYLE },
          textStyle: { ...DEFAULT_SHAPE_TEXT_STYLE },
        },
      );
      setActiveTool('select');
    },
    [activeShape, addComponent, setActiveTool],
  );

  return {
    shapeDrawRect,
    handleShapePointerDown,
    handleShapePointerMove,
    handleShapePointerUp,
  };
}

export { DEFAULT_SHAPE_STYLE, DEFAULT_SHAPE_TEXT_STYLE };
