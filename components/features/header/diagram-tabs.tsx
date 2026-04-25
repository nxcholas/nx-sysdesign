'use client';

import React, { useState } from 'react';

interface TabItem {
  id: string;
  name: string;
}

interface DiagramTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  showNewTab: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onReorder: (newOrder: string[]) => void;
  onNewTab: () => void;
}

export function DiagramTabs(props: DiagramTabsProps): React.ReactElement {
  const { tabs, activeTabId, showNewTab, onSelect, onClose, onRename, onReorder, onNewTab } = props;

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Drag-to-reorder state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function commitRename(id: string) {
    const trimmed = editValue.trim();
    if (trimmed) {
      onRename(id, trimmed);
    }
    setEditingId(null);
  }

  function handleCloseClick(e: React.MouseEvent, tab: TabItem) {
    e.stopPropagation();
    onClose(tab.id);
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== dragOverId) {
      setDragOverId(id);
    }
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggingId;
    if (!sourceId || sourceId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const currentOrder = tabs.map((t) => t.id);
    const filtered = currentOrder.filter((id) => id !== sourceId);
    const insertAt = filtered.indexOf(targetId);
    if (insertAt === -1) {
      filtered.push(sourceId);
    } else {
      filtered.splice(insertAt, 0, sourceId);
    }

    onReorder(filtered);
    setDraggingId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverId(null);
  }

  return (
    <div
      className="flex flex-nowrap overflow-x-auto flex-1 min-w-0 items-end"
      role="tablist"
      aria-label="Diagram tabs"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isEditing = editingId === tab.id;
        const isDragging = draggingId === tab.id;
        const isDragTarget = dragOverId === tab.id && draggingId !== tab.id;

        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            draggable={!isEditing}
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={(e) => handleDragOver(e, tab.id)}
            onDrop={(e) => handleDrop(e, tab.id)}
            onDragEnd={handleDragEnd}
            onClick={() => {
              if (!isEditing) onSelect(tab.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(tab.id);
              }
            }}
            onDoubleClick={() => {
              setEditingId(tab.id);
              setEditValue(tab.name);
            }}
            className={[
              'flex items-center gap-1.5 px-3 h-8 text-xs font-mono cursor-pointer select-none',
              'flex-shrink-0 max-w-[180px] min-w-0 rounded-t transition-colors',
              'border border-b-0',
              isActive
                ? 'bg-canvas-bg border-panel-border text-gray-200'
                : 'bg-header-bg border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800',
              isDragging ? 'opacity-50' : '',
              isDragTarget ? 'border-blue-500' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                autoFocus
                onChange={(e) => setEditValue(e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={() => commitRename(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(tab.id);
                  if (e.key === 'Escape') setEditingId(null);
                  e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent outline-none w-full min-w-0 text-gray-100"
                aria-label="Rename diagram"
              />
            ) : (
              <span className="truncate flex-1 min-w-0">{tab.name}</span>
            )}

            {/* Close button */}
            <button
              type="button"
              aria-label={`Close ${tab.name}`}
              onClick={(e) => handleCloseClick(e, tab)}
              onPointerDown={(e) => e.stopPropagation()}
              className={[
                'flex-shrink-0 rounded w-4 h-4 flex items-center justify-center',
                'text-gray-600 hover:text-gray-300 hover:bg-gray-700 transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500',
              ].join(' ')}
            >
              <svg width={8} height={8} viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <line x1="1" y1="1" x2="7" y2="7" />
                <line x1="7" y1="1" x2="1" y2="7" />
              </svg>
            </button>
          </div>
        );
      })}

      {/* New tab button — hidden on zero state */}
      {showNewTab && <button
        type="button"
        aria-label="New diagram"
        onClick={onNewTab}
        className={[
          'flex-shrink-0 flex items-center justify-center w-7 h-7 ml-1 rounded',
          'text-gray-500 hover:text-gray-300 hover:bg-gray-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          'transition-colors',
        ].join(' ')}
      >
        <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="6" y1="1" x2="6" y2="11" />
          <line x1="1" y1="6" x2="11" y2="6" />
        </svg>
      </button>}
    </div>
  );
}
