'use client';

import type { DiagramTemplate } from '@/lib/templates/index';

interface TemplateCardProps {
  template: DiagramTemplate;
  onSelect: () => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className="bg-[#1a1d24] border border-[#2a2d35] rounded-xl cursor-pointer p-3 hover:border-blue-500/50 hover:bg-[#1e2230] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[#111318]"
    >
      <div className="h-28 bg-[#0d1117] rounded-lg overflow-hidden flex items-center justify-center">
        {template.thumbnail}
      </div>
      <p className="text-sm font-medium text-gray-100 mt-3">{template.name}</p>
      <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2 min-h-[2.5rem]">{template.description}</p>
    </div>
  );
}
