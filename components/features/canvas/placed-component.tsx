'use client';

import { useRef, useCallback } from 'react';
import type { PlacedComponent, CanvasTransform, PortSide } from '@/lib/types';
import { HttpMethodBadge } from '@/components/features/blocks/http-method-badge';
import { StatusCodeBadge } from '@/components/features/blocks/status-code-badge';
import { UserBlock } from '@/components/features/blocks/user-block';
import { WebServerBlock } from '@/components/features/blocks/web-server-block';
import { DatabaseBlock } from '@/components/features/blocks/database-block';
import { DeleteButton } from './delete-button';
import { ResizeHandles } from './resize-handles';
import { ConnectionPort } from './connection-port';
import { snapToGrid } from '@/lib/canvas-utils';

interface PlacedComponentItemProps {
  component: PlacedComponent;
  isSelected: boolean;
  transform: CanvasTransform;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onConnectionDragStart: (componentId: string, port: PortSide, e: React.PointerEvent) => void;
  onConnectionDragEnd: (componentId: string, port: PortSide) => void;
  isConnectionDragging: boolean;
  highlightedPorts: Set<string>;
}

function ComponentVisual({ component }: { component: PlacedComponent }) {
  const { kind } = component;

  if (kind.type === 'http-method') {
    return <HttpMethodBadge method={kind.method} size="md" />;
  }
  if (kind.type === 'status-code') {
    return <StatusCodeBadge group={kind.group} code={kind.code} label={kind.label} size="md" />;
  }
  if (kind.type === 'block') {
    if (kind.kind === 'user') return <UserBlock label={component.label} />;
    if (kind.kind === 'web-server') return <WebServerBlock label={component.label} />;
    if (kind.kind === 'database') return <DatabaseBlock label={component.label} />;
  }
  return null;
}

const PORT_SIDES: PortSide[] = ['top', 'right', 'bottom', 'left'];

export function PlacedComponentItem({
  component,
  isSelected,
  transform,
  onSelect,
  onMove,
  onRemove,
  onResize,
  onConnectionDragStart,
  onConnectionDragEnd,
  isConnectionDragging,
  highlightedPorts,
}: PlacedComponentItemProps) {
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    compX: number;
    compY: number;
  } | null>(null);

  const isBlock = component.kind.type === 'block';

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if (isConnectionDragging) return; // Don't start component drag during connection drag
      e.stopPropagation();
      onSelect(component.id);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragStartRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        compX: component.x,
        compY: component.y,
      };
    },
    [component.id, component.x, component.y, onSelect, isConnectionDragging]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current) return;
      const dx = (e.clientX - dragStartRef.current.pointerX) / transform.scale;
      const dy = (e.clientY - dragStartRef.current.pointerY) / transform.scale;
      const newX = snapToGrid(dragStartRef.current.compX + dx);
      const newY = snapToGrid(dragStartRef.current.compY + dy);
      onMove(component.id, newX, newY);
    },
    [component.id, transform.scale, onMove]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: component.x,
        top: component.y,
        width: component.width,
        height: component.height,
        zIndex: component.zIndex,
        cursor: 'grab',
      }}
      className={`group flex items-center justify-center rounded select-none
        ${isSelected
          ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-canvas-bg'
          : 'hover:ring-1 hover:ring-gray-500'
        }`}
    >
      <ComponentVisual component={component} />

      {/* Connection ports — visible on hover or when connection dragging */}
      {PORT_SIDES.map((side) => (
        <ConnectionPort
          key={side}
          side={side}
          width={component.width}
          height={component.height}
          scale={transform.scale}
          isVisible={isSelected || isConnectionDragging}
          isHighlighted={highlightedPorts.has(`${component.id}:${side}`)}
          onDragStart={(e) => onConnectionDragStart(component.id, side, e)}
          onDrop={() => onConnectionDragEnd(component.id, side)}
          isConnectionDragging={isConnectionDragging}
        />
      ))}

      {/* Delete button — visible when selected */}
      {isSelected && (
        <DeleteButton
          onDelete={() => onRemove(component.id)}
          scale={transform.scale}
        />
      )}

      {/* Resize handles — visible when selected, only for blocks */}
      {isSelected && isBlock && (
        <ResizeHandles
          component={component}
          transform={transform}
          onResize={onResize}
        />
      )}
    </div>
  );
}
