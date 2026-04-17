'use client';

import {
  Globe, Cpu, Terminal, Puzzle, ShieldCheck, Settings2, Clock,
  Webhook, Globe2, Flame, LayoutGrid, MapPin, Map, Lock,
  KeyRound, BadgeCheck, AlertTriangle, HeartPulse, LayoutDashboard,
  GitGraph, Timer, Link2, MessageSquare, CreditCard, PieChart,
  type LucideIcon,
} from 'lucide-react';
import {
  AwsApiGateway, AwsLoadBalancer, AwsEC2, AwsEKS, AwsRDS, AwsDynamoDB,
  AwsS3, AwsEFS, AwsRedshift, AwsElastiCache, AwsCloudFront, AwsSQS,
  AwsSNS, AwsEventBridge, AwsKinesis, AwsRoute53, AwsWAF, AwsVPC,
  AwsCloudWatch, AwsIAM, AwsSecretsManager, AwsCognito, AwsOpenSearch,
  AwsGlue, AwsCloudTrail, AwsSES, AwsDataLake, AwsLambda,
} from '@/components/ui/aws-icons';
import { getBlockDef } from '@/lib/block-registry';
import { IconShapeContainer } from './icon-shapes';
import { ComponentLabel } from '@/components/features/canvas/component-label';

interface BlockRendererProps {
  kind: string;
  label?: string;
  size?: 'sm' | 'md';
  /**
   * When provided (canvas mode), the icon fills the available space instead of
   * using the fixed sm/md size tokens. AWS icons render without a shape container.
   */
  canvasWidth?: number;
  canvasHeight?: number;
  /** When provided, the label becomes double-click editable. Only pass on canvas, not palette. */
  onRenameLabel?: (newLabel: string) => void;
}

// ─── Icon lookup maps ─────────────────────────────────────────────────────────

const AWS_ICON_MAP: Record<string, (size: number) => React.ReactNode> = {
  AwsApiGateway:    (s) => <AwsApiGateway size={s} />,
  AwsLoadBalancer:  (s) => <AwsLoadBalancer size={s} />,
  AwsEC2:           (s) => <AwsEC2 size={s} />,
  AwsEKS:           (s) => <AwsEKS size={s} />,
  AwsRDS:           (s) => <AwsRDS size={s} />,
  AwsDynamoDB:      (s) => <AwsDynamoDB size={s} />,
  AwsS3:            (s) => <AwsS3 size={s} />,
  AwsEFS:           (s) => <AwsEFS size={s} />,
  AwsRedshift:      (s) => <AwsRedshift size={s} />,
  AwsElastiCache:   (s) => <AwsElastiCache size={s} />,
  AwsCloudFront:    (s) => <AwsCloudFront size={s} />,
  AwsSQS:           (s) => <AwsSQS size={s} />,
  AwsSNS:           (s) => <AwsSNS size={s} />,
  AwsEventBridge:   (s) => <AwsEventBridge size={s} />,
  AwsKinesis:       (s) => <AwsKinesis size={s} />,
  AwsRoute53:       (s) => <AwsRoute53 size={s} />,
  AwsWAF:           (s) => <AwsWAF size={s} />,
  AwsVPC:           (s) => <AwsVPC size={s} />,
  AwsCloudWatch:    (s) => <AwsCloudWatch size={s} />,
  AwsIAM:           (s) => <AwsIAM size={s} />,
  AwsSecretsManager:(s) => <AwsSecretsManager size={s} />,
  AwsCognito:       (s) => <AwsCognito size={s} />,
  AwsOpenSearch:    (s) => <AwsOpenSearch size={s} />,
  AwsGlue:          (s) => <AwsGlue size={s} />,
  AwsCloudTrail:    (s) => <AwsCloudTrail size={s} />,
  AwsSES:           (s) => <AwsSES size={s} />,
  AwsDataLake:      (s) => <AwsDataLake size={s} />,
};

