'use client';

import React from 'react';
import type { SaveMode } from '@/lib/types';

interface SaveModeToggleProps {
  saveMode: SaveMode;
  isDirty: boolean;
  onToggle: (mode: SaveMode) => void;
  onManualSave: () => void;
}

export function SaveModeToggle(props: SaveModeToggleProps): React.ReactElement {
  const { saveMode, isDirty, onToggle, onManualSave } = props;

  const nextMode: SaveMode = saveMode === 'auto' ? 'manual' : 'auto';

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
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
