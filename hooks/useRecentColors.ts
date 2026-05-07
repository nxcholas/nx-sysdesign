'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'nx-recent-colors';
const MAX_RECENT = 8;

export function useRecentColors(): {
  recentColors: string[];
  pushColor: (hex: string) => void;
} {
  const [recentColors, setRecentColors] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentColors(parsed.slice(0, MAX_RECENT));
        }
      }
    } catch {
      // Ignore parse errors — start with empty
    }
  }, []);

  const pushColor = useCallback((hex: string) => {
    if (hex === 'transparent') return;
    setRecentColors((prev) => {
      const deduped = prev.filter((c) => c.toLowerCase() !== hex.toLowerCase());
      const next = [hex, ...deduped].slice(0, MAX_RECENT);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore write errors
        }
      }
      return next;
    });
  }, []);

  return { recentColors, pushColor };
}
