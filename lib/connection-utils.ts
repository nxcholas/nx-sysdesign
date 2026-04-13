import type { PlacedComponent, PortSide, PaletteItemKind, ComponentRole } from './types';
import { getBlockDef } from './block-registry';

type Rect = { x: number; y: number; width: number; height: number };

/** Returns the canvas-space position of a port on a component/frame edge midpoint. */
export function getPortPosition(
  component: Rect,
  side: PortSide
): { x: number; y: number } {
  switch (side) {
    case 'top':
      return { x: component.x + component.width / 2, y: component.y };
    case 'right':
      return { x: component.x + component.width, y: component.y + component.height / 2 };
    case 'bottom':
      return { x: component.x + component.width / 2, y: component.y + component.height };
    case 'left':
      return { x: component.x, y: component.y + component.height / 2 };
  }
}

/**
 * Returns the system-design role of a component.
 * - entity: a system participant (user, server, database) — nodes in an architecture diagram
 * - process: a communication descriptor (HTTP methods, status codes) — edge labels
 */
export function getComponentRole(kind: PaletteItemKind): ComponentRole {
  if (kind.type === 'block') {
    const def = getBlockDef(kind.kind);
    return def?.role ?? 'entity';
  }
  return 'process';
}

/**
 * Returns true if a connection between two components should show data flow animation.
 * All user-drawn connections represent intentional data flow — animate every connection
 * so that process components (HTTP methods, status codes) placed between entities
 * don't break the visual flow.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isValidDataFlow(source: PlacedComponent, target: PlacedComponent): boolean {
  return true;
}

/** All port sides for iteration. */
const PORT_SIDES: PortSide[] = ['top', 'right', 'bottom', 'left'];

/** Hit-test radius in canvas-space pixels. */
const PORT_HIT_RADIUS = 16;

/**
 * Find the closest port within hit radius at the given canvas-space position.
 * Searches both components and frames (frames have their own connection ports).
 * Returns { componentId, port } or null if nothing is close enough.
 */
export function findPortAtPosition(
  canvasX: number,
  canvasY: number,
  components: (PlacedComponent | Rect & { id: string })[],
  excludeId?: string
): { componentId: string; port: PortSide } | null {
  let best: { componentId: string; port: PortSide; dist: number } | null = null;

  for (const comp of components) {
    if (comp.id === excludeId) continue;
    for (const side of PORT_SIDES) {
      const pos = getPortPosition(comp, side);
      const dx = canvasX - pos.x;
      const dy = canvasY - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= PORT_HIT_RADIUS && (!best || dist < best.dist)) {
        best = { componentId: comp.id, port: side, dist };
      }
    }
  }

  return best ? { componentId: best.componentId, port: best.port } : null;
}

// ---------------------------------------------------------------------------
// Smart orthogonal router (draw.io-style)
// ---------------------------------------------------------------------------

/** Clearance distance from component edges in canvas-space pixels. */
const ROUTE_CLEARANCE = 24;

type Point = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';

interface BBox {
  x: number; y: number; width: number; height: number;
}

function portExitDirection(port: PortSide): Direction {
  const map: Record<PortSide, Direction> = {
    top: 'up', right: 'right', bottom: 'down', left: 'left',
  };
  return map[port];
}

function isHorizontalDir(dir: Direction): boolean {
  return dir === 'left' || dir === 'right';
}

function offsetInDirection(pt: Point, dir: Direction, dist: number): Point {
  switch (dir) {
    case 'up':    return { x: pt.x, y: pt.y - dist };
    case 'down':  return { x: pt.x, y: pt.y + dist };
    case 'left':  return { x: pt.x - dist, y: pt.y };
    case 'right': return { x: pt.x + dist, y: pt.y };
  }
}

function expandBBox(comp: BBox, padding: number): BBox {
  return {
    x: comp.x - padding,
    y: comp.y - padding,
    width: comp.width + padding * 2,
    height: comp.height + padding * 2,
  };
}

/** Check if a horizontal segment at y between x1 and x2 overlaps a bbox. */
function hSegOverlapsBBox(y: number, x1: number, x2: number, box: BBox): boolean {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  return y > box.y && y < box.y + box.height &&
         maxX > box.x && minX < box.x + box.width;
}

/** Check if a vertical segment at x between y1 and y2 overlaps a bbox. */
function vSegOverlapsBBox(x: number, y1: number, y2: number, box: BBox): boolean {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  return x > box.x && x < box.x + box.width &&
         maxY > box.y && minY < box.y + box.height;
}

/**
 * Validate that every segment in a route avoids all provided expanded bboxes.
 * Checks each consecutive pair as an H or V segment.
 */
