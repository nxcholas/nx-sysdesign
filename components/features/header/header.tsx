'use client';

import React from 'react';
import type { SaveMode } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { HeaderActions } from './header-actions';
import { DiagramTabs } from './diagram-tabs';
import { SaveModeToggle } from './save-mode-toggle';

interface HeaderProps {
  tabs: Array<{ id: string; name: string }>;
  activeTabId: string;
  saveMode: SaveMode;
  isDirty: boolean;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onRenameTab: (id: string, name: string) => void;
  onReorderTabs: (newOrder: string[]) => void;
  onNewTab: () => void;
  onToggleSaveMode: (mode: SaveMode) => void;
  onManualSave: () => void;
}

export function Header(props: HeaderProps): React.ReactElement {
  const {
    tabs,
    activeTabId,
    saveMode,
    isDirty,
    onSelectTab,
    onCloseTab,
    onRenameTab,
    onReorderTabs,
    onNewTab,
    onToggleSaveMode,
    onManualSave,
  } = props;

  return (
    <header className="h-12 flex-shrink-0 bg-header-bg border-b border-header-border flex items-center px-4 gap-3">
      {/* Logo / brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          aria-hidden="true"
          className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-100 tracking-tight">
          SysDesign
        </span>
      </div>

      <Separator orientation="vertical" className="h-5 flex-shrink-0" />

      {/* Diagram tabs — takes remaining space and scrolls horizontally */}
      <DiagramTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSelect={onSelectTab}
        onClose={onCloseTab}
        onRename={onRenameTab}
        onReorder={onReorderTabs}
        onNewTab={onNewTab}
      />

      {/* Save mode toggle */}
      <SaveModeToggle
        saveMode={saveMode}
        isDirty={isDirty}
        onToggle={onToggleSaveMode}
        onManualSave={onManualSave}
      />

      <Separator orientation="vertical" className="h-5 flex-shrink-0" />

      {/* Auth / header actions */}
      <HeaderActions />
    </header>
  );
}
