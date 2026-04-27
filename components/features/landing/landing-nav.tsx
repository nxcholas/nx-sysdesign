'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BrandLockup } from '@/components/ui/brand-lockup';
import { easeOut, easeInOut } from '@/lib/motion';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '/changelog', label: 'Changelog' },
];

export function LandingNav(): React.ReactElement {
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduce = useReducedMotion();

  const itemVariants = {
    hidden: { opacity: 0, y: reduce ? 0 : -8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 + i * 0.06, duration: 0.35, ease: easeOut },
    }),
  };

  return (
    <header className="sticky top-0 z-40 bg-header-bg/80 backdrop-blur border-b border-header-border">
      <div className="mx-auto max-w-6xl h-16 px-6 md:px-8 flex items-center justify-between gap-6">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, x: reduce ? 0 : -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <Link
            href="/"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            <BrandLockup />
          </Link>
        </motion.div>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => {
            const linkClass = `relative text-sm text-gray-400 hover:text-gray-100 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded
              after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-blue-500
              after:transition-all after:duration-200 hover:after:w-full`;

            return link.href.startsWith('#') ? (
              <motion.a
                key={link.href}
                href={link.href}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className={linkClass}
              >
                {link.label}
              </motion.a>
            ) : (
              <motion.div
                key={link.href}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-9 px-4 rounded-md border border-panel-border
                text-sm font-medium text-gray-200 hover:bg-header-bg transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Sign in
            </Link>
          </motion.div>
          <motion.div custom={4} variants={itemVariants} initial="hidden" animate="visible">
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-9 px-4 rounded-md
                bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Get started
            </Link>
          </motion.div>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md
            text-gray-400 hover:text-gray-100 hover:bg-panel-hover transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: easeInOut }}
            className="md:hidden overflow-hidden border-t border-header-border bg-header-bg"
          >
            <nav aria-label="Mobile primary" className="flex flex-col px-6 py-4 gap-1">
              {navLinks.map((link) => {
                const mobileLinkClass = `text-sm text-gray-300 hover:text-white py-2.5 border-b border-panel-border/40
                  last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-blue-500 rounded`;
                return link.href.startsWith('#') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={mobileLinkClass}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={mobileLinkClass}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-2 pt-3">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-panel-border
                    text-sm font-medium text-gray-200 hover:bg-panel-hover transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-md
                    bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Get started
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
