'use client';

import { useCallback } from 'react';
import type { DragPayload, CanvasTransform } from '@/lib/types';
import { screenToCanvas, snapToGrid } from '@/lib/canvas-utils';

const DRAG_DATA_TYPE = 'application/x-nx-design';

export function useDragDrop() {
  /** Call this in onDragStart on a palette item. */
  const handleDragStart = useCallback(
    (payload: DragPayload) =>
      (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData(DRAG_DATA_TYPE, JSON.stringify(payload));
      },
    []
  );

  /** Call this in onDragOver on the canvas drop zone. */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  /**
   * Call this in onDrop on the canvas drop zone.
   * Returns the payload and snapped canvas-space coordinates, or null if invalid.
   */
  const handleDrop = useCallback(
    (
      e: React.DragEvent,
      canvasRect: DOMRect,
      transform: CanvasTransform,
      snap: boolean = true
    ): { payload: DragPayload; x: number; y: number } | null => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DRAG_DATA_TYPE);
      if (!raw) return null;

      let payload: DragPayload;
      try {
        payload = JSON.parse(raw) as DragPayload;
      } catch {
        return null;
      }

      const { x, y } = screenToCanvas(e.clientX, e.clientY, canvasRect, transform);
      return {
        payload,
        x: snap ? snapToGrid(x) : x,
        y: snap ? snapToGrid(y) : y,
      };
    },
    []
  );

  return { handleDragStart, handleDragOver, handleDrop };
}
