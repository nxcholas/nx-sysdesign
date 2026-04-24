'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from './categories';
import { fadeUp, staggerContainerFast, viewportOnce } from '@/lib/motion';

import type { Variants } from 'framer-motion';

const pillVariant: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.0, 0.0, 0.2, 1] } },
};

export function ComponentShowcase(): React.ReactElement {
  return (
    <motion.div
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {categories.map((cat) => (
        <motion.div
          key={cat.name}
          variants={fadeUp}
          className="rounded-xl border border-panel-border bg-header-bg/40 p-5
            hover:border-panel-border/80 transition-colors duration-200"
        >
          <h3 className="text-sm font-semibold text-gray-100 mb-3 font-mono">{cat.name}</h3>
          <AnimatePresence mode="wait">
            <motion.div
              key={cat.name}
              variants={staggerContainerFast}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap"
            >
              {cat.items.map((item) => (
                <motion.span
                  key={item}
                  variants={pillVariant}
                  className="inline-flex px-2.5 py-1 rounded-full border border-panel-border
                    bg-canvas-bg text-xs font-mono text-gray-300 mr-1.5 mb-1.5
                    hover:border-blue-500/40 hover:text-blue-300 transition-colors duration-150
                    cursor-default"
                >
                  {item}
                </motion.span>
              ))}
              {cat.moreCount > 0 && (
                <motion.span
                  variants={pillVariant}
                  className="inline-flex px-2.5 py-1 rounded-full border border-panel-border/50
                    bg-canvas-bg text-xs font-mono text-gray-500 mr-1.5 mb-1.5"
                >
                  +{cat.moreCount} more
                </motion.span>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
}
