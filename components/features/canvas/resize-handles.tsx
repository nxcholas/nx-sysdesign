'use client';

import { useRef, useCallback } from 'react';
import type { PlacedComponent, CanvasTransform } from '@/lib/types';
import { snapToGrid } from '@/lib/canvas-utils';
import { getBlockDef } from '@/lib/block-registry';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ResizeHandlesProps {
  component: PlacedComponent;
  transform: CanvasTransform;
  onResize: (id: string, width: number, height: number) => void;
  onResizeWithMove?: (id: string, x: number, y: number, width: number, height: number) => void;
}

const CORNERS: Corner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

function getCornerStyle(corner: Corner, size: number): React.CSSProperties {
  const half = size / 2;
  const base: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    zIndex: 999,
  };

  switch (corner) {
    case 'top-left':
      return { ...base, top: -half, left: -half, cursor: 'nwse-resize' };
    case 'top-right':
      return { ...base, top: -half, right: -half, cursor: 'nesw-resize' };
    case 'bottom-left':
      return { ...base, bottom: -half, left: -half, cursor: 'nesw-resize' };
    case 'bottom-right':
      return { ...base, bottom: -half, right: -half, cursor: 'nwse-resize' };
  }
}

export function ResizeHandles({ component, transform, onResize, onResizeWithMove }: ResizeHandlesProps) {
  const dragRef = useRef<{
    corner: Corner;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startCompX: number;
    startCompY: number;
  } | null>(null);

  const def = component.kind.type === 'block' ? getBlockDef(component.kind.kind) : null;
  const minWidth = def ? def.minWidth : 48;
  const minHeight = def ? def.minHeight : 48;

  const handleSize = 8 / transform.scale;

  const handlePointerDown = useCallback(
    (corner: Corner, e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        corner,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: component.width,
        startHeight: component.height,
        startCompX: component.x,
        startCompY: component.y,
      };
    },
    [component.width, component.height, component.x, component.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const { corner, startX, startY, startWidth, startHeight, startCompX, startCompY } = dragRef.current;
      const dx = (e.clientX - startX) / transform.scale;
      const dy = (e.clientY - startY) / transform.scale;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startCompX;
      let newY = startCompY;

      switch (corner) {
        case 'bottom-right':
          newWidth = startWidth + dx;
          newHeight = startHeight + dy;
          break;
        case 'bottom-left':
          newWidth = startWidth - dx;
          newHeight = startHeight + dy;
          newX = startCompX + dx;
          break;
        case 'top-right':
          newWidth = startWidth + dx;
          newHeight = startHeight - dy;
          newY = startCompY + dy;
          break;
        case 'top-left':
          newWidth = startWidth - dx;
          newHeight = startHeight - dy;
          newX = startCompX + dx;
          newY = startCompY + dy;
          break;
      }

      const snappedWidth = Math.max(snapToGrid(newWidth), minWidth);
      const snappedHeight = Math.max(snapToGrid(newHeight), minHeight);

      if (onResizeWithMove && corner !== 'bottom-right') {
        const snappedX = snapToGrid(newX);
        const snappedY = snapToGrid(newY);
        onResizeWithMove(component.id, snappedX, snappedY, snappedWidth, snappedHeight);
      } else {
        onResize(component.id, snappedWidth, snappedHeight);
      }
    },
    [component.id, transform.scale, onResize, onResizeWithMove, minWidth, minHeight]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  return (
    <>
      {CORNERS.map((corner) => (
        <div
          key={corner}
          style={getCornerStyle(corner, handleSize)}
          onPointerDown={(e) => handlePointerDown(corner, e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="rounded-sm bg-blue-500 border border-blue-300 hover:bg-blue-400 transition-colors"
        />
      ))}
    </>
  );
}
