'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';
import { ChangelogToc } from './changelog-toc';
import { ChangelogSection } from './changelog-section';
import type { ChangelogEntry } from './changelog-data';

type Props = {
  entries: ChangelogEntry[];
};

export function ChangelogView({ entries }: Props): React.ReactElement {
  return (
    <div className="bg-canvas-bg text-gray-200 min-h-screen">
      {/* Page header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl px-6 md:px-8 pt-16 pb-12 border-b border-panel-border/50"
      >
        <p className="text-xs uppercase tracking-wider text-blue-400 font-mono mb-3">
          Changelog
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-50 tracking-tight mb-3">
          What&apos;s new in NX-Design
        </h1>
        <p className="text-gray-400 max-w-xl">
          Every update, most recent first. Updated continuously as the product evolves.
        </p>
      </motion.div>

      {/* Two-column layout */}
      <div className="mx-auto max-w-6xl px-6 md:px-8 py-12">
        <div className="flex gap-12">
          {/* Left TOC (desktop) + mobile drawer trigger */}
          <ChangelogToc entries={entries} />

          {/* Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex-1 min-w-0 flex flex-col gap-10"
          >
            {entries.map((entry) => (
              <ChangelogSection key={entry.version} entry={entry} />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
