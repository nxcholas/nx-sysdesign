'use client';

import { useRef, useCallback } from 'react';
import type { Frame, CanvasTransform, PortSide } from '@/lib/types';
import type { ConnectionDragState } from '@/hooks/use-connection-drag';
import { snapToGrid } from '@/lib/canvas-utils';
import { GRID_SIZE } from '@/lib/constants';
import { FrameLabel } from './frame-label';
import { DeleteButton } from './delete-button';
import { ConnectionPort } from './connection-port';
import { FrameResizeHandles } from './frame-resize-handles';

interface FrameComponentProps {
  frame: Frame;
  isSelected: boolean;
  isHighlighted?: boolean;
  transform: CanvasTransform;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, label: string) => void;
  onResize: (id: string, width: number, height: number, x: number, y: number) => void;
  onConnectionDragStart: (entityId: string, port: PortSide, e: React.PointerEvent) => void;
  onConnectionDragEnd: (entityId: string, port: PortSide) => void;
  connectionDragState: ConnectionDragState;
  highlightedPorts: Set<string>;
}

const PORT_SIDES: PortSide[] = ['top', 'right', 'bottom', 'left'];

export function FrameComponent({
  frame,
  isSelected,
  isHighlighted,
  transform,
  onSelect,
  onMove,
  onRemove,
  onRename,
  onResize,
  onConnectionDragStart,
  onConnectionDragEnd,
  connectionDragState,
  highlightedPorts,
}: FrameComponentProps) {
  const dragRef = useRef<{
    active: boolean;
    startClientX: number;
    startClientY: number;
    startFrameX: number;
    startFrameY: number;
    didMove: boolean;
  }>({ active: false, startClientX: 0, startClientY: 0, startFrameX: 0, startFrameY: 0, didMove: false });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      onSelect(frame.id);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        active: true,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startFrameX: frame.x,
        startFrameY: frame.y,
        didMove: false,
      };
    },
    [frame.id, frame.x, frame.y, onSelect],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active) return;
      const dx = (e.clientX - drag.startClientX) / transform.scale;
      const dy = (e.clientY - drag.startClientY) / transform.scale;
      if (!drag.didMove && Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
      drag.didMove = true;
      const newX = snapToGrid(drag.startFrameX + dx, GRID_SIZE);
      const newY = snapToGrid(drag.startFrameY + dy, GRID_SIZE);
      onMove(frame.id, newX, newY);
    },
    [frame.id, transform.scale, onMove],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [],
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        zIndex: 0,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`group rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing
        ${isHighlighted ? 'border-blue-400 bg-blue-500/10' : isSelected ? 'border-blue-500' : 'border-gray-600 hover:border-gray-500'}`}
    >
      {/* Label  */}
      <div
        className="absolute -top-7  px-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <FrameLabel
          label={frame.label}
          onRename={(newLabel) => onRename(frame.id, newLabel)}
        />
      </div>

      {/* Delete button */}
      {isSelected && (
        <DeleteButton
          onDelete={() => onRemove(frame.id)}
          scale={transform.scale}
        />
      )}

      {/* Resize handles */}
      {isSelected && (
        <FrameResizeHandles
          frame={frame}
          transform={transform}
          onResize={onResize}
        />
      )}

      {/* Connection ports */}
      {PORT_SIDES.map((side) => {
        const portKey = `${frame.id}-${side}`;
        return (
          <ConnectionPort
            key={side}
            side={side}
            width={frame.width}
            height={frame.height}
            scale={transform.scale}
            isVisible={isSelected}
            isHighlighted={highlightedPorts.has(portKey)}
            isConnectionDragging={connectionDragState.active}
            onDragStart={(e) => onConnectionDragStart(frame.id, side, e)}
            onDrop={() => onConnectionDragEnd(frame.id, side)}
          />
        );
      })}
    </div>
  );
}
