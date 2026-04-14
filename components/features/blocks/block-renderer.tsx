'use client';

import { getBlockDef } from '@/lib/block-registry';
import { IconShapeContainer } from './icon-shapes';
import { ComponentLabel } from '@/components/features/canvas/component-label';

interface BlockRendererProps {
  kind: string;
  label?: string;
  size?: 'sm' | 'md';
  /** When provided, the label becomes double-click editable. Only pass on canvas, not palette. */
  onRenameLabel?: (newLabel: string) => void;
}

// ─── Complex Visuals ──────────────────────────────────────────────────────────
// CSS-constructed visuals for the small set of blocks that can't be expressed
// as an SVG path inside a shape container. Keyed by complexVisualKey.

function ServerRackVisual({ size }: { size: 'sm' | 'md' }) {
  const containerDim = size === 'sm' ? 'w-8 h-6' : 'w-12 h-9';
  return (
    <div
      aria-hidden="true"
      className={`${containerDim} rounded bg-indigo-700 border border-indigo-500 flex flex-col items-center justify-center gap-0.5 px-1`}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-full flex items-center gap-0.5">
          <div className="w-1 h-1 rounded-full bg-green-400" />
          <div className="flex-1 h-0.5 rounded bg-indigo-500" />
        </div>
      ))}
    </div>
  );
}

function CylinderIconVisual({ size }: { size: 'sm' | 'md' }) {
  const containerDim = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';
  return (
    <div
      aria-hidden="true"
      className={`${containerDim} relative flex flex-col items-center`}
    >
      <div className="w-full h-2 rounded-full bg-emerald-600 border border-emerald-400" />
      <div className="w-full flex-1 bg-emerald-700 border-l border-r border-emerald-500" />
      <div className="absolute top-1/2 w-full h-px bg-emerald-500 -translate-y-1/2" />
      <div className="w-full h-2 rounded-full bg-emerald-600 border border-emerald-400" />
    </div>
  );
}

function EntityRelationTablePreview({ size }: { size: 'sm' | 'md' }) {
  const containerDim = size === 'sm' ? 'w-10 h-8' : 'w-14 h-11';
  const rowH = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div
      aria-hidden="true"
      className={`${containerDim} rounded-sm border border-white/70 flex flex-col overflow-hidden bg-gray-900`}
    >
      <div className="w-full h-2.5 border-b border-white/70 flex items-center justify-center">
        <div className="w-4 h-1 rounded-sm bg-white/60" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className={`w-full ${rowH} border-b border-white/30 flex items-center gap-0.5 px-0.5`}>
          <div className="w-2 h-1 rounded-sm bg-blue-400/60 shrink-0" />
          <div className="flex-1 h-0.5 rounded bg-white/30" />
        </div>
      ))}
    </div>
  );
}

const COMPLEX_VISUALS: Record<string, (size: 'sm' | 'md') => React.ReactNode> = {
  'server-rack':            (size) => <ServerRackVisual size={size} />,
  'cylinder-icon':          (size) => <CylinderIconVisual size={size} />,
  'entity-relation-table':  (size) => <EntityRelationTablePreview size={size} />,
};

// ─── Fallback for unknown kinds ───────────────────────────────────────────────

function UnknownBlock({ size }: { size: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-6' : 'w-12 h-9';
  return (
    <div
      aria-hidden="true"
      className={`${dim} rounded border border-gray-500 bg-gray-700 flex items-center justify-center`}
    >
      <span className="text-gray-400 text-xs font-mono">?</span>
    </div>
  );
}

// ─── SVG Icon ─────────────────────────────────────────────────────────────────

function SvgIcon({
  paths,
  colorClass,
  fillRule,
  size,
}: {
  paths: string[];
  colorClass: string;
  fillRule?: 'evenodd' | 'nonzero';
  size: 'sm' | 'md';
}) {
  const iconDim = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${iconDim} ${colorClass}`}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fillRule={fillRule ?? 'evenodd'} clipRule={fillRule ?? 'evenodd'} />
      ))}
    </svg>
  );
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

export function BlockRenderer({ kind, label, size = 'md', onRenameLabel }: BlockRendererProps) {
  const def = getBlockDef(kind);
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  if (!def) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <UnknownBlock size={size} />
        {size === 'md' && (
          <span className={`${textSize} text-gray-400 font-mono text-center leading-tight`}>
            {kind}
          </span>
        )}
      </div>
    );
  }

  const { visual } = def;
  const displayLabel = label ?? def.label;

  const labelEl = onRenameLabel ? (
    <ComponentLabel label={displayLabel} onRename={onRenameLabel} />
  ) : (
    <span className={`${textSize} text-gray-300 font-mono text-center leading-tight`}>
      {displayLabel}
    </span>
  );

  // Complex visual (CSS-constructed) — bypass shape container
  const complexRenderer = visual.complexVisualKey ? COMPLEX_VISUALS[visual.complexVisualKey] : undefined;
  if (complexRenderer) {
    const complexVisual = complexRenderer(size);
    return (
      <div className="flex flex-col items-center gap-1.5">
        {complexVisual}
        {labelEl}
      </div>
    );
  }

  // Standard visual — SVG icon inside a shape container
  const icon =
    visual.svgPaths.length > 0 ? (
      <SvgIcon
        paths={visual.svgPaths}
        colorClass={visual.iconColorClass}
        fillRule={visual.svgFillRule}
        size={size}
      />
    ) : null;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <IconShapeContainer
        shape={visual.shape}
        size={size}
        bgClass={visual.bgClass}
        borderClass={visual.borderClass}
      >
        {icon}
      </IconShapeContainer>
      {labelEl}
    </div>
  );
}
