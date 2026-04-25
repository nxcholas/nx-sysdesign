'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TEMPLATES } from '@/lib/templates/index';
import type { DiagramTemplate } from '@/lib/templates/index';
import { TemplateCard } from './template-card';

interface ZeroStateTemplatesProps {
  onSelect: (template: DiagramTemplate) => void;
}

export function ZeroStateTemplates({ onSelect }: ZeroStateTemplatesProps) {
  const prefersReducedMotion = useReducedMotion();

  // ESC → select blank template
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        const blank = TEMPLATES.find((t) => t.id === 'blank');
        if (blank) onSelect(blank);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelect]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0d0f14]">
      <h1 className="text-xl font-semibold text-gray-100">Start with a template</h1>
      <p className="text-sm text-gray-400 mt-2 mb-8">
        Choose a starting point or begin with a blank canvas.
      </p>
      <div className="grid grid-cols-3 gap-4 w-full max-w-4xl ">
        {TEMPLATES.map((template, index) => (
          <motion.div
            key={template.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.06 }}
          >
            <TemplateCard template={template} onSelect={() => onSelect(template)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
