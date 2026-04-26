'use client';

import type { TextStyle } from '@/lib/types';

interface TextStyleControlsProps {
  style: TextStyle;
  onChange: (patch: Partial<TextStyle>) => void;
}

const FONT_SIZES: TextStyle['fontSize'][] = [12, 14, 16, 20, 24, 32];

const ALIGN_OPTIONS: { value: TextStyle['align'] }[] = [
  { value: 'left'   },
  { value: 'center' },
  { value: 'right'  },
];

const VERTICAL_ALIGN_OPTIONS: { value: TextStyle['verticalAlign'] }[] = [
  { value: 'top'    },
  { value: 'middle' },
  { value: 'bottom' },
];

export function TextStyleControls({ style, onChange }: TextStyleControlsProps) {
  const inputBase =
    'bg-[#1a1d24] border border-panel-border text-gray-200 text-xs rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const toggleBase =
    'flex items-center justify-center w-7 h-7 rounded text-xs font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const toggleActive = 'bg-blue-600/20 text-blue-400 border-blue-500/40';
  const toggleInactive = 'bg-transparent text-gray-400 border-panel-border hover:text-gray-200 hover:bg-panel-hover';

  return (
    <div className="flex flex-col gap-2">
      {/* Font size */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Font size</label>
        <select
          value={style.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) as TextStyle['fontSize'] })}
          className={inputBase}
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>
      </div>

      {/* Decorations */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Style</label>
        <div className="flex gap-1">
          <button
            type="button"
            aria-pressed={style.bold}
            title="Bold"
            onClick={() => onChange({ bold: !style.bold })}
            className={`${toggleBase} ${style.bold ? toggleActive : toggleInactive} font-bold`}
          >
            B
          </button>
          <button
            type="button"
            aria-pressed={style.italic}
            title="Italic"
            onClick={() => onChange({ italic: !style.italic })}
            className={`${toggleBase} ${style.italic ? toggleActive : toggleInactive} italic`}
          >
            I
          </button>
          <button
            type="button"
            aria-pressed={style.underline}
            title="Underline"
            onClick={() => onChange({ underline: !style.underline })}
            className={`${toggleBase} ${style.underline ? toggleActive : toggleInactive} underline`}
          >
            U
          </button>
          <button
            type="button"
            aria-pressed={style.strikethrough}
            title="Strikethrough"
            onClick={() => onChange({ strikethrough: !style.strikethrough })}
            className={`${toggleBase} ${style.strikethrough ? toggleActive : toggleInactive} line-through`}
          >
            S
          </button>
        </div>
      </div>

      {/* Horizontal Alignment */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Align</label>
        <div className="flex gap-1">
          {ALIGN_OPTIONS.map(({ value }) => (
            <button
              key={value}
              type="button"
              aria-pressed={style.align === value}
              title={value.charAt(0).toUpperCase() + value.slice(1)}
              onClick={() => onChange({ align: value })}
              className={`${toggleBase} flex-1 ${style.align === value ? toggleActive : toggleInactive}`}
            >
              {value === 'left' ? (
                <svg width={14} height={12} viewBox="0 0 14 12" fill="currentColor">
                  <rect x="0" y="0" width="14" height="2" rx="1" />
                  <rect x="0" y="5" width="10" height="2" rx="1" />
                  <rect x="0" y="10" width="12" height="2" rx="1" />
                </svg>
              ) : value === 'center' ? (
                <svg width={14} height={12} viewBox="0 0 14 12" fill="currentColor">
                  <rect x="0" y="0" width="14" height="2" rx="1" />
                  <rect x="2" y="5" width="10" height="2" rx="1" />
                  <rect x="1" y="10" width="12" height="2" rx="1" />
                </svg>
              ) : (
                <svg width={14} height={12} viewBox="0 0 14 12" fill="currentColor">
                  <rect x="0" y="0" width="14" height="2" rx="1" />
                  <rect x="4" y="5" width="10" height="2" rx="1" />
                  <rect x="2" y="10" width="12" height="2" rx="1" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Alignment */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Vertical align</label>
        <div className="flex gap-1">
          {VERTICAL_ALIGN_OPTIONS.map(({ value }) => (
            <button
              key={value}
              type="button"
              aria-pressed={(style.verticalAlign ?? 'middle') === value}
              title={value.charAt(0).toUpperCase() + value.slice(1)}
              onClick={() => onChange({ verticalAlign: value })}
              className={`${toggleBase} flex-1 ${(style.verticalAlign ?? 'middle') === value ? toggleActive : toggleInactive}`}
            >
              {value === 'top' ? (
                <svg width={12} height={14} viewBox="0 0 12 14" fill="currentColor">
                  <rect x="0" y="0" width="12" height="2" rx="1" />
                  <rect x="1" y="4" width="10" height="2" rx="1" />
                  <rect x="3" y="8" width="6" height="2" rx="1" />
                </svg>
              ) : value === 'middle' ? (
                <svg width={12} height={14} viewBox="0 0 12 14" fill="currentColor">
                  <rect x="1" y="1" width="10" height="2" rx="1" />
                  <rect x="0" y="6" width="12" height="2" rx="1" />
                  <rect x="1" y="11" width="10" height="2" rx="1" />
                </svg>
              ) : (
                <svg width={12} height={14} viewBox="0 0 12 14" fill="currentColor">
                  <rect x="3" y="2" width="6" height="2" rx="1" />
                  <rect x="1" y="6" width="10" height="2" rx="1" />
                  <rect x="0" y="10" width="12" height="2" rx="1" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={style.color ?? '#e5e7eb'}
            onChange={(e) => onChange({ color: e.target.value })}
            className="w-8 h-7 rounded cursor-pointer border border-panel-border bg-transparent"
            title="Text color"
          />
          <span className="text-xs text-gray-400 font-mono">{style.color ?? '#e5e7eb'}</span>
        </div>
      </div>
    </div>
  );
}
