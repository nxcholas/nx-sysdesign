'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FeatureCard } from './feature-card';
import { features } from './features';
import { staggerContainer, viewportOnce } from '@/lib/motion';

export function FeatureGrid(): React.ReactElement {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {features.map((f) => (
        <FeatureCard key={f.title} icon={f.icon} title={f.title} body={f.body} />
      ))}
    </motion.div>
  );
}
