'use client';

import { useState, useRef, useCallback, useEffect, type RefObject } from 'react';
import type { CanvasTransform } from '@/lib/types';
import { zoomToward } from '@/lib/canvas-utils';

interface PanState {
  active: boolean;
  startX: number;
  startY: number;
  startTX: number;
  startTY: number;
}

const DEFAULT_TRANSFORM: CanvasTransform = {
  scale: 1,
  translateX: 0,
  translateY: 0,
};

export function useCanvas(canvasRef: RefObject<HTMLElement | null>) {
  const [transform, setTransform] = useState<CanvasTransform>(DEFAULT_TRANSFORM);
  const [isPanActive, setIsPanActive] = useState(false);
  const panStateRef = useRef<PanState>({
    active: false,
    startX: 0,
    startY: 0,
    startTX: 0,
    startTY: 0,
  });
  const didPanRef = useRef(false);
  const spaceHeldRef = useRef(false);
  const ctrlHeldRef = useRef(false);

  // Attach wheel listener imperatively so we can pass { passive: false }.
  // React's onWheel is passive in newer browsers and can't call preventDefault.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      setTransform((prev) => zoomToward(prev, cursorX, cursorY, e.deltaY));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef.current]);

  // Track spacebar and Ctrl for hold-to-pan shortcuts.
  // Also drive isPanActive state so child components can block interactions.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        spaceHeldRef.current = true;
        setIsPanActive(true);
      }
      if (e.key === 'Control' && !e.repeat) {
        ctrlHeldRef.current = true;
        setIsPanActive(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceHeldRef.current = false;
        if (!ctrlHeldRef.current) setIsPanActive(false);
      }
      if (e.key === 'Control') {
        ctrlHeldRef.current = false;
        if (!spaceHeldRef.current) setIsPanActive(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.button !== 1) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      didPanRef.current = false;
      panStateRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startTX: transform.translateX,
        startTY: transform.translateY,
      };
    },
    [transform.translateX, transform.translateY]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const pan = panStateRef.current;
    if (!pan.active) return;
    const dx = e.clientX - pan.startX;
    const dy = e.clientY - pan.startY;
    // Only apply pan if the pointer actually moved (deadzone of 2px)
    if (!didPanRef.current && Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
    didPanRef.current = true;
    setTransform((prev) => ({
      ...prev,
      translateX: pan.startTX + dx,
      translateY: pan.startTY + dy,
    }));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (panStateRef.current.active) {
      panStateRef.current.active = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }, []);

  const resetTransform = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM);
  }, []);

  return {
    transform,
    setTransform,
    isPanActive,
    setIsPanActive,
    didPanRef,
    spaceHeldRef,
    ctrlHeldRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetTransform,
  };
}
