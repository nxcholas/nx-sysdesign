'use client';

import type { PlacedComponent, TextStyle } from '@/lib/types';
import { DEFAULT_TEXT_STYLE } from '@/lib/constants';
import { TextStyleControls } from './text-style-controls';

interface TextBlockInspectorProps {
  component: PlacedComponent | null;
  onUpdateTextStyle: (style: Partial<TextStyle>) => void;
  onRemove: () => void;
}

export function TextBlockInspector({ component, onUpdateTextStyle, onRemove }: TextBlockInspectorProps) {
  if (!component || component.kind.type !== 'text-block') return null;

  const textStyle: TextStyle = component.textStyle ?? DEFAULT_TEXT_STYLE;

  return (
    <div
      className="absolute top-4 right-4 z-20 bg-panel-bg border border-panel-border
        rounded-lg shadow-xl px-4 py-3 flex flex-col gap-3 min-w-64 max-w-xs pointer-events-auto"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
          Text Block
        </span>
        <button
          type="button"
          aria-label="Remove text block"
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded
            border border-red-800 hover:border-red-600 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Remove
        </button>
      </div>

      <TextStyleControls style={textStyle} onChange={onUpdateTextStyle} />
    </div>
  );
}
