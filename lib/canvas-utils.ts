import type { CanvasTransform } from './types';
import {
  GRID_SIZE,
  CANVAS_MIN_SCALE,
  CANVAS_MAX_SCALE,
  CANVAS_ZOOM_STEP,
} from './constants';

/** Convert screen (client) coordinates to canvas-space coordinates. */
export function screenToCanvas(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  transform: CanvasTransform
): { x: number; y: number } {
  return {
    x: (clientX - canvasRect.left - transform.translateX) / transform.scale,
    y: (clientY - canvasRect.top - transform.translateY) / transform.scale,
  };
}

/** Check if two axis-aligned rectangles intersect. */
export function rectsIntersect(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Snap a value to the nearest grid increment. */
export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}

/** Clamp scale within allowed bounds. */
export function clampScale(scale: number): number {
  return Math.min(Math.max(scale, CANVAS_MIN_SCALE), CANVAS_MAX_SCALE);
}

/**
 * Compute a new canvas transform when zooming toward a specific cursor point.
 * Uses transform-origin: 0 0 math (origin is top-left of viewport).
 *
 * @param delta - WheelEvent.deltaY; positive = zoom out, negative = zoom in
 */
export function zoomToward(
  current: CanvasTransform,
  cursorX: number,
  cursorY: number,
  delta: number
): CanvasTransform {
  const newScale = clampScale(current.scale * (1 - delta * CANVAS_ZOOM_STEP));
  const ratio = newScale / current.scale;
  return {
    scale: newScale,
    translateX: cursorX - ratio * (cursorX - current.translateX),
    translateY: cursorY - ratio * (cursorY - current.translateY),
  };
}
