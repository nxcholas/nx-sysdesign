import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, viewportOnce } from '@/lib/motion';
import type { ChangelogEntry, ChangelogItemType } from './changelog-data';

const typeDot: Record<ChangelogItemType, string> = {
  feat: 'bg-blue-400',
  fix: 'bg-amber-400',
  chore: 'bg-gray-500',
};

const typeLabel: Record<ChangelogItemType, string> = {
  feat: 'text-blue-400',
  fix: 'text-amber-400',
  chore: 'text-gray-500',
};

type Props = {
  entry: ChangelogEntry;
};

export function ChangelogSection({ entry }: Props): React.ReactElement {
  const sectionId = entry.version.replace(/\s+/g, '-').toLowerCase();

  return (
    <motion.section
      id={sectionId}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      aria-labelledby={`heading-${sectionId}`}
      className="scroll-mt-28 border-b border-panel-border/40 pb-10 last:border-0"
    >
      {/* Version badge + date */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1.5">
          <h2
            id={`heading-${sectionId}`}
            className="font-mono text-lg font-semibold text-gray-50 tracking-tight"
          >
            {entry.version}
          </h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded border border-blue-400/30 bg-blue-400/5 text-xs font-mono text-blue-400 select-none">
            release
          </span>
        </div>
        <p className="font-mono text-sm text-gray-500">{entry.date}</p>
      </div>

      {/* Bullet list */}
      <ul className="flex flex-col gap-2.5" role="list">
        {entry.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${typeDot[item.type]}`}
              aria-hidden="true"
            />
            <span className="text-sm text-gray-300 leading-relaxed">
              <span className={`font-mono text-xs mr-2 ${typeLabel[item.type]}`}>
                {item.type}
              </span>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
