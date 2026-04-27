'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaqItem } from './faq-item';
import { faq } from './faq';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';

export function FaqSection(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mb-10"
      >
        <motion.p variants={fadeUp} className="text-xs uppercase tracking-wider text-blue-400 font-mono mb-3">
          FAQ
        </motion.p>
        <motion.h2
          id="faq-heading"
          variants={fadeUp}
          className="text-3xl md:text-4xl font-semibold text-gray-50 mb-3 tracking-tight"
        >
          You asked, we answered.
        </motion.h2>
        <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl">
          No fluff, just the stuff you actually want to know.
        </motion.p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {faq.map((item) => (
          <motion.div key={item.q} variants={fadeUp}>
            <FaqItem q={item.q} a={item.a} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
