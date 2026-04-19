'use client';

import type { PlacedComponent, ShapeStyle, ShapeKind, TextStyle } from '@/lib/types';
import { DEFAULT_SHAPE_STYLE, DEFAULT_SHAPE_TEXT_STYLE } from '@/lib/constants';
import { TextStyleControls } from './text-style-controls';

interface ShapeInspectorProps {
  component: PlacedComponent | null;
  onUpdateStyle: (style: Partial<ShapeStyle>) => void;
  onUpdateShape: (shape: ShapeKind) => void;
  onUpdateTextStyle: (style: Partial<TextStyle>) => void;
  onRemove: () => void;
}

const SHAPE_OPTIONS: { value: ShapeKind; label: string }[] = [
  { value: 'square',   label: 'Square'   },
  { value: 'circle',   label: 'Circle'   },
  { value: 'diamond',  label: 'Diamond'  },
  { value: 'triangle', label: 'Triangle' },
  { value: 'rhombus',  label: 'Rhombus'  },
];

const STROKE_WIDTHS: { value: ShapeStyle['strokeWidth']; label: string }[] = [
  { value: 1, label: 'Thin'   },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Thick'  },
];

export function ShapeInspector({
  component,
  onUpdateStyle,
  onUpdateShape,
  onUpdateTextStyle,
  onRemove,
}: ShapeInspectorProps) {
  if (!component || component.kind.type !== 'shape') return null;

  const shapeStyle: ShapeStyle = component.shapeStyle ?? DEFAULT_SHAPE_STYLE;
  const textStyle: TextStyle = component.textStyle ?? DEFAULT_SHAPE_TEXT_STYLE;
  const currentShape = component.kind.shape;

  const inputBase =
    'bg-[#1a1d24] border border-panel-border text-gray-200 text-xs rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const toggleBase =
    'flex items-center justify-center px-2 py-1 rounded text-xs transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const toggleActive = 'bg-blue-600/20 text-blue-400 border-blue-500/40';
  const toggleInactive = 'bg-transparent text-gray-400 border-panel-border hover:text-gray-200 hover:bg-panel-hover';

  return (
    <div
      className="absolute top-4 right-4 z-20 bg-panel-bg border border-panel-border
        rounded-lg shadow-xl px-4 py-3 flex flex-col gap-3 min-w-64 max-w-xs pointer-events-auto"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
          Shape
        </span>
        <button
          type="button"
          aria-label="Remove shape"
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded
            border border-red-800 hover:border-red-600 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Remove
        </button>
      </div>

      {/* Shape type */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400" htmlFor="shape-type">Shape type</label>
        <select
          id="shape-type"
          value={currentShape}
          onChange={(e) => onUpdateShape(e.target.value as ShapeKind)}
          className={inputBase}
        >
          {SHAPE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Fill color */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Fill</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={shapeStyle.fill === 'transparent' ? '#000000' : shapeStyle.fill}
            onChange={(e) => onUpdateStyle({ fill: e.target.value })}
            className="w-8 h-7 rounded cursor-pointer border border-panel-border bg-transparent"
            title="Fill color"
            disabled={shapeStyle.fill === 'transparent'}
          />
          <button
            type="button"
            onClick={() =>
              onUpdateStyle({ fill: shapeStyle.fill === 'transparent' ? '#1a1d24' : 'transparent' })
            }
            className={`text-xs px-2 py-1 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              shapeStyle.fill === 'transparent'
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-transparent text-gray-400 border-panel-border hover:text-gray-200 hover:bg-panel-hover'
            }`}
          >
            Transparent
          </button>
        </div>
      </div>

      {/* Border */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-400">Border</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={shapeStyle.stroke}
            onChange={(e) => onUpdateStyle({ stroke: e.target.value })}
            className="w-8 h-7 rounded cursor-pointer border border-panel-border bg-transparent"
            title="Border color"
          />
          <span className="text-xs text-gray-400 font-mono">{shapeStyle.stroke}</span>
        </div>
        <div className="flex gap-1">
          {STROKE_WIDTHS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdateStyle({ strokeWidth: value })}
              className={`${toggleBase} flex-1 ${shapeStyle.strokeWidth === value ? toggleActive : toggleInactive}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-panel-border" />

      {/* Text style */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Text</span>
        <TextStyleControls style={textStyle} onChange={onUpdateTextStyle} />
      </div>
    </div>
  );
}
