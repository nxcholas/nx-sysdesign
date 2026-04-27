import type { CanvasTransform, PlacedComponent, AlignmentDirection } from './types';
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

/** Compute new positions for a set of components after alignment or distribution. */
export function computeAlignedPositions(
  components: PlacedComponent[],
  ids: string[],
  direction: AlignmentDirection
): Record<string, { x: number; y: number }> {
  const targets = components.filter((c) => ids.includes(c.id));
  if (targets.length < 2) return {};

  const result: Record<string, { x: number; y: number }> = {};

  switch (direction) {
    case 'left': {
      const minX = Math.min(...targets.map((c) => c.x));
      for (const c of targets) result[c.id] = { x: minX, y: c.y };
      break;
    }
    case 'right': {
      const maxRight = Math.max(...targets.map((c) => c.x + c.width));
      for (const c of targets) result[c.id] = { x: maxRight - c.width, y: c.y };
      break;
    }
    case 'center-h': {
      const minX = Math.min(...targets.map((c) => c.x));
      const maxRight = Math.max(...targets.map((c) => c.x + c.width));
      const midX = (minX + maxRight) / 2;
      for (const c of targets) result[c.id] = { x: midX - c.width / 2, y: c.y };
      break;
    }
    case 'top': {
      const minY = Math.min(...targets.map((c) => c.y));
      for (const c of targets) result[c.id] = { x: c.x, y: minY };
      break;
    }
    case 'bottom': {
      const maxBottom = Math.max(...targets.map((c) => c.y + c.height));
      for (const c of targets) result[c.id] = { x: c.x, y: maxBottom - c.height };
      break;
    }
    case 'center-v': {
      const minY = Math.min(...targets.map((c) => c.y));
      const maxBottom = Math.max(...targets.map((c) => c.y + c.height));
      const midY = (minY + maxBottom) / 2;
      for (const c of targets) result[c.id] = { x: c.x, y: midY - c.height / 2 };
      break;
    }
    case 'distribute-h': {
      if (targets.length < 3) break;
      const sorted = [...targets].sort((a, b) => a.x - b.x);
      const leftmost = sorted[0]!;
      const rightmost = sorted[sorted.length - 1]!;
      const totalWidth = sorted.reduce((sum, c) => sum + c.width, 0);
      const span = (rightmost.x + rightmost.width) - leftmost.x;
      const gap = (span - totalWidth) / (sorted.length - 1);
      let cursor = leftmost.x;
      for (const c of sorted) {
        result[c.id] = { x: cursor, y: c.y };
        cursor += c.width + gap;
      }
      break;
    }
    case 'distribute-v': {
      if (targets.length < 3) break;
      const sorted = [...targets].sort((a, b) => a.y - b.y);
      const topmost = sorted[0]!;
      const bottommost = sorted[sorted.length - 1]!;
      const totalHeight = sorted.reduce((sum, c) => sum + c.height, 0);
      const span = (bottommost.y + bottommost.height) - topmost.y;
      const gap = (span - totalHeight) / (sorted.length - 1);
      let cursor = topmost.y;
      for (const c of sorted) {
        result[c.id] = { x: c.x, y: cursor };
        cursor += c.height + gap;
      }
      break;
    }
  }

  return result;
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
