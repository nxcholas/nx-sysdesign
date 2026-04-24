'use client';

import React, { useState } from 'react';
import { PricingCard } from './pricing-card';

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

const togglePill = 'px-3 py-1.5 text-xs font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

export function PricingSection(): React.ReactElement {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-8">
      <div className="flex flex-col items-start md:items-center gap-3 mb-10 md:text-center">
        <h2 id="pricing-heading" className="text-3xl md:text-4xl font-semibold text-gray-50 tracking-tight">
          Simple pricing.
        </h2>
        <p className="text-gray-400 max-w-2xl">
          Start free. Upgrade to Pro for unlimited diagrams and cross-device sync.
        </p>
        <div
          role="group"
          aria-label="Billing period"
          className="inline-flex items-center gap-1 p-1 rounded-full border border-panel-border bg-header-bg/60"
        >
          <button
            type="button"
            onClick={() => setAnnual(false)}
            aria-pressed={!annual}
            className={`${togglePill} ${!annual ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-100'}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            aria-pressed={annual}
            className={`${togglePill} ${annual ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-100'}`}
          >
            Annual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <PricingCard
          tier="Free"
          price="$0"
          period="forever"
          features={freeFeatures}
          ctaLabel="Open editor"
          ctaHref="/app"
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
        />
      </div>
    </div>
  );
}
