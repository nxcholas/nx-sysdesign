'use client';

import { useState, useEffect } from 'react';
import type { CanvasTool } from '@/lib/types';

export function useCanvasTool() {
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      }
      if (e.key === 'f' || e.key === 'F') {
        setActiveTool('frame');
      }
      if (e.key === 't' || e.key === 'T') {
        setActiveTool('text-block');
      }
      if (e.key === 'u' || e.key === 'U') {
        setActiveTool('shape');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { activeTool, setActiveTool };
}
