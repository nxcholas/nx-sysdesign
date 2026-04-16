'use client';

import { useCallback } from 'react';
import type { EdgePortSide } from '@/lib/types';

interface ConnectionPortProps {
  side: EdgePortSide;
  width: number;
  height: number;
  scale: number;
  isVisible: boolean;
  isHighlighted?: boolean;
  onDragStart: (e: React.PointerEvent) => void;
  onDrop: () => void;
  isConnectionDragging: boolean;
}

function getPortPosition(side: EdgePortSide, width: number, height: number) {
  switch (side) {
    case 'top':    return { left: width / 2, top: 0 };
    case 'right':  return { left: width, top: height / 2 };
    case 'bottom': return { left: width / 2, top: height };
    case 'left':   return { left: 0, top: height / 2 };
  }
}

export function ConnectionPort({
  side,
  width,
  height,
  scale,
  isVisible,
  isHighlighted,
  onDragStart,
  onDrop,
  isConnectionDragging,
}: ConnectionPortProps) {
  const pos = getPortPosition(side, width, height);
  const portSize = 10 / scale;
  const hitSize = 20 / scale;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      onDragStart(e);
    },
    [onDragStart]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isConnectionDragging) return;
      e.stopPropagation();
      onDrop();
    },
    [isConnectionDragging, onDrop]
  );

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: pos.left - hitSize / 2,
        top: pos.top - hitSize / 2,
        width: hitSize,
        height: hitSize,
        zIndex: 998,
        cursor: 'crosshair',
      }}
      className="flex items-center justify-center"
    >
      <div
        style={{ width: portSize, height: portSize }}
        className={`rounded-full border-2 border-blue-400 transition-opacity
          ${isHighlighted ? 'opacity-100 bg-blue-400' : 'bg-canvas-bg'}
          ${isVisible || isConnectionDragging || isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          ${isConnectionDragging ? 'hover:bg-blue-400 hover:scale-125' : ''}
        `}
      />
    </div>
  );
}
