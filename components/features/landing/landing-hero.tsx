'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce, easeOut, easeInOut, linear, backOut } from '@/lib/motion';

const primaryBtn =
  'inline-flex items-center justify-center h-11 px-5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-bg';

const ghostBtn =
  'inline-flex items-center justify-center h-11 px-5 rounded-md border border-panel-border hover:bg-header-bg text-gray-200 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-bg';

/*
 * DiagramPreview — SVG that faithfully replicates actual app canvas components.
 *
 * Component visual specs from block-registry / icon-shapes:
 *   User        — circle,        bg #2563eb  border #60a5fa
 *   API Gateway — hexagon,       bg #6d28d9  border #8b5cf6
 *   Microservice— rect,          bg #0f766e  border #14b8a6
 *   SQL DB      — cylinder,      bg #059669  border #34d399
 *   Redis Cache — rect (red),    bg #b91c1c  border #f87171
 *   Msg Queue   — parallelogram, bg #a16207  border #eab308
 *
 * Connections: stroke #6b7280 (gray-500), width 2, rounded caps
 * Data flow dot: r=4, fill #3b82f6, glow filter
 */
function DiagramPreview() {
  // Edge paths (M source-exit L target-entry straight lines)
  const edges = [
    { id: 'e0', d: 'M 112 130 L 196 108' },   // User → API Gateway
    { id: 'e1', d: 'M 268 108 L 340 130' },   // API Gateway → Microservice
    { id: 'e2', d: 'M 420 118 L 488 95' },    // Microservice → SQL DB
    { id: 'e3', d: 'M 420 142 L 488 165' },   // Microservice → Redis
  ];

  return (
    <svg
      viewBox="0 0 660 260"
      className="w-full h-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Canvas dot-grid — matches app exactly */}
        <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.7" fill="#1f2937" />
        </pattern>
        {/* Arrowhead — gray-500 fill matching stroke */}
        <marker id="hero-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,1 L6,3.5 L0,6 Z" fill="#6b7280" />
        </marker>
        {/* Blue glow for data-flow dot */}
        <filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Canvas background */}
      <rect width="660" height="260" fill="#0f1117" />
      <rect width="660" height="260" fill="url(#hero-dots)" />

      {/* ── Connections ── */}
      {edges.map((e, i) => (
        <motion.path
          key={e.id}
          d={e.d}
          stroke="#6b7280"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          markerEnd="url(#hero-arrow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 + i * 0.1, ease: easeInOut }}
        />
      ))}

      {/* ── Animated data-flow dots ── */}
      {edges.map((e, i) => (
        <React.Fragment key={'flow-' + e.id}>
          <path id={'hero-fp-' + i} d={e.d} fill="none" stroke="none" />
          <motion.circle
            r="4"
            fill="#3b82f6"
            filter="url(#hero-glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.6, delay: 1.6 + i * 0.35, repeat: Infinity, repeatDelay: 1.2, ease: linear }}
          >
            <animateMotion dur="1.6s" repeatCount="indefinite" begin={`${1.6 + i * 0.35}s`}>
              <mpath href={'#hero-fp-' + i} />
            </animateMotion>
          </motion.circle>
        </React.Fragment>
      ))}

      {/* ── User — circle, bg-blue-600 ── */}
      <motion.g initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.15, ease: backOut }}>
        <circle cx="80" cy="130" r="32" fill="#2563eb" stroke="#60a5fa" strokeWidth="1.5" />
        {/* user icon path */}
        <path d="M80 120 a6 6 0 1 1 0.001 0 Z" fill="white" fillRule="evenodd" />
        <path d="M68 138 a12 12 0 0 1 24 0" fill="white" fillRule="evenodd" />
        <text x="80" y="175" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="monospace">User</text>
      </motion.g>

      {/* ── API Gateway — hexagon, bg-violet-700 ── */}
      <motion.g initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.25, ease: backOut }}>
        <polygon
          points="232,82 264,91 264,109 232,118 200,109 200,91"
          fill="#6d28d9" stroke="#8b5cf6" strokeWidth="1.5"
        />
        {/* simple grid icon */}
        <line x1="218" y1="96" x2="246" y2="96" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="218" y1="100" x2="246" y2="100" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="218" y1="104" x2="246" y2="104" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <text x="232" y="132" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="monospace">API Gateway</text>
      </motion.g>

      {/* ── Microservice — rect, bg-teal-700 ── */}
      <motion.g initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.35, ease: backOut }}>
        <rect x="340" y="110" width="96" height="60" rx="4" fill="#0f766e" stroke="#14b8a6" strokeWidth="1.5" />
        {/* puzzle icon simplified */}
        <rect x="374" y="128" width="10" height="10" rx="2" fill="white" opacity="0.85" />
        <rect x="386" y="128" width="10" height="10" rx="2" fill="white" opacity="0.85" />
        <rect x="374" y="140" width="10" height="10" rx="2" fill="white" opacity="0.85" />
        <rect x="386" y="140" width="10" height="10" rx="2" fill="white" opacity="0.4" />
        <text x="388" y="185" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="monospace">Microservice</text>
      </motion.g>

      {/* ── SQL Database — cylinder, bg-emerald-600 ── */}
      <motion.g initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.45, ease: backOut }}>
        {/* cylinder body */}
        <rect x="488" y="64" width="60" height="52" fill="#059669" stroke="#34d399" strokeWidth="1.5" />
        {/* top ellipse */}
        <ellipse cx="518" cy="64" rx="30" ry="8" fill="#059669" stroke="#34d399" strokeWidth="1.5" />
        {/* bottom ellipse */}
        <ellipse cx="518" cy="116" rx="30" ry="8" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
        {/* mid-line */}
        <line x1="488" y1="90" x2="548" y2="90" stroke="#34d399" strokeWidth="0.8" opacity="0.6" />
        <text x="518" y="136" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="monospace">SQL DB</text>
      </motion.g>

      {/* ── Redis Cache — rect, bg-red-700 ── */}
      <motion.g initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.55, ease: backOut }}>
        <rect x="488" y="148" width="60" height="44" rx="4" fill="#b91c1c" stroke="#f87171" strokeWidth="1.5" />
        {/* lightning bolt */}
        <path d="M516 158 L510 170 L516 170 L512 182 L522 166 L516 166 Z" fill="white" opacity="0.9" />
        <text x="518" y="204" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="monospace">Redis</text>
      </motion.g>

      {/* ── Message Queue — parallelogram, bg-yellow-700 ── */}

    </svg>
  );
}

