'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion';
import { TermsToc } from './terms-toc';
import { TermsSection } from './terms-section';
import { termsSections } from './terms-data';

export function TermsView(): React.ReactElement {
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
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-50 tracking-tight mb-3">
          Terms of Use
        </h1>
        <p className="text-gray-400 max-w-xl mb-3">
          Please read these Terms carefully before using NX-Design. By using the service, you agree to be bound by these Terms.
        </p>
        <p className="text-xs text-gray-600 font-mono">
          Effective date:{' '}
          <time dateTime="2026-04-30">April 30, 2026</time>
        </p>
      </motion.div>

      {/* Two-column layout */}
      <div className="mx-auto max-w-6xl px-6 md:px-8 py-12">
        <div className="flex gap-12">
          {/* Left TOC (desktop) + mobile select/drawer */}
          <TermsToc sections={termsSections} />

          {/* Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex-1 min-w-0"
          >
            {termsSections.map((section) => (
              <TermsSection key={section.id} section={section} />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
