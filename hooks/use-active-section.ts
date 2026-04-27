'use client';

import { useEffect, useState } from 'react';

export function useActiveSection(ids: string[]): string {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const visibleSections = new Map<string, number>();

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.isIntersecting) {
            visibleSections.set(id, entry.intersectionRatio);
          } else {
            visibleSections.delete(id);
          }

          if (visibleSections.size > 0) {
            // Pick the section with the highest intersection ratio
            let best = '';
            let bestRatio = -1;
            visibleSections.forEach((ratio, sectionId) => {
              if (ratio > bestRatio) {
                bestRatio = ratio;
                best = sectionId;
              }
            });
            setActiveId(best);
          }
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-10% 0px -60% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  return activeId;
}
