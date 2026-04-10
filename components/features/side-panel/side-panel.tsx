'use client';

import { useCallback } from 'react';
import type { PaletteItem } from '@/lib/types';
import { PALETTE_SECTIONS } from '@/lib/constants';
import { useDragDrop } from '@/hooks/use-drag-drop';
import { PaletteSectionComponent } from './palette-section';

export function SidePanel() {
  const { handleDragStart } = useDragDrop();

  const onDragStart = useCallback(
    (item: PaletteItem) => handleDragStart(item.dragPayload),
    [handleDragStart]
  );

  return (
    <aside
      aria-label="Component palette"
      className="w-64 flex-shrink-0 bg-panel-bg border-r border-panel-border
        flex flex-col overflow-hidden"
    >
      {/* Panel header */}
      <div className="px-3 py-3 border-b border-panel-border">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Components
        </h2>
      </div>

      {/* Scrollable palette */}
      <nav
        aria-label="Component palette items"
        className="flex-1 overflow-y-auto scrollbar-thin py-1"
      >
        {PALETTE_SECTIONS.map((section) => (
          <PaletteSectionComponent
            key={section.id}
            section={section}
            onDragStart={onDragStart}
          />
        ))}
      </nav>
    </aside>
  );
}
