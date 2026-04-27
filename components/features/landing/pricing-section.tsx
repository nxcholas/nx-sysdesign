'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PricingCard } from './pricing-card';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';

const freeFeatures = [
  'Unlimited local diagrams',
  '100+ system design components',
  'ERD tables with cardinality',
  'Animated data-flow connections',
  'Auto-save in your browser',
];

const proFeatures = [
  'Everything in Free',
  'Account sync across devices',
  'Priority support',
  'Early access to new features',
];

export function PricingSection(): React.ReactElement {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="flex flex-col items-start md:items-center gap-4 mb-12 md:text-center"
      >
        <motion.p variants={fadeUp} className="text-xs uppercase tracking-wider text-blue-400 font-mono">
          pick your plan
        </motion.p>
        <motion.h2
          id="pricing-heading"
          variants={fadeUp}
          className="text-3xl md:text-4xl font-semibold text-gray-50 tracking-tight"
        >
          No surprises. Ever.
        </motion.h2>
        <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl">
          Start free, stay free, or go Pro when you&apos;re ready.
        </motion.p>

        {/* Toggle */}
        <motion.div variants={fadeUp}>
          <div
            role="group"
            aria-label="Billing period"
            className="relative inline-flex items-center gap-1 p-1 rounded-full border border-panel-border bg-header-bg/60"
          >
            {/* Sliding background pill */}
            <motion.span
              aria-hidden="true"
              className="absolute top-1 h-7 rounded-full bg-blue-600"
              animate={{
                left: annual ? 'calc(50% + 2px)' : '4px',
                width: annual ? 'calc(50% - 6px)' : 'calc(50% - 6px)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            <button
              type="button"
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
              className="relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                min-w-[72px]"
              style={{ color: !annual ? '#fff' : undefined }}
            >
              <span className={!annual ? 'text-white' : 'text-gray-400 hover:text-gray-100'}>Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
              className="relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                min-w-[72px]"
            >
              <span className={annual ? 'text-white' : 'text-gray-400 hover:text-gray-100'}>
                Annual
                {!annual && (
                  <span className="ml-1 text-[10px] text-blue-400">–25%</span>
                )}
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        <PricingCard
          tier="Free"
          price="$0"
          period="forever"
          features={freeFeatures}
          ctaLabel="Open editor"
          ctaHref="/canvas"
        />
        <PricingCard
          tier="Pro"
          price={annual ? '$45' : '$5'}
          period={annual ? '/year' : '/month'}
          helper={annual ? '$3.75/month billed annually' : undefined}
          features={proFeatures}
          ctaLabel="Get started"
          ctaHref="/sign-in"
          highlighted
          mostPopular
        />
      </motion.div>
    </div>
  );
}