function isRouteValid(points: Point[], ...boxes: BBox[]): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    for (const box of boxes) {
      if (a.x === b.x) {
        if (vSegOverlapsBBox(a.x, a.y, b.y, box)) return false;
      } else {
        if (hSegOverlapsBBox(a.y, a.x, b.x, box)) return false;
      }
    }
  }
  return true;
}

/**
 * Generate candidate intermediate point sets between sa and ta,
 * ordered from simplest to most complex. The caller validates each.
 */
function generateCandidates(
  sa: Point, ta: Point,
  exitDir: Direction, tgtExitDir: Direction,
  srcBox: BBox, tgtBox: BBox,
  obstacleBoxes: BBox[],
): Point[][] {
  const exitIsH = isHorizontalDir(exitDir);
  const entryIsH = isHorizontalDir(tgtExitDir);
  const candidates: Point[][] = [];

  // Safe corridor edges spanning ALL components (src, tgt, obstacles)
  const allBoxes = [srcBox, tgtBox, ...obstacleBoxes];
  const topY    = Math.min(...allBoxes.map(b => b.y));
  const bottomY = Math.max(...allBoxes.map(b => b.y + b.height));
  const leftX   = Math.min(...allBoxes.map(b => b.x));
  const rightX  = Math.max(...allBoxes.map(b => b.x + b.width));

  // ----- Strategy 1: L-shape (only if exit and entry axes differ) -----
  if (exitIsH !== entryIsH) {
    const turn = exitIsH
      ? { x: sa.x, y: ta.y }
      : { x: ta.x, y: sa.y };
    candidates.push([turn]);
  }

  // ----- Strategy 2: Z-shape (3 intermediate segments) -----
  // Prefer outer edge corridors first (routes around obstacles), midpoint last
  if (exitIsH) {
    // V-H-V: try edge corridors first, then midpoint as fallback
    const midY = (sa.y + ta.y) / 2;
    for (const y of [topY, bottomY, midY]) {
      candidates.push([{ x: sa.x, y }, { x: ta.x, y }]);
    }
  } else {
    // H-V-H: try edge corridors first, then midpoint as fallback
    const midX = (sa.x + ta.x) / 2;
    for (const x of [leftX, rightX, midX]) {
      candidates.push([{ x, y: sa.y }, { x, y: ta.y }]);
    }
  }

  // ----- Strategy 3: 5-segment wrap-around -----
  // When Z-shape fails because a V/H segment at sa.x or ta.x passes
  // through a component, route around the outside of both components.
  if (exitIsH) {
    // V-H-V failed → wrap with H-V-H-V (exit H, go to safe X, then bridge, then to ta)
    for (const wrapX of [rightX, leftX]) {
      for (const bridgeY of [topY, bottomY]) {
        // Route: sa → (wrapX, sa.y) → (wrapX, bridgeY) → (ta.x, bridgeY) → ta
        candidates.push([
          { x: wrapX, y: sa.y },
          { x: wrapX, y: bridgeY },
          { x: ta.x, y: bridgeY },
        ]);
        // Also try routing source side: sa → (sa.x, bridgeY) → (wrapX, bridgeY) → (wrapX, ta.y) → ta
        candidates.push([
          { x: sa.x, y: bridgeY },
          { x: wrapX, y: bridgeY },
          { x: wrapX, y: ta.y },
        ]);
      }
    }
  } else {
    // H-V-H failed → wrap with V-H-V-H
    for (const wrapY of [bottomY, topY]) {
      for (const bridgeX of [rightX, leftX]) {
        candidates.push([
          { x: sa.x, y: wrapY },
          { x: bridgeX, y: wrapY },
          { x: bridgeX, y: ta.y },
        ]);
        candidates.push([
          { x: bridgeX, y: sa.y },
          { x: bridgeX, y: wrapY },
          { x: ta.x, y: wrapY },
        ]);
      }
    }
  }

  return candidates;
}

/**
 * Remove collinear points from a path — points that lie on the same
 * horizontal or vertical line as both their neighbors are redundant bends.
 * Also removes duplicate consecutive points.
 */
function removeCollinear(points: Point[]): Point[] {
  if (points.length <= 2) return points;

  const result: Point[] = [points[0]!];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1]!;
    const curr = points[i]!;
    const next = points[i + 1]!;

    // Skip duplicates
    if (prev.x === curr.x && prev.y === curr.y) continue;

    // Skip collinear (on the same H or V line as both neighbors)
    const collinearH = prev.y === curr.y && curr.y === next.y;
    const collinearV = prev.x === curr.x && curr.x === next.x;
    if (collinearH || collinearV) continue;

    result.push(curr);
  }

  const last = points[points.length - 1]!;
  const prevLast = result[result.length - 1]!;
  if (last.x !== prevLast.x || last.y !== prevLast.y) {
    result.push(last);
  }

  return result;
}

