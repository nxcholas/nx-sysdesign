'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUp, viewportOnce, easeInOut } from '@/lib/motion';

export function CtaSection(): React.ReactElement {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="cta-heading"
      className="border-t border-panel-border/50 py-24 md:py-32 relative overflow-hidden"
    >
      {/* Animated radial gradient background */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        animate={reduce ? {} : {
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: easeInOut }}
      >
        <div className="h-[500px] w-[800px] rounded-full bg-blue-600/8 blur-[100px]" />
      </motion.div>

      {/* Diagonal line pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #60a5fa,
            #60a5fa 1px,
            transparent 1px,
            transparent 40px
          )`,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 md:px-8 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col items-center gap-6"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-wider text-blue-400 font-mono">
            start building now
          </motion.p>

          <motion.h2
            id="cta-heading"
            variants={fadeUp}
            className="text-4xl md:text-5xl font-semibold text-gray-50 tracking-tight leading-tight"
          >
            Let's make your vision come to
            <br />
            <span className="text-blue-400">life.</span>
          </motion.h2>

          <motion.p variants={fadeUp} className="text-gray-400 max-w-xl text-lg leading-relaxed">
            Free account, no credit card, no configuration. Open the editor and start building in the next 30 seconds.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Link
              href="/canvas"
              className="inline-flex items-center justify-center h-12 px-7 rounded-md
                bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-bg
                shadow-lg shadow-blue-600/25"
            >
              Open editor →
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center h-12 px-7 rounded-md
                border border-panel-border hover:bg-header-bg text-gray-200 text-sm font-medium
                transition-colors focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-blue-500 focus-visible:ring-offset-2
                focus-visible:ring-offset-canvas-bg"
            >
              View pricing
            </a>
          </motion.div>

          <motion.p variants={fadeUp} className="text-xs text-gray-600 font-mono">
            Free to start · No credit card required
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
