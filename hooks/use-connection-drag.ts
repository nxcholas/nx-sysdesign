'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { PortSide, CanvasTransform, PlacedComponent, Frame } from '@/lib/types';
import { screenToCanvas } from '@/lib/canvas-utils';
import { findPortAtPosition } from '@/lib/connection-utils';

export interface ConnectionDragState {
  active: boolean;
  sourceId: string;
  sourcePort: PortSide;
  cursorX: number;
  cursorY: number;
}

const INACTIVE: ConnectionDragState = {
  active: false,
  sourceId: '',
  sourcePort: 'right',
  cursorX: 0,
  cursorY: 0,
};

/**
 * Manages connection drag state using window-level native event listeners.
 * This avoids setPointerCapture issues with React event delegation.
 */
export function useConnectionDrag(
  addConnection: (sourceId: string, sourcePort: PortSide, targetId: string, targetPort: PortSide) => void,
  containerRef: React.RefObject<HTMLDivElement | null>,
  transformRef: React.RefObject<CanvasTransform>,
  placedComponentsRef: React.RefObject<PlacedComponent[]>,
  framesRef: React.RefObject<Frame[]>,
) {
  const [dragState, setDragState] = useState<ConnectionDragState>(INACTIVE);
  const activeRef = useRef(false);
  const sourceRef = useRef<{ id: string; port: PortSide }>({ id: '', port: 'right' });
  const cleanupRef = useRef<(() => void) | null>(null);

  // Stable ref for addConnection so native listeners never use a stale closure
  const addConnectionRef = useRef(addConnection);
  addConnectionRef.current = addConnection;

  const stopDrag = useCallback((targetId?: string, targetPort?: PortSide) => {
    if (!activeRef.current) return;
    activeRef.current = false;
    // Remove window listeners
    cleanupRef.current?.();
    cleanupRef.current = null;
    // Create connection if valid target
    if (targetId && targetPort) {
      const { id: sourceId, port: sourcePort } = sourceRef.current;
      addConnectionRef.current(sourceId, sourcePort, targetId, targetPort);
    }
    setDragState(INACTIVE);
  }, []);

  // Keep stopDrag accessible to native listeners via stable ref
  const stopDragRef = useRef(stopDrag);
  stopDragRef.current = stopDrag;

  const startConnectionDrag = useCallback(
    (
      componentId: string,
      port: PortSide,
      e: React.PointerEvent,
      canvasRect: DOMRect,
      transform: CanvasTransform,
    ) => {
      // If a drag was left active (e.g. pointer-up missed), clean up before starting a new one
      if (activeRef.current) {
        cleanupRef.current?.();
        cleanupRef.current = null;
        activeRef.current = false;
      }
      activeRef.current = true;
      sourceRef.current = { id: componentId, port };

      const canvasPos = screenToCanvas(e.clientX, e.clientY, canvasRect, transform);
      setDragState({
        active: true,
        sourceId: componentId,
        sourcePort: port,
        cursorX: canvasPos.x,
        cursorY: canvasPos.y,
      });
      // Native window listeners — always fire regardless of which element is under the pointer
      const onMove = (ev: PointerEvent) => {
        if (!activeRef.current) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const pos = screenToCanvas(ev.clientX, ev.clientY, rect, transformRef.current);
        setDragState((prev) => ({ ...prev, cursorX: pos.x, cursorY: pos.y }));
      };

      const onUp = (ev: PointerEvent) => {
        if (!activeRef.current) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const pos = screenToCanvas(ev.clientX, ev.clientY, rect, transformRef.current);
          const hit = findPortAtPosition(
            pos.x,
            pos.y,
            [...placedComponentsRef.current, ...framesRef.current],
            sourceRef.current.id,
          );
          if (hit) {
            stopDragRef.current(hit.componentId, hit.port);
            return;
          }
        }
        stopDragRef.current();
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      cleanupRef.current = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
    },
    [containerRef, transformRef, placedComponentsRef, framesRef],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      activeRef.current = false;
    };
  }, []);

  return {
    connectionDragState: dragState,
    connectionActiveRef: activeRef,
    startConnectionDrag,
    endConnectionDrag: stopDrag,
  };
}