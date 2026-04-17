/**
 * icon-shapes.tsx
 *
 * Fixed set of 8 geometric shape renderers used as icon containers.
 * These are purely geometric — they do not know about any specific block kind.
 * Add new block types by registering them in lib/block-registry.ts, not here.
 */

import type { IconShape } from '@/lib/block-registry';

interface ShapeProps {
  size: 'sm' | 'md';
  bgClass: string;
  borderClass: string;
  children: React.ReactNode;
  /** When set (canvas mode), shape fills these pixel dimensions instead of fixed sm/md tokens. */
  canvasWidth?: number;
  canvasHeight?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns inline style dimensions when in canvas mode, or undefined for palette mode. */
function canvasDims(cw: number | undefined, ch: number | undefined, scaleX = 1, scaleY = 1) {
  if (cw === undefined || ch === undefined) return undefined;
  return { width: Math.round(cw * scaleX), height: Math.round(ch * scaleY) };
}

// ─── Circle ───────────────────────────────────────────────────────────────────

function CircleShape({ size, bgClass, borderClass, children, canvasWidth, canvasHeight }: ShapeProps) {
  const dims = canvasDims(canvasWidth, canvasHeight, 0.72, 0.72);
  const paletteClass = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  return (
    <div
      aria-hidden="true"
      className={`rounded-full border ${bgClass} ${borderClass} flex items-center justify-center ${dims ? '' : paletteClass}`}
      style={dims}
    >
      {children}
    </div>
  );
}

// ─── Rect ─────────────────────────────────────────────────────────────────────

function RectShape({ size, bgClass, borderClass, children, canvasWidth, canvasHeight }: ShapeProps) {
  const dims = canvasDims(canvasWidth, canvasHeight, 0.82, 0.65);
  const paletteClass = size === 'sm' ? 'w-8 h-6' : 'w-12 h-9';
  return (
    <div
      aria-hidden="true"
      className={`rounded border ${bgClass} ${borderClass} flex items-center justify-center ${dims ? '' : paletteClass}`}
      style={dims}
    >
      {children}
    </div>
  );
}

// ─── Cylinder — CSS-constructed, no children SVG ─────────────────────────────

function CylinderShape({ size, bgClass, borderClass, children, canvasWidth, canvasHeight }: ShapeProps) {
  const dims = canvasDims(canvasWidth, canvasHeight, 0.72, 0.72);
  const paletteClass = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';
  const ellipseDim = 'w-full h-2';
  return (
    <div
      aria-hidden="true"
      className={`relative flex flex-col items-center ${dims ? '' : paletteClass}`}
      style={dims}
    >
      {/* Top ellipse */}
      <div className={`${ellipseDim} rounded-full border ${bgClass} ${borderClass}`} />
      {/* Body */}
      <div className={`w-full flex-1 ${bgClass} border-l border-r ${borderClass} flex items-center justify-center`}>
        {children}
      </div>
      {/* Middle line */}
      <div className={`absolute top-1/2 w-full h-px ${borderClass.replace('border-', 'bg-')} -translate-y-1/2`} />
      {/* Bottom ellipse */}
      <div className={`${ellipseDim} rounded-full border ${bgClass} ${borderClass}`} />
    </div>
  );
}

// ─── Hexagon ──────────────────────────────────────────────────────────────────

function HexagonShape({ size, bgClass, borderClass, children, canvasWidth, canvasHeight }: ShapeProps) {
  const dims = canvasDims(canvasWidth, canvasHeight, 0.76, 0.65);
  const paletteClass = size === 'sm' ? 'w-8 h-7' : 'w-12 h-10';
  return (
    <div
      aria-hidden="true"
      className={`border ${bgClass} ${borderClass} flex items-center justify-center ${dims ? '' : paletteClass}`}
      style={{ ...dims, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
    >
      {children}
    </div>
  );
}

// ─── Diamond ──────────────────────────────────────────────────────────────────

function DiamondShape({ size, bgClass, borderClass, children, canvasWidth, canvasHeight }: ShapeProps) {
  const dims = canvasDims(canvasWidth, canvasHeight, 0.65, 0.65);
  const paletteClass = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  return (
    <div
      aria-hidden="true"
      className={`border ${bgClass} ${borderClass} flex items-center justify-center rotate-45 ${dims ? '' : paletteClass}`}
      style={dims}
    >
      <div className="-rotate-45 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ─── Shield ───────────────────────────────────────────────────────────────────

function ShieldShape({ size, bgClass, borderClass, children, canvasWidth, canvasHeight }: ShapeProps) {
  const dims = canvasDims(canvasWidth, canvasHeight, 0.65, 0.72);
  const paletteClass = size === 'sm' ? 'w-7 h-8' : 'w-10 h-11';
  return (
    <div
      aria-hidden="true"
      className={`border ${bgClass} ${borderClass} flex items-center justify-center ${dims ? '' : paletteClass}`}
      style={{ ...dims, clipPath: 'polygon(50% 0%, 100% 20%, 100% 60%, 50% 100%, 0% 60%, 0% 20%)' }}
    >
      {children}
    </div>
  );
}

// ─── Cloud ────────────────────────────────────────────────────────────────────

function CloudShape({ size, bgClass, borderClass, children, canvasWidth, canvasHeight }: ShapeProps) {
  const dims = canvasDims(canvasWidth, canvasHeight, 0.82, 0.58);
  const paletteClass = size === 'sm' ? 'w-9 h-6' : 'w-13 h-9';
  return (
    <div
      aria-hidden="true"
      className={`relative ${bgClass} flex items-center justify-center overflow-hidden ${dims ? '' : paletteClass}`}
      style={{
        ...dims,
        borderRadius: '40% 40% 30% 30% / 50% 50% 40% 40%',
        boxShadow: `0 0 0 1px var(--tw-border-opacity, 1)`,
      }}
    >
      <div
        className={`absolute inset-0 border ${borderClass} rounded-[40%_40%_30%_30%/50%_50%_40%_40%]`}
      />
      {children}
    </div>
  );
}

// ─── Parallelogram ────────────────────────────────────────────────────────────

function ParallelogramShape({ size, bgClass, borderClass, children, canvasWidth, canvasHeight }: ShapeProps) {
  const dims = canvasDims(canvasWidth, canvasHeight, 0.82, 0.58);
  const paletteClass = size === 'sm' ? 'w-9 h-6' : 'w-13 h-9';
  return (
    <div
      aria-hidden="true"
      className={`border ${bgClass} ${borderClass} flex items-center justify-center ${dims ? '' : paletteClass}`}
      style={{ ...dims, transform: 'skewX(-12deg)' }}
    >
      <div style={{ transform: 'skewX(12deg)' }} className="flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function IconShapeContainer({
  shape,
  size,
  bgClass,
  borderClass,
  children,
  canvasWidth,
  canvasHeight,
}: ShapeProps & { shape: IconShape }) {
  const props = { size, bgClass, borderClass, children, canvasWidth, canvasHeight };

  switch (shape) {
    case 'circle':        return <CircleShape {...props} />;
    case 'rect':          return <RectShape {...props} />;
    case 'cylinder':      return <CylinderShape {...props} />;
    case 'hexagon':       return <HexagonShape {...props} />;
    case 'diamond':       return <DiamondShape {...props} />;
    case 'shield':        return <ShieldShape {...props} />;
    case 'cloud':         return <CloudShape {...props} />;
    case 'parallelogram': return <ParallelogramShape {...props} />;
  }
}
