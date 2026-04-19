import type { PlacedComponent, PortSide, EdgePortSide, RowPortSide, PaletteItemKind, ComponentRole } from './types';
import { getBlockDef } from './block-registry';

type Rect = { x: number; y: number; width: number; height: number };

/** Type guard for RowPortSide. */
export function isRowPort(side: PortSide): side is RowPortSide {
  return typeof side === 'object' && side.kind === 'row';
}

/**
 * Returns the canvas-space position of a port on a component edge.
 * For EdgePortSide: returns midpoint of that edge.
 * For RowPortSide: returns left/right edge at the vertical center of the named row.
 *   Header = 32px, each row = 28px, so rowY = component.y + 32 + rowIndex * 28 + 14.
 *   Requires the component to have tableData; falls back to left/right midpoint if not.
 */
export function getPortPosition(
  component: Rect & { tableData?: { rows: { id: string }[] } },
  side: PortSide
): { x: number; y: number } {
  if (isRowPort(side)) {
    const rows = component.tableData?.rows ?? [];
    const rowIndex = rows.findIndex((r) => r.id === side.rowId);
    // If the component has no tableData (e.g. the synthetic 1×1 preview target rect),
    // fall back to the rect center so the preview line terminates at the cursor.
    if (!component.tableData || rowIndex < 0) {
      return { x: component.x + component.width / 2, y: component.y + component.height / 2 };
    }
    const rowY = component.y + 34 + rowIndex * 28 + 14; // 32px header + 2px header border-b
    const rowX = side.side === 'left' ? component.x : component.x + component.width;
    return { x: rowX, y: rowY };
  }
  // EdgePortSide
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
  if (kind.type === 'text-block' || kind.type === 'shape') {
    return 'entity';
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

/** All edge port sides for iteration. */
const EDGE_PORT_SIDES: EdgePortSide[] = ['top', 'right', 'bottom', 'left'];

/** Hit-test radius in canvas-space pixels. */
export const PORT_HIT_RADIUS = 16;

/**
 * Find the closest port within hit radius at the given canvas-space position.
 * For ER tables, row ports on PK/FK rows take priority over edge ports.
 * Searches both components and frames (frames have their own connection ports).
 * Returns { componentId, port } or null if nothing is close enough.
 */
export function findPortAtPosition(
  canvasX: number,
  canvasY: number,
  components: (PlacedComponent | (Rect & { id: string }))[],
  excludeId?: string
): { componentId: string; port: PortSide } | null {
  let best: { componentId: string; port: PortSide; dist: number } | null = null;

  for (const comp of components) {
    if (comp.id === excludeId) continue;

    // For ER tables: use rectangular row hit zones so dropping anywhere inside a
    // row's Y band (and within the table's X bounds) selects that row port.
    const placedComp = comp as PlacedComponent;
    if (placedComp.tableData) {
      const HEADER_H = 34; // 32px h-8 + 2px border-b
      const ROW_H = 28;
      const tableLeft = placedComp.x;
      const tableRight = placedComp.x + placedComp.width;

      // Only consider cursor within the table's horizontal bounds (with small padding)
      if (canvasX >= tableLeft - PORT_HIT_RADIUS && canvasX <= tableRight + PORT_HIT_RADIUS) {
        let rowIdx = 0;
        for (const row of placedComp.tableData.rows) {
          if (row.keyType !== 'none') {
            const rowTop = placedComp.y + HEADER_H + rowIdx * ROW_H;
            const rowBottom = rowTop + ROW_H;
            if (canvasY >= rowTop && canvasY < rowBottom) {
              // Cursor is inside this row's band — pick the nearer side port
              const side: 'left' | 'right' = canvasX < (tableLeft + tableRight) / 2 ? 'left' : 'right';
              const rowPort: RowPortSide = { kind: 'row', rowId: row.id, side };
              const pos = getPortPosition(placedComp, rowPort);
              const dx = canvasX - pos.x;
              const dy = canvasY - pos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (!best || dist < best.dist) {
                best = { componentId: comp.id, port: rowPort, dist };
              }
              break;
            }
          }
          rowIdx++;
        }
      }
    }

    // Probe edge ports (lower priority than row ports for ER tables when we already have a row port hit)
    for (const side of EDGE_PORT_SIDES) {
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
  if (isRowPort(port)) {
    return port.side === 'left' ? 'left' : 'right';
  }
  const map: Record<EdgePortSide, Direction> = {
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
function isRouteValid(points: Point[], boxes: BBox[]): boolean {
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
): Point[][] {
  const exitIsH = isHorizontalDir(exitDir);
  const entryIsH = isHorizontalDir(tgtExitDir);
  const candidates: Point[][] = [];

  // Combined bounding box edges (safe corridors)
  const topY = Math.min(srcBox.y, tgtBox.y);
  const bottomY = Math.max(srcBox.y + srcBox.height, tgtBox.y + tgtBox.height);
  const leftX = Math.min(srcBox.x, tgtBox.x);
  const rightX = Math.max(srcBox.x + srcBox.width, tgtBox.x + tgtBox.width);

  // ----- Strategy 1: L-shape (only if exit and entry axes differ) -----
  if (exitIsH !== entryIsH) {
    const turn = exitIsH
      ? { x: sa.x, y: ta.y }
      : { x: ta.x, y: sa.y };
    candidates.push([turn]);
  }

  // ----- Strategy 2: Z-shape (3 intermediate segments) -----
  if (exitIsH) {
    const targetIsDiagonal = sa.x !== ta.x && sa.y !== ta.y;
    if (targetIsDiagonal) {
      // V-H-V: vertical first (preferred for diagonal targets)
      const midX = (sa.x + ta.x) / 2;
      for (const x of [midX, leftX, rightX]) {
        candidates.push([{ x, y: sa.y }, { x, y: ta.y }]);
      }
    } else {
      // H-V-H: horizontal first (target on same horizontal axis)
      const midY = (sa.y + ta.y) / 2;
      for (const y of [midY, topY, bottomY]) {
        candidates.push([{ x: sa.x, y }, { x: ta.x, y }]);
      }
    }
  } else {
    // H-V-H: try midpoint, then edge corridors
    const midX = (sa.x + ta.x) / 2;
    for (const x of [midX, leftX, rightX]) {
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
 * → 5-segment wrap-around), validates every segment against both component
 * bounding boxes, and returns the simplest valid route.
 *
 * Returns canvas-space points for the full route.
 */
type RectWithTable = Rect & { tableData?: { rows: { id: string }[] } };

export function getSmartRoutePoints(
  source: RectWithTable,
  target: RectWithTable,
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

  // Build full obstacle list: src + target + any additional obstacles
  const allBoxes: BBox[] = [
    srcBox,
    tgtBox,
    ...(obstacles ?? []).map(o => expandBBox(o, ROUTE_CLEARANCE)),
  ];

  // Straight line: ports already orthogonally aligned and no obstacles in the way
  if (srcPortPos.x === tgtPortPos.x || srcPortPos.y === tgtPortPos.y) {
    const directRoute = [srcPortPos, tgtPortPos];
    if (isRouteValid(directRoute, allBoxes)) return directRoute;
  }

  // Exit and entry anchors — clearance away from the port, perpendicular to face
  const sa = offsetInDirection(srcPortPos, exitDir, ROUTE_CLEARANCE);
  const ta = offsetInDirection(tgtPortPos, tgtExitDir, ROUTE_CLEARANCE);

  // Try candidates from simplest to most complex, return first valid route
  const candidates = generateCandidates(sa, ta, exitDir, tgtExitDir, srcBox, tgtBox);

  for (const mid of candidates) {
    const route = [sa, ...mid, ta];
    if (isRouteValid(route, allBoxes)) {
      return removeCollinear([srcPortPos, sa, ...mid, ta, tgtPortPos]);
    }
  }

  // Fallback: force an orthogonal L-shape (horizontal first, then vertical)
  const turn = { x: ta.x, y: sa.y };
  return removeCollinear([srcPortPos, sa, turn, ta, tgtPortPos]);
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
// Temp connection routing (drag preview — uses same router as final lines)
// ---------------------------------------------------------------------------

/** Returns the opposite port side (used to synthesize a target for temp routing). */
export function oppositePort(port: PortSide): PortSide {
  if (isRowPort(port)) {
    return { kind: 'row', rowId: port.rowId, side: port.side === 'left' ? 'right' : 'left' };
  }
  const map: Record<EdgePortSide, EdgePortSide> = {
    top: 'bottom', bottom: 'top', left: 'right', right: 'left',
  };
  return map[port];
}

/**
 * Trims `amount` pixels from both ends of a screen-space polyline.
 * Used to create dead zones around port hit areas so connection hit-area
 * paths don't intercept clicks intended for the port itself.
 *
 * Returns the trimmed point array. If the total path length is less than
 * 2 * amount, returns a two-point path at the midpoint (degenerate — no
 * clickable hit area for extremely short connections).
 */
export function truncatePolyline(points: Point[], amount: number): Point[] {
  if (points.length < 2) return points;

  // Compute cumulative lengths
  const lengths: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i]!.x - points[i - 1]!.x;
    const dy = points[i]!.y - points[i - 1]!.y;
    lengths.push(lengths[i - 1]! + Math.sqrt(dx * dx + dy * dy));
  }
  const total = lengths[lengths.length - 1]!;

  if (total <= amount * 2) {
    // Path too short — return midpoint so hit area effectively vanishes
    const mid = total / 2;
    for (let i = 1; i < points.length; i++) {
      if (lengths[i]! >= mid) {
        const seg = lengths[i]! - lengths[i - 1]!;
        const t = seg === 0 ? 0 : (mid - lengths[i - 1]!) / seg;
        const mx = points[i - 1]!.x + t * (points[i]!.x - points[i - 1]!.x);
        const my = points[i - 1]!.y + t * (points[i]!.y - points[i - 1]!.y);
        return [{ x: mx, y: my }, { x: mx, y: my }];
      }
    }
    return points;
  }

  const trimStart = amount;
  const trimEnd = total - amount;

  const result: Point[] = [];

  for (let i = 1; i < points.length; i++) {
    const segStart = lengths[i - 1]!;
    const segEnd = lengths[i]!;

    if (segEnd <= trimStart || segStart >= trimEnd) continue;

    const clampedStart = Math.max(segStart, trimStart);
    const clampedEnd = Math.min(segEnd, trimEnd);
    const segLen = segEnd - segStart;

    const tStart = segLen === 0 ? 0 : (clampedStart - segStart) / segLen;
    const tEnd = segLen === 0 ? 1 : (clampedEnd - segStart) / segLen;

    const pStart: Point = {
      x: points[i - 1]!.x + tStart * (points[i]!.x - points[i - 1]!.x),
      y: points[i - 1]!.y + tStart * (points[i]!.y - points[i - 1]!.y),
    };
    const pEnd: Point = {
      x: points[i - 1]!.x + tEnd * (points[i]!.x - points[i - 1]!.x),
      y: points[i - 1]!.y + tEnd * (points[i]!.y - points[i - 1]!.y),
    };

    if (result.length === 0) {
      result.push(pStart);
    }
    result.push(pEnd);
  }

  return result.length >= 2 ? result : points;
}
