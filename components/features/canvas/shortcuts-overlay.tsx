'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortcutsOverlayProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutRow {
  keys: string[];
  action: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutRow[];
}

const SHORTCUT_GROUPS: ShortcutGroup[][] = [
  // Left column
  [
    {
      title: 'Tools',
      shortcuts: [
        { keys: ['V'], action: 'Select tool' },
        { keys: ['Space', 'drag'], action: 'Pan canvas' },
        { keys: ['F'], action: 'Frame tool' },
        { keys: ['T'], action: 'Text block tool' },
        { keys: ['U'], action: 'Shape tool' },
      ],
    },
    {
      title: 'Edit',
      shortcuts: [
        { keys: ['Ctrl', 'Z'], action: 'Undo' },
        { keys: ['Ctrl', 'C'], action: 'Copy' },
        { keys: ['Ctrl', 'V'], action: 'Paste' },
        { keys: ['Del'], action: 'Delete selected' },
      ],
    },
  ],
  // Right column
  [
    {
      title: 'Canvas',
      shortcuts: [
        { keys: ['Scroll'], action: 'Zoom in / out' },
        { keys: ['Ctrl', '0'], action: 'Reset zoom' },
      ],
    },
    {
      title: 'General',
      shortcuts: [
        { keys: ['?'], action: 'Show shortcuts' },
        { keys: ['Esc'], action: 'Deselect / close' },
      ],
    },
  ],
];

function KeyChip({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium text-gray-200 bg-gray-800 border border-gray-700 leading-none">
      {label}
    </kbd>
  );
}

function ShortcutGroupSection({ group }: { group: ShortcutGroup }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
        {group.title}
      </p>
      <ul className="space-y-1.5">
        {group.shortcuts.map((row) => (
          <li key={row.action} className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-400">{row.action}</span>
            <span className="flex items-center gap-1 flex-shrink-0">
              {row.keys.map((k, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-gray-600 text-xs">+</span>}
                  <KeyChip label={k} />
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ShortcutsOverlay({ open, onClose }: ShortcutsOverlayProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="relative w-full max-w-xl bg-[#111318] border border-[#2a2d35] rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#2a2d35]">
              <h2 className="text-base font-semibold text-gray-100">Keyboard Shortcuts</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-300 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Close shortcuts overlay"
              >
                <X size={18} />
              </button>
            </div>

            {/* Two-column shortcut grid */}
            <div className="grid grid-cols-2 gap-x-6 px-6 py-5">
              {SHORTCUT_GROUPS.map((column, colIdx) => (
                <div key={colIdx}>
                  {column.map((group) => (
                    <ShortcutGroupSection key={group.title} group={group} />
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
