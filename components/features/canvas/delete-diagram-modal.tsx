'use client';

import { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteDiagramModalProps {
  diagramName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDiagramModal({ diagramName, onConfirm, onCancel }: DeleteDiagramModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-diagram-title"
        className="w-full max-w-sm bg-[#111318] border border-[#2a2d35] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex-shrink-0">
            <Trash2 size={20} className="text-red-400" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <h2 id="delete-diagram-title" className="text-base font-semibold text-gray-100">
              Delete diagram?
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-gray-200 font-medium">&ldquo;{diagramName}&rdquo;</span> will be permanently deleted.
              This cannot be undone.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="flex-1 h-9 rounded-lg border border-[#2a2d35] text-sm font-medium text-gray-300 hover:bg-[#1e2230] hover:border-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-9 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
