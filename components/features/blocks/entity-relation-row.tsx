'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { EntityRelationRow } from '@/lib/types';

interface EntityRelationRowProps {
  row: EntityRelationRow;
  /** Focus this row's field on mount (used after add-row). */
  autoFocus?: boolean;
  onRename: (rowId: string, name: string) => void;
  onRemove: (rowId: string) => void;
  onCycleKey: (rowId: string) => void;
  /** Flash the row red briefly when deletion is refused. */
  flashError?: boolean;
  /** Callback so parent can clear the flash after animation. */
  onFlashEnd?: () => void;
  /** Called when the user initiates a connection drag from this row's grip. */
  onConnectionDragStart?: (side: 'left' | 'right', e: React.PointerEvent) => void;
  /** When true, the connect grip remains visible even without hover. */
  isConnectionDragging?: boolean;
}

export function EntityRelationRowItem({
  row,
  autoFocus = false,
  onRename,
  onRemove,
  onCycleKey,
  flashError = false,
  onFlashEnd,
  onConnectionDragStart,
  isConnectionDragging = false,
}: EntityRelationRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft with row.name when not editing
  useEffect(() => {
    if (!editing) setDraft(row.name);
  }, [row.name, editing]);

  // Auto-focus on mount when requested
  useEffect(() => {
    if (autoFocus) {
      setEditing(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  // Clear flash after 400ms
  useEffect(() => {
    if (flashError && onFlashEnd) {
      const t = setTimeout(onFlashEnd, 400);
      return () => clearTimeout(t);
    }
  }, [flashError, onFlashEnd]);

  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== row.name) {
      onRename(row.id, trimmed || row.name);
    }
  }, [draft, row.id, row.name, onRename]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        commit();
      } else if (e.key === 'Escape') {
        setDraft(row.name);
        setEditing(false);
      }
    },
    [commit, row.name]
  );

  const isActive = row.keyType !== 'none';
  const fieldCellBase =
    'flex-1 min-w-0 flex items-center px-2 font-mono text-xs text-gray-100 h-7 overflow-hidden';
  const pkFieldStyle = row.keyType === 'PK'
    ? 'underline decoration-2 decoration-blue-500 bg-blue-600/30'
    : '';

  const keyLabel = row.keyType === 'none' ? '' : row.keyType;
  const keyColorClass = row.keyType === 'PK'
    ? 'text-blue-300 opacity-100'
    : row.keyType === 'FK'
    ? 'text-amber-300 opacity-100'
    : 'text-gray-400 opacity-0 group-hover:opacity-50';

  return (
    <div
      role="row"
      className={`group flex border-b border-white/30 last:border-b-0 transition-colors
        ${flashError ? 'border-red-500 border animate-pulse' : ''}
      `}
    >
      {/* Connect grip — left side, only on PK/FK rows */}
      {row.keyType !== 'none' && (
        <button
          type="button"
          aria-label={`Connect left from ${row.name || 'row'}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            onConnectionDragStart?.('left', e);
          }}
          className={`w-6 h-7 shrink-0 flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity
            text-green-400 hover:text-green-300 cursor-crosshair
            focus-visible:outline-2 focus-visible:outline-green-400
            ${isConnectionDragging ? 'opacity-100' : ''}`}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="7" r="1.5"/>
            <circle cx="15" cy="7" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/>
            <circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="17" r="1.5"/>
            <circle cx="15" cy="17" r="1.5"/>
          </svg>
        </button>
      )}

      {/* Key type cycle button */}
      <button
        type="button"
        role="cell"
        aria-label={`Cycle key type for ${row.name || 'row'}`}
        aria-description={row.keyType}
        onClick={(e) => {
          e.stopPropagation();
          onCycleKey(row.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        className={`w-11 shrink-0 border-r-2 border-white/70 flex items-center justify-center
          font-mono text-xs font-semibold h-7 cursor-pointer select-none
          transition-all hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-blue-400
          ${keyColorClass}
        `}
      >
        {keyLabel}
      </button>

      {/* Field cell */}
      <div role="cell" className={`${fieldCellBase} ${pkFieldStyle}`}>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent outline-none font-mono text-xs text-gray-100
              border-b border-blue-400 focus-visible:outline-none"
            aria-label={`Field name for row ${row.name || 'unnamed'}`}
          />
        ) : (
          <span
            role="textbox"
            tabIndex={0}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setEditing(true);
              }
            }}
            className="truncate cursor-text focus-visible:outline-2 focus-visible:outline-blue-400 rounded-sm"
          >
            {row.name || <span className="text-gray-500 italic">unnamed</span>}
          </span>
        )}
      </div>

      {/* Remove row button */}
      <button
        type="button"
        aria-label={`Remove row ${row.name || 'row'}`}
        onClick={(e) => { e.stopPropagation(); onRemove(row.id); }}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-6 h-7 shrink-0 flex items-center justify-center
          text-gray-500 opacity-0 group-hover:opacity-100
          hover:text-red-400 transition-colors
          focus-visible:outline-2 focus-visible:outline-blue-400"
      >
        ×
      </button>

      {/* Connect grip — right side, only on PK/FK rows */}
      {row.keyType !== 'none' && (
        <button
          type="button"
          aria-label={`Connect right from ${row.name || 'row'}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            onConnectionDragStart?.('right', e);
          }}
          className={`w-6 h-7 shrink-0 flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity
            text-green-400 hover:text-green-300 cursor-crosshair
            focus-visible:outline-2 focus-visible:outline-green-400
            ${isConnectionDragging ? 'opacity-100' : ''}`}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="7" r="1.5"/>
            <circle cx="15" cy="7" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/>
            <circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="17" r="1.5"/>
            <circle cx="15" cy="17" r="1.5"/>
          </svg>
        </button>
      )}
    </div>
  );
}
