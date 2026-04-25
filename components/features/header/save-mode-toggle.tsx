'use client';

import React, { useState, useEffect } from 'react';
import type { SaveMode } from '@/lib/types';

interface SaveModeToggleProps {
  saveMode: SaveMode;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  onToggle: (mode: SaveMode) => void;
  onManualSave: () => void;
}

function formatRelative(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'Saved just now';
  if (seconds < 3600) return `Saved ${Math.max(1, Math.floor(seconds / 60))}m ago`;
  return `Saved ${Math.floor(seconds / 3600)}h ago`;
}

export function SaveModeToggle(props: SaveModeToggleProps): React.ReactElement {
  const { saveMode, isDirty, isSaving, lastSavedAt, onToggle, onManualSave } = props;
  const [, setTick] = useState(0);

  // Re-render every 30s to keep relative timestamp current
  useEffect(() => {
    if (saveMode !== 'auto' || !lastSavedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [saveMode, lastSavedAt]);

  const nextMode: SaveMode = saveMode === 'auto' ? 'manual' : 'auto';

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* Autosave status slot — spinner or timestamp */}
      {saveMode === 'auto' && (
        <div
          className="min-w-[80px] text-right"
          aria-live="polite"
          aria-atomic="true"
        >
          {isSaving ? (
            <div
              role="status"
              aria-label="Saving…"
              className="inline-block w-3.5 h-3.5 rounded-full border-2 border-gray-700 border-t-blue-400 animate-spin"
            />
          ) : lastSavedAt ? (
            <span className="text-xs font-mono text-gray-500">
              {formatRelative(lastSavedAt)}
            </span>
          ) : null}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => onToggle(nextMode)}
        aria-label={`Save mode: ${saveMode}. Click to switch to ${nextMode}`}
        title={`Currently ${saveMode === 'auto' ? 'auto-saving' : 'manual save'}. Click to toggle.`}
        className={[
          'px-2.5 py-1 rounded text-xs font-mono',
          'border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          saveMode === 'auto'
            ? 'text-gray-400 border-gray-700 hover:text-gray-200 hover:border-gray-600'
            : 'text-blue-400 border-blue-700 hover:text-blue-300 hover:border-blue-500',
        ].join(' ')}
      >
        {saveMode === 'auto' ? 'Auto-save' : 'Manual'}
      </button>

      {/* Save button — only shown in manual mode */}
      {saveMode === 'manual' && (
        <button
          type="button"
          onClick={onManualSave}
          aria-label={isDirty ? 'Save diagram (unsaved changes)' : 'Save diagram'}
          title="Save diagram"
          className={[
            'px-2.5 py-1 rounded text-xs font-mono',
            'border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            isDirty
              ? 'text-white bg-blue-600 border-blue-500 hover:bg-blue-500 ring-2 ring-blue-400/40'
              : 'text-gray-400 border-gray-700 hover:text-gray-200 hover:border-gray-600',
          ].join(' ')}
        >
          Save
        </button>
      )}
    </div>
  );
}
