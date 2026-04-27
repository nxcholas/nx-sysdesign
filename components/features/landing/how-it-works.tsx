'use client';

import React from 'react';
import Link from 'next/link';
import { MousePointer2, GitMerge, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, slideInLeft, slideInRight, staggerContainer, viewportOnce, easeInOut, backOut, linear } from '@/lib/motion';

const steps = [
  {
    number: '01',
    icon: MousePointer2,
    title: 'Drop components onto the canvas',
    body: 'Choose from 100+ system design building blocks — servers, databases, caches, queues, and more. Drag them onto an infinite grid and position them however you think.',
    side: 'left' as const,
  },
  {
    number: '02',
    icon: GitMerge,
    title: 'Connect them with arrows',
    body: 'Draw connections between any two components. Add labels, set cardinality on ERD tables, and annotate with HTTP method helpers to make relationships crystal clear.',
    side: 'right' as const,
  },
  {
    number: '03',
    icon: Zap,
    title: 'Watch data flow animate live',
    body: 'Every connection plays a live bubble animation that shows data moving through your architecture. See the full request path from client to database in one glance.',
    side: 'left' as const,
  },
];

export function HowItWorksSection(): React.ReactElement {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="border-t border-panel-border/50 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {/* Section header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-16 md:mb-20"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-wider text-blue-400 font-mono mb-3">
            How it works
          </motion.p>
          <motion.h2
            id="how-heading"
            variants={fadeUp}
            className="text-3xl md:text-4xl font-semibold text-gray-50 tracking-tight mb-3"
          >
            From blank canvas to live architecture in minutes.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl">
            Sign up free, open the editor, and start building — no installs, no configuration.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-16 md:gap-20">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isRight = step.side === 'right';
            const slideVariant = isRight ? slideInRight : slideInLeft;
            const counterVariant = isRight ? slideInLeft : slideInRight;

            return (
              <div
                key={step.number}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isRight ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Text side */}
                <motion.div
                  variants={slideVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  className="flex-1 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-semibold font-mono text-blue-500/20 leading-none select-none">
                      {step.number}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20
                      flex items-center justify-center text-blue-400">
                      <Icon size={16} aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-100">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed max-w-md">{step.body}</p>
                </motion.div>

                {/* Visual side */}
                <motion.div
                  variants={counterVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  className="flex-1 w-full"
                >
                  <div className="rounded-xl border border-panel-border bg-header-bg/60
                    p-6 aspect-video flex items-center justify-center relative overflow-hidden">
                    {/* Background grid dots */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }}
                    />
                    {/* Step illustration */}
                    <StepIllustration step={i} />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 flex justify-center"
        >
          <Link
            href="/canvas"
            className="inline-flex items-center justify-center h-11 px-6 rounded-md
              bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-bg"
          >
            Try it now →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/*
 * StepIllustration — uses faithful app component visuals:
 *   Step 0 (drop): shows side panel + components being dragged onto canvas
 *   Step 1 (connect): shows components with a connection being drawn (blue dashed in-progress line)
 *   Step 2 (flow): shows live blue data-flow dot travelling across connections
 */
function StepIllustration({ step }: { step: number }) {
  if (step === 0) {
    // Side panel strips + 3 canvas components popping in
    return (
      <svg viewBox="0 0 340 180" className="w-full max-w-sm relative z-10" aria-hidden="true">
        <defs>
          <pattern id="hiw0-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.6" fill="#1f2937" />
          </pattern>
          <filter id="hiw0-glow">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Side panel */}
        <rect x="0" y="0" width="70" height="180" fill="#111827" />
        <rect x="70" y="0" width="1" height="180" fill="#1f2937" />
        <text x="35" y="18" textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="monospace">COMPONENTS</text>
        {/* Palette items in side panel */}
        {[
          { y: 30, label: 'User', bg: '#2563eb', border: '#60a5fa', shape: 'circle' },
          { y: 68, label: 'API GW', bg: '#6d28d9', border: '#8b5cf6', shape: 'hex' },
          { y: 106, label: 'SQL DB', bg: '#059669', border: '#34d399', shape: 'cylinder' },
          { y: 144, label: 'Redis', bg: '#b91c1c', border: '#f87171', shape: 'rect' },
        ].map((item) => (
          <g key={item.label}>
            {item.shape === 'circle' && <circle cx="35" cy={item.y + 14} r="12" fill={item.bg} stroke={item.border} strokeWidth="1" />}
            {item.shape === 'hex' && <polygon points={`35,${item.y+2} 47,${item.y+8} 47,${item.y+20} 35,${item.y+26} 23,${item.y+20} 23,${item.y+8}`} fill={item.bg} stroke={item.border} strokeWidth="1" />}
            {item.shape === 'cylinder' && <>
              <rect x="23" y={item.y+6} width="24" height="18" fill={item.bg} stroke={item.border} strokeWidth="1" />
              <ellipse cx="35" cy={item.y+6} rx="12" ry="4" fill={item.bg} stroke={item.border} strokeWidth="1" />
              <ellipse cx="35" cy={item.y+24} rx="12" ry="4" fill="#10b981" stroke={item.border} strokeWidth="1" />
            </>}
            {item.shape === 'rect' && <rect x="22" y={item.y+4} width="26" height="20" rx="2" fill={item.bg} stroke={item.border} strokeWidth="1" />}
            <text x="35" y={item.y + 36} textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="monospace">{item.label}</text>
          </g>
        ))}
        {/* Canvas area */}
        <rect x="71" y="0" width="269" height="180" fill="#0f1117" />
        <rect x="71" y="0" width="269" height="180" fill="url(#hiw0-dots)" />
        {/* Components on canvas — animating in */}
        {[
          { cx: 160, cy: 60, type: 'circle', bg: '#2563eb', border: '#60a5fa', label: 'User', delay: 0.15 },
          { cx: 240, cy: 95, type: 'hex', bg: '#6d28d9', border: '#8b5cf6', label: 'API Gateway', delay: 0.3 },
          { cx: 320, cy: 60, type: 'cylinder', bg: '#059669', border: '#34d399', label: 'SQL DB', delay: 0.45 },
        ].map((node) => (
          <motion.g key={node.label} initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: node.delay, ease: backOut }}>
            {node.type === 'circle' && <circle cx={node.cx} cy={node.cy} r="22" fill={node.bg} stroke={node.border} strokeWidth="1.5" />}
            {node.type === 'hex' && <polygon points={`${node.cx},${node.cy-20} ${node.cx+18},${node.cy-10} ${node.cx+18},${node.cy+10} ${node.cx},${node.cy+20} ${node.cx-18},${node.cy+10} ${node.cx-18},${node.cy-10}`} fill={node.bg} stroke={node.border} strokeWidth="1.5" />}
            {node.type === 'cylinder' && <>
              <rect x={node.cx-20} y={node.cy-18} width="40" height="36" fill={node.bg} stroke={node.border} strokeWidth="1.5" />
              <ellipse cx={node.cx} cy={node.cy-18} rx="20" ry="6" fill={node.bg} stroke={node.border} strokeWidth="1.5" />
              <ellipse cx={node.cx} cy={node.cy+18} rx="20" ry="6" fill="#10b981" stroke={node.border} strokeWidth="1.5" />
            </>}
            <text x={node.cx} y={node.cy + 38} textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="monospace">{node.label}</text>
          </motion.g>
        ))}
        {/* Animated cursor */}
        <motion.g animate={{ x: [-10, 30, 10, 50], y: [10, -5, 30, 0] }} transition={{ duration: 3, repeat: Infinity, ease: easeInOut }}>
          <path d="M 195 130 L 200 144 L 203 137 L 210 139 Z" fill="#3b82f6" filter="url(#hiw0-glow)" />
        </motion.g>
      </svg>
    );
  }

  if (step === 1) {
    // Three components with connections being drawn — shows blue in-progress dashed line + gray completed line
    return (
      <svg viewBox="0 0 320 160" className="w-full max-w-sm relative z-10" aria-hidden="true">
        <defs>
          <pattern id="hiw1-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.6" fill="#1f2937" />
          </pattern>
          <marker id="hiw1-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,1 L5,3 L0,5 Z" fill="#6b7280" />
          </marker>
          <marker id="hiw1-arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,1 L5,3 L0,5 Z" fill="#3b82f6" />
          </marker>
        </defs>
        <rect width="320" height="160" fill="#0f1117" />
        <rect width="320" height="160" fill="url(#hiw1-dots)" />

        {/* Completed connection (gray) */}
        <path d="M 88 75 L 152 75" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" fill="none" markerEnd="url(#hiw1-arrow)" />

        {/* In-progress connection (blue dashed) */}
        <motion.path
          d="M 200 75 L 255 75"
          stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 4" fill="none"
          markerEnd="url(#hiw1-arrow-blue)"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6, ease: easeInOut }}
        />

        {/* Connection port dot (blue) at source of in-progress line */}
        <motion.circle cx="200" cy="75" r="4" fill="#60a5fa" stroke="#0f1117" strokeWidth="1"
          initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.2, ease: backOut }}
        />

        {/* User — circle */}
        <g>
          <circle cx="55" cy="75" r="26" fill="#2563eb" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="55" y="112" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">User</text>
        </g>

        {/* API Gateway — hexagon (selected, has ring) */}
        <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <polygon points="176,53 196,64 196,86 176,97 156,86 156,64" fill="#6d28d9" stroke="#8b5cf6" strokeWidth="1.5" />
          {/* selection ring */}
          <polygon points="176,49 200,62 200,88 176,101 152,88 152,62" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="0" opacity="0.8" />
          <text x="176" y="114" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">API Gateway</text>
        </motion.g>

        {/* Microservice — rect */}
        <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <rect x="255" y="55" width="52" height="40" rx="4" fill="#0f766e" stroke="#14b8a6" strokeWidth="1.5" />
          <text x="281" y="108" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">Microservice</text>
        </motion.g>
      </svg>
    );
  }

  // Step 2 — live data-flow dots travelling across completed connections
  return (
    <svg viewBox="0 0 360 160" className="w-full max-w-sm relative z-10" aria-hidden="true">
      <defs>
        <pattern id="hiw2-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.6" fill="#1f2937" />
        </pattern>
        <marker id="hiw2-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,1 L5,3 L0,5 Z" fill="#6b7280" />
        </marker>
        <filter id="hiw2-glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="360" height="160" fill="#0f1117" />
      <rect width="360" height="160" fill="url(#hiw2-dots)" />

      {/* Connections */}
      <path id="hiw2-p0" d="M 84 75 L 152 75" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" fill="none" markerEnd="url(#hiw2-arrow)" />
      <path id="hiw2-p1" d="M 214 65 L 264 52" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" fill="none" markerEnd="url(#hiw2-arrow)" />
      <path id="hiw2-p2" d="M 214 85 L 264 100" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" fill="none" markerEnd="url(#hiw2-arrow)" />

      {/* Data-flow animated dots */}
      {[
        { href: '#hiw2-p0', dur: '1.4s', begin: '0s' },
        { href: '#hiw2-p1', dur: '1.2s', begin: '0.5s' },
        { href: '#hiw2-p2', dur: '1.2s', begin: '0.9s' },
      ].map((d, i) => (
        <React.Fragment key={i}>
          <motion.circle r="4" fill="#3b82f6" filter="url(#hiw2-glow)"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: parseFloat(d.dur), delay: parseFloat(d.begin), repeat: Infinity, repeatDelay: 0.8, ease: linear }}
          >
            <animateMotion dur={d.dur} repeatCount="indefinite" begin={d.begin}>
              <mpath href={d.href} />
            </animateMotion>
          </motion.circle>
        </React.Fragment>
      ))}

      {/* User — circle */}
      <circle cx="55" cy="75" r="26" fill="#2563eb" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="55" y="112" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">User</text>

      {/* API Gateway — hexagon */}
      <polygon points="183,53 203,64 203,86 183,97 163,86 163,64" fill="#6d28d9" stroke="#8b5cf6" strokeWidth="1.5" />
      <text x="183" y="114" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">API Gateway</text>

      {/* SQL DB — cylinder (top) */}
      <rect x="264" y="24" width="44" height="36" fill="#059669" stroke="#34d399" strokeWidth="1.5" />
      <ellipse cx="286" cy="24" rx="22" ry="6" fill="#059669" stroke="#34d399" strokeWidth="1.5" />
      <ellipse cx="286" cy="60" rx="22" ry="6" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
      <text x="286" y="78" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">SQL DB</text>

      {/* Redis — rect (bottom) */}
      <rect x="264" y="84" width="44" height="32" rx="3" fill="#b91c1c" stroke="#f87171" strokeWidth="1.5" />
      <text x="286" y="129" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">Redis</text>
    </svg>
  );
}
