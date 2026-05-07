'use client';

import { useState, useRef, useEffect } from 'react';
import type { PlacedComponent, ShapeKind, TextStyle } from '@/lib/types';

interface ShapeRendererProps {
  component: PlacedComponent;
  isSelected: boolean;
  onTextChange: (id: string, text: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
}

function applyTextStyle(style: TextStyle | undefined): React.CSSProperties {
  if (!style) return {};
  return {
    fontSize: style.fontSize,
    lineHeight: 1.2,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecoration: [
      style.underline ? 'underline' : '',
      style.strikethrough ? 'line-through' : '',
    ].filter(Boolean).join(' ') || 'none',
    color: style.color,
    textAlign: style.align,
  };
}

export function ShapeGeometry({
  kind,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
}: {
  kind: ShapeKind;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}) {
  const w = width;
  const h = height;
  switch (kind) {
    case 'square':
      return <rect x={0} y={0} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    case 'circle':
      return <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    case 'diamond':
      return <polygon points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    case 'triangle':
      return <polygon points={`${w / 2},0 ${w},${h} 0,${h}`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    case 'rhombus':
      return <polygon points={`${w / 2},${h * 0.15} ${w * 0.9},${h / 2} ${w / 2},${h * 0.85} ${w * 0.1},${h / 2}`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
  }
}

export function ShapeRenderer({ component, isSelected, onTextChange, onResize }: ShapeRendererProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(component.text ?? '');
  const [hovered, setHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const kind = component.kind.type === 'shape' ? component.kind.shape : 'square';
  const shapeStyle = component.shapeStyle ?? { fill: 'transparent', stroke: '#9ca3af', strokeWidth: 2 };

  useEffect(() => {
    if (!editing) setDraft(component.text ?? '');
  }, [component.text, editing]);

  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      });
    }
  }, [editing]);

  const commit = () => {
    if (textareaRef.current && onResize) {
      const scrollH = textareaRef.current.scrollHeight;
      if (scrollH > component.height) {
        onResize(component.id, component.width, scrollH);
      }
    }
    setEditing(false);
    onTextChange(component.id, draft);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditing(false);
      setDraft(component.text ?? '');
    }
    e.stopPropagation();
  };

  const textStyle = applyTextStyle(component.textStyle);
  const w = component.width;
  const h = component.height;

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      {/* SVG shape */}
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        <ShapeGeometry
          kind={kind}
          width={w}
          height={h}
          fill={shapeStyle.fill}
          stroke={isSelected ? '#3b82f6' : shapeStyle.stroke}
          strokeWidth={shapeStyle.strokeWidth}
        />
      </svg>

      {/* Text overlay — centered */}
      <div className="absolute inset-0 flex items-center justify-center p-2">
        {editing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{ ...textStyle, resize: 'none' }}
            className="w-full bg-transparent resize-none outline-none text-center"
            rows={2}
          />
        ) : (
          <span
            style={textStyle}
            className="text-center select-none break-words max-w-full pointer-events-none"
          >
            {component.text || (
              hovered && !editing ? (
                <span className="text-gray-600 text-xs">Double-click to edit</span>
              ) : null
            )}
          </span>
        )}
      </div>
    </div>
  );
}
