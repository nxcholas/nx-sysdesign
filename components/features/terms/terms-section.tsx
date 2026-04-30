'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, viewportOnce } from '@/lib/motion';
import type { TermsSection } from './terms-data';

type Props = {
  section: TermsSection;
};

export function TermsSection({ section }: Props): React.ReactElement {
  const headingId = `heading-${section.id}`;

  return (
    <motion.section
      id={section.id}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      aria-labelledby={headingId}
      className="scroll-mt-28 border-t border-panel-border/50 pt-8 mt-8 first:border-0 first:pt-0 first:mt-0"
    >
      {/* Section number + title */}
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wider text-blue-400 font-mono mb-2">
          {String(section.number).padStart(2, '0')}
        </p>
        <h2
          id={headingId}
          className="text-xl font-semibold text-gray-50 tracking-tight"
        >
          {section.title}
        </h2>
      </div>

      {/* Paragraphs */}
      {section.paragraphs.length > 0 && (
        <div className="flex flex-col gap-3">
          {section.paragraphs.map((para, i) => (
            <p key={i} className="text-gray-400 leading-relaxed max-w-prose">
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Bullet list */}
      {section.bullets && section.bullets.length > 0 && (
        <ul
          role="list"
          className={`flex flex-col gap-2.5 ${section.paragraphs.length > 0 ? 'mt-3' : ''}`}
        >
          {section.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 bg-gray-600"
                aria-hidden="true"
              />
              <span className="text-gray-400 leading-relaxed max-w-prose text-sm">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
