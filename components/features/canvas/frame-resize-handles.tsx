'use client';

import { useRef, useCallback } from 'react';
import type { Frame, CanvasTransform } from '@/lib/types';
import { FRAME_MIN_WIDTH, FRAME_MIN_HEIGHT } from '@/lib/constants';
import { snapToGrid } from '@/lib/canvas-utils';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface FrameResizeHandlesProps {
  frame: Frame;
  transform: CanvasTransform;
  onResize: (id: string, width: number, height: number, x: number, y: number) => void;
}

const CORNERS: Corner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

function getCornerStyle(corner: Corner, size: number): React.CSSProperties {
  const half = size / 2;
  const base: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    zIndex: 999,
    pointerEvents: 'auto',
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

export function FrameResizeHandles({ frame, transform, onResize }: FrameResizeHandlesProps) {
  const dragRef = useRef<{
    corner: Corner;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const handleSize = 8 / transform.scale;

  const handlePointerDown = useCallback(
    (corner: Corner, e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        corner,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: frame.x,
        startY: frame.y,
        startWidth: frame.width,
        startHeight: frame.height,
      };
    },
    [frame.x, frame.y, frame.width, frame.height]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const { corner, startClientX, startClientY, startX, startY, startWidth, startHeight } = dragRef.current;
      const dx = (e.clientX - startClientX) / transform.scale;
      const dy = (e.clientY - startClientY) / transform.scale;

      let newX = startX;
      let newY = startY;
      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (corner) {
        case 'bottom-right':
          newWidth = startWidth + dx;
          newHeight = startHeight + dy;
          break;
        case 'bottom-left':
          newX = startX + dx;
          newWidth = startWidth - dx;
          newHeight = startHeight + dy;
          break;
        case 'top-right':
          newWidth = startWidth + dx;
          newY = startY + dy;
          newHeight = startHeight - dy;
          break;
        case 'top-left':
          newX = startX + dx;
          newWidth = startWidth - dx;
          newY = startY + dy;
          newHeight = startHeight - dy;
          break;
      }

      newWidth = Math.max(snapToGrid(newWidth), FRAME_MIN_WIDTH);
      newHeight = Math.max(snapToGrid(newHeight), FRAME_MIN_HEIGHT);
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);

      // Clamp position so width/height don't go below minimum
      if (corner === 'top-left' || corner === 'bottom-left') {
        const maxX = startX + startWidth - FRAME_MIN_WIDTH;
        if (newX > maxX) newX = snapToGrid(maxX);
      }
      if (corner === 'top-left' || corner === 'top-right') {
        const maxY = startY + startHeight - FRAME_MIN_HEIGHT;
        if (newY > maxY) newY = snapToGrid(maxY);
      }

      onResize(frame.id, newWidth, newHeight, newX, newY);
    },
    [frame.id, transform.scale, onResize]
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
