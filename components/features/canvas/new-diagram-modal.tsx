'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates/index';
import type { DiagramTemplate } from '@/lib/templates/index';
import { TemplateCard } from './template-card';

interface NewDiagramModalProps {
  onClose: () => void;
  onSelect: (template: DiagramTemplate) => void;
}

export function NewDiagramModal({ onClose, onSelect }: NewDiagramModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-diagram-title"
        className="w-full max-w-4xl bg-[#111318] border border-[#2a2d35] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h2 id="new-diagram-title" className="text-lg font-semibold text-gray-100">New Diagram</h2>
          <button
            autoFocus
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onSelect(template)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
