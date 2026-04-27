'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BrandLockup } from '@/components/ui/brand-lockup';
import { fadeIn, viewportOnce } from '@/lib/motion';

const productLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '/changelog', label: 'Changelog' },
];

const appLinks = [
  { href: '/canvas', label: 'Open editor' },
  { href: '/register', label: 'Get started' },
  { href: '/sign-in', label: 'Sign in' },
];

export function LandingFooter(): React.ReactElement {
  return (
    <motion.footer
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="border-t border-panel-border bg-header-bg/40"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
              <BrandLockup showVersion={false} />
            </Link>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              A drag-and-drop canvas for visualizing system architecture, data flow, and
              component relationships — right in your browser.
            </p>
            <span className="text-xs text-gray-600 font-mono">
              v{process.env.NEXT_PUBLIC_APP_VERSION}-stable
            </span>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-1">
              Product
            </h3>
            {productLinks.map((link) => {
              const footerLinkClass = `text-sm text-gray-500 hover:text-gray-300 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded
                w-fit`;
              return link.href.startsWith('#') ? (
                <a key={link.href} href={link.href} className={footerLinkClass}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className={footerLinkClass}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* App links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-1">
              Account
            </h3>
            {appLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded
                  w-fit"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-panel-border/50 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-600">
          <span>© 2026 NX-Design. All rights reserved.</span>
          <a
            href="#top"
            className="hover:text-gray-400 transition-colors focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </motion.footer>
  );
}
