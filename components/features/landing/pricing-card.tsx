'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';
import { ComingSoonButton } from './coming-soon-button';

interface PricingCardProps {
  tier: string;
  price: string;
  period: string;
  helper?: string;
  features: string[];
  ctaLabel: string;
  ctaHref?: string;
  disabled?: boolean;
  highlighted?: boolean;
  mostPopular?: boolean;
}

const primaryBtn =
  'inline-flex items-center justify-center h-11 px-5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-bg w-full';

export function PricingCard({
  tier,
  price,
  period,
  helper,
  features,
  ctaLabel,
  ctaHref,
  disabled,
  highlighted,
  mostPopular,
}: PricingCardProps): React.ReactElement {
  return (
    <motion.div
      variants={fadeUp}
      className={`relative rounded-xl border bg-header-bg/60 p-8 flex flex-col gap-6
        transition-shadow duration-300
        ${highlighted
          ? 'border-blue-500/50 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20'
          : 'border-panel-border hover:border-panel-border/80'
        }`}
    >
      {/* Subtle top glow for highlighted card */}
      {highlighted && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent rounded-t-xl"
        />
      )}

      {/* Most Popular badge */}
      {mostPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold
            bg-blue-600 text-white border border-blue-500/50 shadow-sm shadow-blue-500/30 whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-gray-400 tracking-widest uppercase font-mono">{tier}</h3>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-semibold text-gray-50">{price}</span>
          <span className="text-sm text-gray-400">{period}</span>
        </div>
        {helper && <p className="mt-1 text-xs text-blue-400/80 font-mono">{helper}</p>}
      </div>

      <ul className="flex flex-col gap-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
            <Check size={15} className="text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {disabled ? (
          <ComingSoonButton variant="primary" fullWidth>
            {ctaLabel}
          </ComingSoonButton>
        ) : (
          <Link href={ctaHref || '/canvas'} className={primaryBtn}>
            {ctaLabel}
          </Link>
        )}
      </div>
    </motion.div>
  );
}