const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  Globe, Cpu, Terminal, Puzzle, ShieldCheck, Settings2, Clock,
  Webhook, Globe2, Flame, LayoutGrid, MapPin, Map, Lock,
  KeyRound, BadgeCheck, AlertTriangle, HeartPulse, LayoutDashboard,
  GitGraph, Timer, Link2, MessageSquare, CreditCard, PieChart,
};

// ─── Complex Visuals ──────────────────────────────────────────────────────────

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

function AwsLambdaVisual({ size, canvasWidth, canvasHeight }: { size: 'sm' | 'md'; canvasWidth?: number; canvasHeight?: number }) {
  let px: number;
  if (canvasWidth && canvasHeight) {
    px = Math.min(canvasWidth, canvasHeight) * 0.72;
  } else {
    px = size === 'sm' ? 28 : 40;
  }
  return (
    <div aria-hidden="true" className="rounded overflow-hidden flex items-center justify-center" style={{ width: px, height: px }}>
      <AwsLambda size={px} />
    </div>
  );
}

const COMPLEX_VISUALS: Record<string, (size: 'sm' | 'md', canvasWidth?: number, canvasHeight?: number) => React.ReactNode> = {
  'server-rack':           (size) => <ServerRackVisual size={size} />,
  'cylinder-icon':         (size) => <CylinderIconVisual size={size} />,
  'entity-relation-table': (size) => <EntityRelationTablePreview size={size} />,
  'aws-lambda':            (size, cw, ch) => <AwsLambdaVisual size={size} canvasWidth={cw} canvasHeight={ch} />,
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

// ─── SVG Icon (legacy Heroicons path fallback) ────────────────────────────────

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

export function BlockRenderer({ kind, label, size = 'md', canvasWidth, canvasHeight, onRenameLabel }: BlockRendererProps) {
  const def = getBlockDef(kind);
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const isCanvas = canvasWidth !== undefined && canvasHeight !== undefined;

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

  // Complex visual (CSS-constructed or full AWS SVG) — bypass shape container
  const complexRenderer = visual.complexVisualKey ? COMPLEX_VISUALS[visual.complexVisualKey] : undefined;
  if (complexRenderer) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        {complexRenderer(size, canvasWidth, canvasHeight)}
        {labelEl}
      </div>
    );
  }

  // AWS icons: render without a shape container — they carry their own colored background
  if (visual.iconLibrary === 'aws' && visual.iconComponent) {
    const awsRenderer = AWS_ICON_MAP[visual.iconComponent];
    if (awsRenderer) {
      const iconPx = isCanvas
        ? Math.min(canvasWidth!, canvasHeight!) * 0.72
        : size === 'sm' ? 28 : 40;
      return (
        <div className="flex flex-col items-center gap-1.5">
          <span aria-hidden="true" className="rounded overflow-hidden flex items-center justify-center">
            {awsRenderer(iconPx)}
          </span>
          {labelEl}
        </div>
      );
    }
  }

  // Lucide icon inside a shape container
  const iconPx = isCanvas
    ? Math.round(Math.min(canvasWidth!, canvasHeight!) * 0.38)
    : size === 'sm' ? 14 : 18;

  let icon: React.ReactNode = null;

  if (visual.iconLibrary === 'lucide' && visual.iconComponent) {
    const LucideIcon = LUCIDE_ICON_MAP[visual.iconComponent];
    if (LucideIcon) {
      icon = <LucideIcon size={iconPx} className={visual.iconColorClass} strokeWidth={1.5} />;
    }
  } else if (visual.svgPaths.length > 0) {
    icon = (
      <SvgIcon
        paths={visual.svgPaths}
        colorClass={visual.iconColorClass}
        fillRule={visual.svgFillRule}
        size={size}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <IconShapeContainer
        shape={visual.shape}
        size={size}
        bgClass={visual.bgClass}
        borderClass={visual.borderClass}
        canvasWidth={isCanvas ? canvasWidth : undefined}
        canvasHeight={isCanvas ? canvasHeight : undefined}
      >
        {icon}
      </IconShapeContainer>
      {labelEl}
    </div>
  );
}