/**
 * Smart orthogonal router: draw.io-style perpendicular exit/entry routing.
 *
 * Generates candidate routes with increasing complexity (L-shape → Z-shape
 * → 5-segment wrap-around), validates every segment against source, target,
 * and all obstacle bounding boxes, and returns the simplest valid route.
 *
 * Returns canvas-space points for the full route.
 */
export function getSmartRoutePoints(
  source: Rect,
  target: Rect,
  sourcePort: PortSide,
  targetPort: PortSide,
  obstacles?: Rect[],
): Point[] {
  const srcPortPos = getPortPosition(source, sourcePort);
  const tgtPortPos = getPortPosition(target, targetPort);

  const exitDir = portExitDirection(sourcePort);
  const tgtExitDir = portExitDirection(targetPort);

  const srcBox = expandBBox(source, ROUTE_CLEARANCE);
  const tgtBox = expandBBox(target, ROUTE_CLEARANCE);
  const obstacleBoxes = (obstacles ?? []).map(o => expandBBox(o, ROUTE_CLEARANCE));

  // Exit and entry anchors — clearance away from the port, perpendicular to face
  const sa = offsetInDirection(srcPortPos, exitDir, ROUTE_CLEARANCE);
  const ta = offsetInDirection(tgtPortPos, tgtExitDir, ROUTE_CLEARANCE);

  // Try candidates from simplest to most complex, return first valid route
  const candidates = generateCandidates(sa, ta, exitDir, tgtExitDir, srcBox, tgtBox, obstacleBoxes);

  for (const mid of candidates) {
    const route = [sa, ...mid, ta];
    if (isRouteValid(route, srcBox, tgtBox, ...obstacleBoxes)) {
      return removeCollinear([srcPortPos, sa, ...mid, ta, tgtPortPos]);
    }
  }

  // Fallback: direct connection (should rarely reach here)
  return removeCollinear([srcPortPos, sa, ta, tgtPortPos]);
}

/** Returns the point at the midpoint along a polyline (by arc-length). */
export function polylineMidpoint(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0]!;

  let totalLen = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalLen += Math.hypot(points[i + 1]!.x - points[i]!.x, points[i + 1]!.y - points[i]!.y);
  }

  let remaining = totalLen / 2;
  for (let i = 0; i < points.length - 1; i++) {
    const segLen = Math.hypot(points[i + 1]!.x - points[i]!.x, points[i + 1]!.y - points[i]!.y);
    if (remaining <= segLen) {
      const t = segLen === 0 ? 0 : remaining / segLen;
      return {
        x: points[i]!.x + t * (points[i + 1]!.x - points[i]!.x),
        y: points[i]!.y + t * (points[i + 1]!.y - points[i]!.y),
      };
    }
    remaining -= segLen;
  }
  return points[points.length - 1]!;
}

/** Convert a point array to an SVG path d attribute. */
export function pointsToPath(points: Point[]): string {
  if (points.length === 0) return '';
  const first = points[0]!;
  let d = `M ${first.x} ${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const pt = points[i]!;
    d += ` L ${pt.x} ${pt.y}`;
  }
  return d;
}

// ---------------------------------------------------------------------------
// Anchor-aware routing (used for temporary drag line)
// ---------------------------------------------------------------------------

/**
 * Returns an orthogonal SVG path for the temporary connection line that matches
 * the exit-clearance behavior of the smart router. Uses the same ROUTE_CLEARANCE
 * offset from the source port before bending, so the preview closely matches
 * the final connection shape.
 *
 * Coordinates are in whatever space the caller uses (screen or canvas-space).
 */
export function getTempConnectionPath(
  from: Point,
  to: Point,
  sourcePort: PortSide,
): string {
  const exitDir = portExitDirection(sourcePort);
  const sa = offsetInDirection(from, exitDir, ROUTE_CLEARANCE);
  if (isHorizontalDir(exitDir)) {
    // Horizontal exit: move right/left to sa, then drop to to.y, then across to to.x
    return `M ${from.x} ${from.y} L ${sa.x} ${sa.y} L ${sa.x} ${to.y} L ${to.x} ${to.y}`;
  } else {
    // Vertical exit: move up/down to sa, then across to to.x, then down to to.y
    return `M ${from.x} ${from.y} L ${sa.x} ${sa.y} L ${to.x} ${sa.y} L ${to.x} ${to.y}`;
  }
}
