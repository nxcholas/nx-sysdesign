'use client';

import { useRef, useCallback } from 'react';
import type { PlacedComponent, CanvasTransform } from '@/lib/types';
import { BLOCK_MIN_DIMENSIONS } from '@/lib/constants';
import { snapToGrid } from '@/lib/canvas-utils';
import type { BlockKind } from '@/lib/types';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ResizeHandlesProps {
  component: PlacedComponent;
  transform: CanvasTransform;
  onResize: (id: string, width: number, height: number) => void;
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

export function ResizeHandles({ component, transform, onResize }: ResizeHandlesProps) {
  const dragRef = useRef<{
    corner: Corner;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const blockKind = component.kind.type === 'block' ? component.kind.kind as BlockKind : null;
  const minWidth = blockKind ? BLOCK_MIN_DIMENSIONS[blockKind].width : 48;
  const minHeight = blockKind ? BLOCK_MIN_DIMENSIONS[blockKind].height : 48;

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
      };
    },
    [component.width, component.height]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const { corner, startX, startY, startWidth, startHeight } = dragRef.current;
      const dx = (e.clientX - startX) / transform.scale;
      const dy = (e.clientY - startY) / transform.scale;

      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (corner) {
        case 'bottom-right':
          newWidth = startWidth + dx;
          newHeight = startHeight + dy;
          break;
        case 'bottom-left':
          newWidth = startWidth - dx;
          newHeight = startHeight + dy;
          break;
        case 'top-right':
          newWidth = startWidth + dx;
          newHeight = startHeight - dy;
          break;
        case 'top-left':
          newWidth = startWidth - dx;
          newHeight = startHeight - dy;
          break;
      }

      newWidth = Math.max(snapToGrid(newWidth), minWidth);
      newHeight = Math.max(snapToGrid(newHeight), minHeight);

      onResize(component.id, newWidth, newHeight);
    },
    [component.id, transform.scale, onResize, minWidth, minHeight]
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
