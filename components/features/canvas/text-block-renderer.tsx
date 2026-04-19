'use client';

import { useState, useRef, useEffect } from 'react';
import type { PlacedComponent, TextStyle } from '@/lib/types';

interface TextBlockRendererProps {
  component: PlacedComponent;
  isSelected: boolean;
  autoFocus?: boolean;
  onTextChange: (id: string, text: string) => void;
  onSelect?: () => void;
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

export function TextBlockRenderer({ component, isSelected, autoFocus, onTextChange, onSelect, onResize }: TextBlockRendererProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(component.text ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(component.text ?? '');
  }, [component.text, editing]);

  useEffect(() => {
    if (autoFocus) {
      setEditing(true);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      });
    }
  }, [autoFocus]);

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

  return (
    <div
      className={`w-full h-full relative rounded ${
        isSelected ? 'ring-1 ring-dashed ring-blue-400' : ''
      }`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      {editing ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          onPointerDown={(e) => { onSelect?.(); e.stopPropagation(); }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 w-full h-full resize-none bg-transparent outline-none p-1"
          style={{ ...textStyle, resize: 'none' }}
          placeholder="Type here…"
        />
      ) : (
        <div
          className="absolute inset-0 p-1 whitespace-pre-wrap break-words"
          style={textStyle}
        >
          {component.text || (
            <span className="text-gray-600 select-none">Double-click to edit</span>
          )}
        </div>
      )}
    </div>
  );
}
