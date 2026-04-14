'use client';

import { useCallback, useMemo, useState } from 'react';
import type { PaletteItem } from '@/lib/types';
import { PALETTE_SECTIONS } from '@/lib/constants';
import { useDragDrop } from '@/hooks/use-drag-drop';
import { PaletteSectionComponent } from './palette-section';

export function SidePanel() {
  const { handleDragStart } = useDragDrop();
  const [query, setQuery] = useState('');

  const onDragStart = useCallback(
    (item: PaletteItem) => handleDragStart(item.dragPayload),
    [handleDragStart]
  );

  const filteredSections = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return PALETTE_SECTIONS;

    return PALETTE_SECTIONS
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.label.toLowerCase().includes(trimmed)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  const isFiltering = query.trim().length > 0;

  return (
    <aside
      aria-label="Component palette"
      className="w-64 flex-shrink-0 bg-panel-bg border-r border-panel-border
        flex flex-col overflow-hidden"
    >
      {/* Panel header */}
      <div className="px-3 py-3 border-b border-panel-border flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Components
        </h2>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components..."
            aria-label="Search components"
            className="w-full bg-panel-border/30 border border-panel-border rounded
              pl-7 pr-2 py-1 text-xs text-gray-200 placeholder-gray-500
              focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
              transition-colors"
          />
        </div>
      </div>

      {/* Scrollable palette */}
      <nav
        aria-label="Component palette items"
        className="flex-1 overflow-y-auto scrollbar-thin py-1"
      >
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <PaletteSectionComponent
              key={section.id}
              section={section}
              onDragStart={onDragStart}
              forceOpen={isFiltering}
            />
          ))
        ) : (
          <p className="px-3 py-4 text-xs text-gray-500 text-center">
            No components match &ldquo;{query.trim()}&rdquo;
          </p>
        )}
      </nav>
    </aside>
  );
}
