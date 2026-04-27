'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X } from 'lucide-react';
import { useActiveSection } from '@/hooks/use-active-section';
import { easeInOut } from '@/lib/motion';
import type { ChangelogEntry } from './changelog-data';

type Props = {
  entries: ChangelogEntry[];
};

function tocId(version: string): string {
  return version.replace(/\s+/g, '-').toLowerCase();
}

function TocList({
  entries,
  activeId,
  onSelect,
}: {
  entries: ChangelogEntry[];
  activeId: string;
  onSelect?: () => void;
}) {
  return (
    <ul role="list" className="flex flex-col gap-0.5">
      {entries.map((entry) => {
        const id = tocId(entry.version);
        const isActive = activeId === id;
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={onSelect}
              className={`group flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-mono transition-colors duration-150 cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas-bg
                ${isActive ? 'text-blue-400 bg-blue-400/5' : 'text-gray-500 hover:text-gray-300 hover:bg-panel-hover/60'}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-150 ${
                  isActive ? 'bg-blue-400' : 'bg-gray-600 group-hover:bg-gray-400'
                }`}
                aria-hidden="true"
              />
              {entry.version}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function ChangelogToc({ entries }: Props): React.ReactElement {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const ids = entries.map((e) => tocId(e.version));
  const activeId = useActiveSection(ids);

  return (
    <>
      {/* Desktop sticky TOC */}
      <aside className="hidden lg:block w-52 shrink-0">
        <nav
          aria-label="Changelog versions"
          className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2"
        >
          <p className="text-xs uppercase tracking-wider text-gray-600 font-mono mb-3 px-3">
            Versions
          </p>
          <TocList entries={entries} activeId={activeId} />
        </nav>
      </aside>

      {/* Mobile floating trigger */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          aria-label="Open versions list"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-panel-bg border border-panel-border
            text-sm text-gray-300 shadow-lg hover:text-white hover:border-gray-500 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          <List size={15} aria-hidden="true" />
          Versions
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: easeInOut }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Versions"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: easeInOut }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-panel-bg border-t border-panel-border rounded-t-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-panel-border/50">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-mono">
                  Versions
                </span>
                <button
                  type="button"
                  aria-label="Close versions list"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400
                    hover:text-gray-100 hover:bg-panel-hover transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
              <div className="px-3 py-3">
                <TocList
                  entries={entries}
                  activeId={activeId}
                  onSelect={() => setDrawerOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
