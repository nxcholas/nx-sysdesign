'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { fadeIn, viewportOnce, easeOut } from '@/lib/motion';

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: '100+', label: 'Components' },
  { value: 'ERD', label: 'database diagrams' },
  { value: 'Cloud', label: 'saved to the cloud' },
  { value: '$0', label: 'to start' },
];

function AnimatedStat({ value, label, delay }: Stat & { delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setShow(true), delay * 1000);
      return () => clearTimeout(t);
    }
  }, [inView, delay]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-6">
      <motion.span
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easeOut }}
        className="text-2xl md:text-3xl font-semibold text-gray-50 tabular-nums font-mono"
      >
        {value}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.15, ease: easeOut }}
        className="text-xs text-gray-500 uppercase tracking-wider font-mono"
      >
        {label}
      </motion.span>
    </div>
  );
}

export function StatsBar(): React.ReactElement {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="border-y border-panel-border/50 bg-header-bg/40 py-8"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-y-6">
          {stats.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <AnimatedStat {...stat} delay={i * 0.12} />
              {i < stats.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden md:block w-px h-8 bg-panel-border/60"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
