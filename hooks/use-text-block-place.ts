'use client';

import { useCallback, type RefObject } from 'react';
import type { CanvasTransform, PaletteItemKind, CanvasTool, PlacedComponent, TextStyle } from '@/lib/types';
import { screenToCanvas, snapToGrid } from '@/lib/canvas-utils';
import {
  TEXT_BLOCK_DEFAULT_WIDTH,
  TEXT_BLOCK_DEFAULT_HEIGHT,
  DEFAULT_TEXT_STYLE,
} from '@/lib/constants';

type AddComponentFn = (
  kind: PaletteItemKind,
  x: number,
  y: number,
  width: number,
  height: number,
  frameId?: string,
  extras?: Partial<Pick<PlacedComponent, 'text' | 'textStyle' | 'shapeStyle'>>,
) => void;

export function useTextBlockPlace(
  canvasRef: RefObject<HTMLElement | null>,
  transform: CanvasTransform,
  placedComponents: PlacedComponent[],
  addComponent: AddComponentFn,
  setActiveTool: (tool: CanvasTool) => void,
  /** Called after add so canvas-root can resolve and focus the new text block. */
  onPlaced: (id: string) => void,
) {
  const handleTextBlockPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = screenToCanvas(e.clientX, e.clientY, rect, transform);
      const x = snapToGrid(pos.x - TEXT_BLOCK_DEFAULT_WIDTH / 2);
      const y = snapToGrid(pos.y - TEXT_BLOCK_DEFAULT_HEIGHT / 2);
      addComponent(
        { type: 'text-block' },
        x,
        y,
        TEXT_BLOCK_DEFAULT_WIDTH,
        TEXT_BLOCK_DEFAULT_HEIGHT,
        undefined,
        { text: '', textStyle: { ...DEFAULT_TEXT_STYLE } },
      );
      onPlaced('__latest__');
      setActiveTool('select');
    },
    [canvasRef, transform, addComponent, setActiveTool, onPlaced],
  );

  return { handleTextBlockPointerDown };
}
