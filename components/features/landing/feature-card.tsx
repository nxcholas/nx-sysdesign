'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
}

export function FeatureCard({ icon: Icon, title, body }: FeatureCardProps): React.ReactElement {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group rounded-xl border border-panel-border bg-header-bg/60 p-6
        transition-colors duration-200 hover:border-blue-500/40
        hover:shadow-lg hover:shadow-blue-500/5 cursor-default"
    >
      <div className="mb-4 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20
        flex items-center justify-center text-blue-400 group-hover:bg-blue-500/15
        group-hover:text-blue-300 transition-colors duration-200">
        <Icon size={18} aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
    </motion.div>
  );
}
