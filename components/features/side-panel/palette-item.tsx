'use client';

import type { PaletteItem } from '@/lib/types';
import { HttpMethodBadge } from '@/components/features/blocks/http-method-badge';
import { StatusCodeBadge } from '@/components/features/blocks/status-code-badge';
import { BlockRenderer } from '@/components/features/blocks/block-renderer';

interface PaletteItemProps {
  item: PaletteItem;
  onDragStart: (item: PaletteItem) => (e: React.DragEvent) => void;
}

function PaletteItemVisual({ item }: { item: PaletteItem }) {
  const { dragPayload } = item;

  if (dragPayload.type === 'http-method') {
    return <HttpMethodBadge method={dragPayload.method} size="sm" />;
  }

  if (dragPayload.type === 'status-code') {
    return <StatusCodeBadge group={dragPayload.group} size="sm" />;
  }

  if (dragPayload.type === 'block') {
    return <BlockRenderer kind={dragPayload.kind} size="sm" />;
  }

  return null;
}

export function PaletteItemComponent({ item, onDragStart }: PaletteItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard accessibility: Enter/Space triggers drag intent
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Future: place at canvas center on keyboard activation
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart(item)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Drag ${item.label} onto canvas`}
      className="flex flex-col items-center gap-1.5 p-2 rounded cursor-grab
        hover:bg-panel-hover focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-blue-500 select-none transition-colors active:cursor-grabbing"
    >
      <PaletteItemVisual item={item} />
    </div>
  );
}
