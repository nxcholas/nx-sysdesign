'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { EntityRelationData, RowPortSide } from '@/lib/types';
import { EntityRelationRowItem } from './entity-relation-row';

interface EntityRelationTableProps {
  componentId: string;
  tableData: EntityRelationData;
  isSelected: boolean;
  isConnectionDragging: boolean;
  onUpdateHeader: (header: string) => void;
  onAddRow: (rowId?: string, name?: string) => void;
  onRemoveRow: (rowId: string) => void;
  onRenameRow: (rowId: string, name: string) => void;
  onCycleKey: (rowId: string) => void;
  onConnectionDragStart: (componentId: string, port: RowPortSide, e: React.PointerEvent) => void;
  onConnectionDragEnd: (componentId: string, port: RowPortSide) => void;
}

export function EntityRelationTable({
  componentId,
  tableData,
  isSelected,
  isConnectionDragging,
  onUpdateHeader,
  onAddRow,
  onRemoveRow,
  onRenameRow,
  onCycleKey,
  onConnectionDragStart,
  onConnectionDragEnd,
}: EntityRelationTableProps) {
  const { header, rows } = tableData;

  // Header editing state
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerDraft, setHeaderDraft] = useState(header);
  const headerInputRef = useRef<HTMLInputElement>(null);

  // Track which row was just added so we can auto-focus its field
  const [autoFocusRowId, setAutoFocusRowId] = useState<string | null>(null);

  // Track which row is flashing red (deletion refused)
  const [flashRowId, setFlashRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!editingHeader) setHeaderDraft(header);
  }, [header, editingHeader]);

  useEffect(() => {
    if (editingHeader) {
      headerInputRef.current?.focus();
      headerInputRef.current?.select();
    }
  }, [editingHeader]);

  const commitHeader = useCallback(() => {
    setEditingHeader(false);
    const trimmed = headerDraft.trim();
    if (trimmed && trimmed !== header) {
      onUpdateHeader(trimmed);
    } else {
      setHeaderDraft(header);
    }
  }, [headerDraft, header, onUpdateHeader]);

  const handleHeaderKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (e.key === 'Enter') commitHeader();
      if (e.key === 'Escape') {
        setHeaderDraft(header);
        setEditingHeader(false);
      }
    },
    [commitHeader, header]
  );

  const handleAddRow = useCallback(() => {
    const newId = crypto.randomUUID();
    onAddRow(newId, '');
    setAutoFocusRowId(newId);
    // Clear after one render cycle so re-renders don't re-focus
    setTimeout(() => setAutoFocusRowId(null), 0);
  }, [onAddRow]);

  const handleRemoveRow = useCallback(
    (rowId: string) => {
      const row = rows.find((r) => r.id === rowId);
      if (!row) return;
      // Guard: cannot remove the last PK row when it's the only row
      if (rows.length === 1 && row.keyType === 'PK') {
        setFlashRowId(rowId);
        return;
      }
      onRemoveRow(rowId);
    },
    [rows, onRemoveRow]
  );

  const hasRows = rows.length > 0;

  return (
    <div
      role="table"
      aria-label={`${header} entity relation table`}
      className="w-full h-full flex flex-col border-2 border-white/70 rounded-sm bg-[#0f1117] overflow-hidden font-mono text-xs text-gray-100 select-none relative"
    >
      {/* Header row */}
      <div
        role="row"
        className="flex items-center justify-center border-b-2 border-white/70 h-8 px-2 shrink-0"
      >
        <div role="columnheader" className="flex-1 flex items-center justify-center">
          {editingHeader ? (
            <input
              ref={headerInputRef}
              value={headerDraft}
              onChange={(e) => setHeaderDraft(e.target.value)}
              onBlur={commitHeader}
              onKeyDown={handleHeaderKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent outline-none font-mono text-sm font-semibold text-gray-100
                border-b border-blue-400 text-center w-full focus-visible:outline-none"
              aria-label="Table name"
            />
          ) : (
            <span
              role="textbox"
              tabIndex={0}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingHeader(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setEditingHeader(true);
                }
              }}
              className="text-sm font-semibold text-gray-100 cursor-text truncate
                focus-visible:outline-2 focus-visible:outline-blue-400 rounded-sm"
            >
              {header}
            </span>
          )}
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {hasRows ? (
          rows.map((row) => (
            <EntityRelationRowItem
              key={row.id}
              row={row}
              autoFocus={autoFocusRowId === row.id}
              onRename={onRenameRow}
              onRemove={handleRemoveRow}
              onCycleKey={onCycleKey}
              flashError={flashRowId === row.id}
              onFlashEnd={() => setFlashRowId(null)}
              onConnectionDragStart={(side, e) => onConnectionDragStart(componentId, { kind: 'row', rowId: row.id, side }, e)}
              isConnectionDragging={isConnectionDragging}
            />
          ))
        ) : (
          <div
            role="row"
            className="flex items-center justify-center h-7 px-2 text-gray-500 italic"
          >
            <span role="cell">No fields — click + to add</span>
          </div>
        )}

        {/* Ghost add-row button — visible on select or hover */}
        <div
          className={`flex items-center justify-center h-7 shrink-0 transition-opacity
            ${isSelected ? 'opacity-80' : 'opacity-0 group-hover:opacity-60'}
          `}
        >
          <button
            type="button"
            aria-label="Add row"
            onClick={(e) => {
              e.stopPropagation();
              handleAddRow();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-full h-full flex items-center justify-center
              hover:opacity-100 hover:bg-white/5 transition-colors
              focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-gray-300"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
