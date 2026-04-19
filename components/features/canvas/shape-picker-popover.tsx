'use client';

import { useEffect, useRef } from 'react';
import type { ShapeKind } from '@/lib/types';

interface ShapePickerPopoverProps {
  onSelect: (shape: ShapeKind) => void;
  onClose: () => void;
}

const SHAPES: { kind: ShapeKind; label: string }[] = [
  { kind: 'square',   label: 'Square'   },
  { kind: 'circle',   label: 'Circle'   },
  { kind: 'diamond',  label: 'Diamond'  },
  { kind: 'triangle', label: 'Triangle' },
  { kind: 'rhombus',  label: 'Rhombus'  },
];

function ShapeIcon({ kind }: { kind: ShapeKind }) {
  const size = 20;
  const s = size;
  switch (kind) {
    case 'square':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="2" y="2" width="16" height="16" rx="1" />
        </svg>
      );
    case 'circle':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <ellipse cx="10" cy="10" rx="8" ry="8" />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <polygon points="10,2 18,10 10,18 2,10" />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <polygon points="10,2 18,18 2,18" />
        </svg>
      );
    case 'rhombus':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <polygon points="10,2 17,10 10,18 3,10" />
        </svg>
      );
  }
}

export function ShapePickerPopover({ onSelect, onClose }: ShapePickerPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1
        bg-panel-bg border border-panel-border rounded-lg px-1.5 py-1 shadow-xl"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {SHAPES.map(({ kind, label }) => (
        <button
          key={kind}
          type="button"
          aria-label={label}
          title={label}
          onClick={() => onSelect(kind)}
          className="flex items-center justify-center w-8 h-8 rounded text-gray-400
            hover:text-gray-200 hover:bg-panel-hover transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ShapeIcon kind={kind} />
        </button>
      ))}
    </div>
  );
}
