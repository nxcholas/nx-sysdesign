'use client';

import { useState } from 'react';
import type { PaletteSection, PaletteItem } from '@/lib/types';
import { PaletteItemComponent } from './palette-item';
import { Separator } from '@/components/ui/separator';

interface PaletteSectionProps {
  section: PaletteSection;
  onDragStart: (item: PaletteItem) => (e: React.DragEvent) => void;
}

export function PaletteSectionComponent({ section, onDragStart }: PaletteSectionProps) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left
          text-gray-400 uppercase tracking-widest hover:text-gray-200 transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-expanded={isOpen}
        aria-controls={`section-${section.id}`}
      >
        <span>{section.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? '' : '-rotate-90'}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id={`section-${section.id}`}
          className="px-2 pb-2 grid grid-cols-3 gap-1"
        >
          {section.items.map((item) => (
            <PaletteItemComponent
              key={item.id}
              item={item}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      )}

      <Separator className="mx-3" />
    </div>
  );
}