export function LandingHero(): React.ReactElement {
  const reduce = useReducedMotion();

  const headlineWords = ['Design', 'your', 'system.', 'Then', 'watch', 'it', 'come', 'to', 'life.'];

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden py-24 md:py-32"
    >
      {/* Subtle radial glow behind hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[900px] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start gap-6 max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-blue-400 font-mono border border-blue-500/20 bg-blue-500/5 px-3 py-1 rounded-full">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"
              />
              your ideas, finally on the page
            </span>
          </motion.div>

          {/* Headline — word-by-word stagger */}
          <h1
            id="hero-heading"
            className="text-4xl md:text-6xl font-semibold tracking-tight text-gray-50 leading-tight"
          >
            <span className="sr-only">Sketch out your system. Then watch it come alive.</span>
            <span aria-hidden="true" className="flex flex-wrap gap-x-[0.3em] gap-y-1">
              {headlineWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: reduce ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.07, ease: easeOut }}
                  className={word === 'alive.' ? 'text-blue-400' : undefined}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Subhead */}
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
          >
            Drop in servers, databases, and APIs. Connect the dots. Watch data flow through your
            design in real time. No setup, no jargon — just build.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mt-2">
            <Link href="/canvas" className={primaryBtn}>
              Open editor →
            </Link>
            <a href="#features" className={ghostBtn}>
              See features
            </a>
          </motion.div>
        </motion.div>

        {/* Diagram preview */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: easeOut }}
          viewport={viewportOnce}
          className="mt-16 md:mt-24 relative rounded-xl border border-panel-border
            shadow-2xl shadow-black/50 overflow-hidden bg-[#0a0d14]"
          style={{ aspectRatio: '16/7' }}
        >
          {/* Top bar chrome */}
          <div className="flex items-center gap-1.5 px-4 h-9 border-b border-panel-border bg-header-bg">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-gray-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-gray-700" />
            <span className="ml-3 text-xs font-mono text-gray-600">NX-Design — untitled-1</span>
          </div>
          <div className="p-4 h-[calc(100%-2.25rem)]">
            <DiagramPreview />
          </div>
          {/* Fade-out gradient at bottom */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0d14] to-transparent pointer-events-none"
          />
        </motion.div>
      </div>
    </section>
  );
}
