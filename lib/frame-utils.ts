import type { Frame, PlacedComponent } from './types';
import { FRAME_PADDING, FRAME_LABEL_HEIGHT, FRAME_MIN_WIDTH, FRAME_MIN_HEIGHT } from './constants';
import { snapToGrid, rectsIntersect } from './canvas-utils';

/**
 * Compute the bounding box for a set of child components with padding.
 * Returns snapped x/y/width/height.
 */
export function getFrameBounds(
  children: PlacedComponent[],
  padding = FRAME_PADDING,
  labelHeight = FRAME_LABEL_HEIGHT
): { x: number; y: number; width: number; height: number } {
  if (children.length === 0) {
    return { x: 0, y: 0, width: FRAME_MIN_WIDTH, height: FRAME_MIN_HEIGHT };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const c of children) {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x + c.width);
    maxY = Math.max(maxY, c.y + c.height);
  }

  const x = snapToGrid(minX - padding);
  const y = snapToGrid(minY - padding - labelHeight);
  const width = Math.max(FRAME_MIN_WIDTH, snapToGrid(maxX - minX + padding * 2));
  const height = Math.max(FRAME_MIN_HEIGHT, snapToGrid(maxY - minY + padding * 2 + labelHeight));

  return { x, y, width, height };
}

/** Check if a canvas-space point is inside a frame's bounds. */
export function isPointInsideFrame(
  point: { x: number; y: number },
  frame: Frame
): boolean {
  return (
    point.x >= frame.x &&
    point.x <= frame.x + frame.width &&
    point.y >= frame.y &&
    point.y <= frame.y + frame.height
  );
}

/** Return all components whose bounding boxes overlap the given rect. */
export function findOverlappingComponents(
  rect: { x: number; y: number; width: number; height: number },
  components: PlacedComponent[]
): PlacedComponent[] {
  return components.filter((c) =>
    rectsIntersect(rect, { x: c.x, y: c.y, width: c.width, height: c.height })
  );
}
