'use client';

import React from 'react';
import type { SaveMode, PlacedComponent, Frame, CanvasTransform } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { BrandLockup } from '@/components/ui/brand-lockup';
import { HeaderActions } from './header-actions';
import { DiagramTabs } from './diagram-tabs';
import { SaveModeToggle } from './save-mode-toggle';
import { ExportButton } from '@/components/features/canvas/export-button';

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
  showNewTab: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  onToggleSaveMode: (mode: SaveMode) => void;
  onManualSave: () => void;
  onBeforeSignOut: () => Promise<void>;
  onUpgrade?: () => void;
  exportLayerRef: React.RefObject<HTMLDivElement | null>;
  placedComponents: PlacedComponent[];
  frames: Frame[];
  activeDiagramName: string;
  transform: CanvasTransform;
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
    showNewTab,
    isSaving,
    lastSavedAt,
    onToggleSaveMode,
    onManualSave,
    onBeforeSignOut,
    onUpgrade,
    exportLayerRef,
    placedComponents,
    frames,
    activeDiagramName,
    transform,
  } = props;

  return (
    <header className="h-12 flex-shrink-0 bg-header-bg border-b border-header-border flex items-center px-4 gap-3">
      <BrandLockup />

      <Separator orientation="vertical" className="h-5 flex-shrink-0" />

      {/* Diagram tabs — takes remaining space and scrolls horizontally */}
      <DiagramTabs
        tabs={tabs}
        activeTabId={activeTabId}
        showNewTab={showNewTab}
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
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        onToggle={onToggleSaveMode}
        onManualSave={onManualSave}
      />

      <ExportButton
        exportLayerRef={exportLayerRef}
        placedComponents={placedComponents}
        frames={frames}
        diagramName={activeDiagramName}
        transform={transform}
      />

      <Separator orientation="vertical" className="h-5 flex-shrink-0" />

      {/* Auth / header actions */}
      <HeaderActions onUpgrade={onUpgrade} onBeforeSignOut={onBeforeSignOut} />
    </header>
  );
}
