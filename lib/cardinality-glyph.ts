import type { CardinalityEnd } from './types';

/**
 * Pure function that returns an array of SVG path "d" strings for a single
 * cardinality end using crow's-foot ERD notation.
 *
 * @param end        The cardinality end descriptor with a `symbol` field
 * @param anchor     The line endpoint in screen/canvas coordinates (where the line touches the component edge)
 * @param direction  Unit vector pointing away from the component along the line (glyphs sit along this direction)
 */
export function getCardinalityGlyphPaths(
  end: CardinalityEnd,
  anchor: { x: number; y: number },
  direction: { dx: number; dy: number },
  scale: number = 1,
): string[] {
  // Perpendicular unit vector (rotate direction 90 degrees)
  const px = -direction.dy;
  const py = direction.dx;

  // Constants — scaled so glyphs remain proportional at any zoom level
  const barHalf = 6 * scale;
  const circleR = 4 * scale;
  const outerOffset = 19 * scale; // MIN symbol — further from anchor
  const innerOffset = 12 * scale; // MAX symbol — closer to anchor
  const fanAngle = (40 * Math.PI) / 180;
  const footLen = 12 * scale;

  // Direction vector (points away from component along line)
  const odx = direction.dx;
  const ody = direction.dy;

  // Helper: perpendicular bar at a given offset from anchor
  function drawBar(offset: number): string {
    const cx = anchor.x + odx * offset;
    const cy = anchor.y + ody * offset;
    return `M ${cx + px * barHalf} ${cy + py * barHalf} L ${cx - px * barHalf} ${cy - py * barHalf}`;
  }

  // Helper: circle at a given offset from anchor
  function drawCircle(offset: number): string {
    const cx = anchor.x + odx * offset;
    const cy = anchor.y + ody * offset;
    const r = circleR;
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
  }

  // Helper: crow's-foot at a given offset from anchor
  function drawCrowsFoot(offset: number): string[] {
    const baseCx = anchor.x + odx * offset;
    const baseCy = anchor.y + ody * offset;

    // Fan lines point back toward anchor (opposite of odx/ody)
    const fdx = -odx;
    const fdy = -ody;

    const cosA = Math.cos(fanAngle);
    const sinA = Math.sin(fanAngle);

    const paths: string[] = [];

    // Center foot: straight back toward anchor
    paths.push(
      `M ${baseCx} ${baseCy} L ${baseCx + fdx * footLen} ${baseCy + fdy * footLen}`
    );

    // Left fan line (rotate fan direction by +fanAngle)
    const ldx = fdx * cosA - fdy * sinA;
    const ldy = fdx * sinA + fdy * cosA;
    paths.push(
      `M ${baseCx} ${baseCy} L ${baseCx + ldx * footLen} ${baseCy + ldy * footLen}`
    );

    // Right fan line (rotate fan direction by -fanAngle)
    const rdx = fdx * cosA + fdy * sinA;
    const rdy = -fdx * sinA + fdy * cosA;
    paths.push(
      `M ${baseCx} ${baseCy} L ${baseCx + rdx * footLen} ${baseCy + rdy * footLen}`
    );

    return paths;
  }

  const paths: string[] = [];

  switch (end.symbol) {
    case 'none':
      return [];

    case 'one':
      paths.push(drawBar(innerOffset));
      break;

    case 'many':
      paths.push(...drawCrowsFoot(innerOffset));
      break;

    case 'one-and-only-one':
      paths.push(drawBar(outerOffset));
      paths.push(drawBar(innerOffset));
      break;

    case 'zero-or-one':
      paths.push(drawCircle(outerOffset));
      paths.push(drawBar(innerOffset));
      break;

    case 'one-or-many':
      paths.push(drawBar(outerOffset));
      paths.push(...drawCrowsFoot(innerOffset));
      break;

    case 'zero-or-many':
      paths.push(drawCircle(outerOffset));
      paths.push(...drawCrowsFoot(innerOffset));
      break;
  }

  return paths;
}
