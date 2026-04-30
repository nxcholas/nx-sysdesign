'use client';

import { useRef, useCallback } from 'react';
import type { Frame, CanvasTransform, PortSide, EdgePortSide } from '@/lib/types';
import type { ConnectionDragState } from '@/hooks/use-connection-drag';
import { snapToGrid } from '@/lib/canvas-utils';
import { GRID_SIZE } from '@/lib/constants';
import { isPointInsideFrame } from '@/lib/frame-utils';
import { FrameLabel } from './frame-label';
import { DeleteButton } from './delete-button';
import { ConnectionPort } from './connection-port';
import { FrameResizeHandles } from './frame-resize-handles';

interface FrameComponentProps {
  frame: Frame;
  isSelected: boolean;
  isHighlighted?: boolean;
  transform: CanvasTransform;
  allFrames: Frame[];
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, label: string) => void;
  onResize: (id: string, width: number, height: number, x: number, y: number) => void;
  onSetFrameParent: (frameId: string, parentFrameId: string | null) => void;
  onConnectionDragStart: (entityId: string, port: PortSide, e: React.PointerEvent) => void;
  onConnectionDragEnd: (entityId: string, port: PortSide) => void;
  connectionDragState: ConnectionDragState;
  highlightedPorts: Set<string>;
  isPanActive: boolean;
  isCopied?: boolean;
}

const PORT_SIDES: EdgePortSide[] = ['top', 'right', 'bottom', 'left'];

export function FrameComponent({
  frame,
  isSelected,
  isHighlighted,
  transform,
  allFrames,
  onSelect,
  onMove,
  onRemove,
  onRename,
  onResize,
  onSetFrameParent,
  onConnectionDragStart,
  onConnectionDragEnd,
  connectionDragState,
  highlightedPorts,
  isPanActive,
  isCopied,
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
      if (isPanActive) return;
      e.stopPropagation();
      // Nested frames (parentFrameId set) require double-click to select — single click is handled by parent
      if (!frame.parentFrameId) {
        onSelect(frame.id);
      }
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
    [frame.id, frame.x, frame.y, frame.parentFrameId, onSelect, isPanActive],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(frame.id);
    },
    [frame.id, onSelect],
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
      const didMove = dragRef.current.didMove;
      dragRef.current.active = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

      if (didMove) {
        // Detect frame-in-frame: check if this frame's center is inside any other frame
        const center = {
          x: frame.x + frame.width / 2,
          y: frame.y + frame.height / 2,
        };
        const candidates = allFrames.filter((f) => f.id !== frame.id);
        // Pick the deepest (highest zIndex) candidate containing the center
        const host = candidates
          .filter((f) => isPointInsideFrame(center, f))
          .sort((a, b) => b.zIndex - a.zIndex)[0] ?? null;

        const currentParentId = frame.parentFrameId ?? null;
        const newParentId = host?.id ?? null;
        if (newParentId !== currentParentId) {
          onSetFrameParent(frame.id, newParentId);
        }
      }
    },
    [frame.id, frame.x, frame.y, frame.width, frame.height, frame.parentFrameId, allFrames, onSetFrameParent],
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
      onDoubleClick={handleDoubleClick}
      className={`group rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-colors
        ${isCopied ? 'border-emerald-400 bg-emerald-500/10' : isHighlighted ? 'border-blue-400 bg-blue-500/10' : isSelected ? 'border-blue-500' : 'border-gray-600 hover:border-gray-500'}`}
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
