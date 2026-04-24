import React from 'react';
import Link from 'next/link';
import { BrandLockup } from '@/components/ui/brand-lockup';

export function LandingNav(): React.ReactElement {
  return (
    <header className="sticky top-0 z-40 h-16 bg-header-bg/80 backdrop-blur border-b border-header-border">
      <div className="mx-auto max-w-6xl h-full px-6 md:px-8 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
          <BrandLockup />
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-gray-400 hover:text-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-gray-400 hover:text-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-sm text-gray-400 hover:text-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center h-9 px-4 rounded-md border border-panel-border
              text-sm font-medium text-gray-200 hover:bg-header-bg transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-9 px-4 rounded-md
              bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
