import type { Metadata } from 'next';
import { LandingNav } from '@/components/features/landing/landing-nav';
import { LandingHero } from '@/components/features/landing/landing-hero';
import { FeatureGrid } from '@/components/features/landing/feature-grid';
import { ComponentShowcase } from '@/components/features/landing/component-showcase';
import { PricingSection } from '@/components/features/landing/pricing-section';
import { FaqSection } from '@/components/features/landing/faq-section';
import { LandingFooter } from '@/components/features/landing/landing-footer';

export const metadata: Metadata = {
  title: 'SysDesign — Visualize system design with live data flow',
  description:
    'SysDesign is a drag-and-drop canvas for modern architecture — components, ERDs, and live data-flow animations, right in the browser.',
};

export default function LandingPage() {
  return (
    <div id="top">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>
      <LandingNav />
      <main id="main" className="min-h-screen bg-canvas-bg text-gray-200">
        <LandingHero />
        <section
          id="features"
          aria-labelledby="features-heading"
          className="border-t border-panel-border/50 py-20 md:py-28"
        >
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <h2
              id="features-heading"
              className="text-3xl md:text-4xl font-semibold text-gray-50 mb-3 tracking-tight"
            >
              Built for developers thinking in systems.
            </h2>
            <p className="text-gray-400 mb-10 max-w-2xl">
              Everything you need to sketch an architecture, and nothing you don&apos;t.
            </p>
            <FeatureGrid />
          </div>
        </section>
        <section
          aria-labelledby="showcase-heading"
          className="border-t border-panel-border/50 py-20 md:py-28"
        >
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <h2
              id="showcase-heading"
              className="text-3xl md:text-4xl font-semibold text-gray-50 mb-3 tracking-tight"
            >
              Every building block you need.
            </h2>
            <p className="text-gray-400 mb-10 max-w-2xl">
              From load balancers to ER tables — 100+ components grouped the way you already think.
            </p>
            <ComponentShowcase />
          </div>
        </section>
        <section
          id="pricing"
          aria-labelledby="pricing-heading"
          className="border-t border-panel-border/50 py-20 md:py-28"
        >
          <PricingSection />
        </section>
        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="border-t border-panel-border/50 py-20 md:py-28"
        >
          <FaqSection />
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
