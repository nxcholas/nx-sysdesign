import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const primaryBtn =
  'inline-flex items-center justify-center h-11 px-5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-bg';

const ghostBtn =
  'inline-flex items-center justify-center h-11 px-5 rounded-md border border-panel-border hover:bg-header-bg text-gray-200 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-bg';

export function LandingHero(): React.ReactElement {
  return (
    <section aria-labelledby="hero-heading" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="flex flex-col items-start gap-6 max-w-3xl">
          <span className="text-xs uppercase tracking-wider text-blue-400 font-mono">
            SYSTEM DESIGN, VISUALIZED
          </span>
          <h1
            id="hero-heading"
            className="text-4xl md:text-6xl font-semibold tracking-tight text-gray-50"
          >
            Diagram your system. Watch the data move.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl">
            SysDesign is a drag-and-drop canvas for modern architecture — components, ERDs, and live data-flow animations, right in the browser.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Link href="/app" className={primaryBtn}>
              Open editor →
            </Link>
            <a href="#features" className={ghostBtn}>
              See features
            </a>
          </div>
        </div>

        <div className="mt-14 md:mt-20 relative aspect-video rounded-xl border border-panel-border shadow-2xl shadow-black/40 overflow-hidden bg-header-bg/40">
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm font-mono">
            Add public/landing-hero.png
          </div>
          <Image
            src="/landing-hero.png"
            alt="SysDesign canvas with components connected by animated data-flow lines"
            title="TODO: replace with screenshot"
            width={1920}
            height={1080}
            priority
            className="relative z-10 w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
