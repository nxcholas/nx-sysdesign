import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LandingNav } from '@/components/features/landing/landing-nav';
import { LandingHero } from '@/components/features/landing/landing-hero';
import { StatsBar } from '@/components/features/landing/stats-bar';
import { FeatureGrid } from '@/components/features/landing/feature-grid';
import { HowItWorksSection } from '@/components/features/landing/how-it-works';
import { ComponentShowcase } from '@/components/features/landing/component-showcase';
import { PricingSection } from '@/components/features/landing/pricing-section';
import { FaqSection } from '@/components/features/landing/faq-section';
import { CtaSection } from '@/components/features/landing/cta-section';
import { LandingFooter } from '@/components/features/landing/landing-footer';

export const metadata: Metadata = {
  title: 'NX-Design — Visualize System Architecture in Your Browser',
  description:
    'Drag-and-drop system design canvas with 100+ components, ERD tables, and live animated data-flow connections. Free to start, diagrams saved to the cloud.',
  keywords: 'system design, architecture diagram, ERD, data flow, drag and drop, browser tool, software architecture',
  openGraph: {
    title: 'NX-Design — Visualize System Architecture in Your Browser',
    description:
      'Drag-and-drop canvas for system design with live animated data flow. 100+ components, ERD tables, no setup required.',
    url: 'https://nxdesign.app',
    siteName: 'NX-Design',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NX-Design — System Design Visualizer',
    description:
      'Drag-and-drop canvas with 100+ components and live animated data-flow connections.',
  },
};

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect('/canvas');

  return (
    <div id="top">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>
      <LandingNav />
      <main id="main" className="bg-canvas-bg text-gray-200">
        <LandingHero />
        <StatsBar />

        <section
          id="features"
          aria-labelledby="features-heading"
          className="border-t border-panel-border/50 py-20 md:py-28"
        >
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <div className="mb-10">
              <p className="text-xs uppercase tracking-wider text-blue-400 font-mono mb-3">Features</p>
              <h2
                id="features-heading"
                className="text-3xl md:text-4xl font-semibold text-gray-50 mb-3 tracking-tight"
              >
                Everything you need to start designing.
              </h2>
              <p className="text-gray-400 max-w-2xl">
                Sketch fast, share easy, impress everyone.
              </p>
            </div>
            <FeatureGrid />
          </div>
        </section>

        <HowItWorksSection />

        <section
          aria-labelledby="showcase-heading"
          className="border-t border-panel-border/50 py-20 md:py-28"
        >
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <div className="mb-10">
              <p className="text-xs uppercase tracking-wider text-blue-400 font-mono mb-3">what&apos;s in the box</p>
              <h2
                id="showcase-heading"
                className="text-3xl md:text-4xl font-semibold text-gray-50 mb-3 tracking-tight"
              >
                100+ pieces. Infinite possibilities.
              </h2>
              <p className="text-gray-400 max-w-2xl">
                Load balancers, databases, queues, gateways — organized the way your brain already works.
              </p>
            </div>
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

        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
