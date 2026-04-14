'use client';

import { useRef, useCallback } from 'react';
import type { PlacedComponent, CanvasTransform, PortSide, Frame } from '@/lib/types';
import { HttpMethodBadge } from '@/components/features/blocks/http-method-badge';
import { StatusCodeBadge } from '@/components/features/blocks/status-code-badge';
import { BlockRenderer } from '@/components/features/blocks/block-renderer';
import { EntityRelationTable } from '@/components/features/blocks/entity-relation-table';
import { DeleteButton } from './delete-button';
import { ResizeHandles } from './resize-handles';
import { ConnectionPort } from './connection-port';
import { snapToGrid } from '@/lib/canvas-utils';
import { isPointInsideFrame } from '@/lib/frame-utils';

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
  onRename: (id: string, label: string) => void;
  isConnectionDragging: boolean;
  highlightedPorts: Set<string>;
  frames: Frame[];
  onSetComponentFrame: (componentId: string, frameId: string | null) => void;
  onHighlightFrame: (id: string | null) => void;
  onUpdateTableHeader: (id: string, header: string) => void;
  onAddTableRow: (id: string, rowId?: string, name?: string) => void;
  onRemoveTableRow: (id: string, rowId: string) => void;
  onRenameTableRow: (id: string, rowId: string, name: string) => void;
  onCycleTableKey: (id: string, rowId: string) => void;
}

interface ComponentVisualProps {
  component: PlacedComponent;
  isSelected: boolean;
  onRename: (id: string, label: string) => void;
  onUpdateTableHeader: (id: string, header: string) => void;
  onAddTableRow: (id: string, rowId?: string, name?: string) => void;
  onRemoveTableRow: (id: string, rowId: string) => void;
  onRenameTableRow: (id: string, rowId: string, name: string) => void;
  onCycleTableKey: (id: string, rowId: string) => void;
}

function ComponentVisual({
  component,
  isSelected,
  onRename,
  onUpdateTableHeader,
  onAddTableRow,
  onRemoveTableRow,
  onRenameTableRow,
  onCycleTableKey,
}: ComponentVisualProps) {
  const { kind } = component;

  if (kind.type === 'http-method') {
    return <HttpMethodBadge method={kind.method} size="md" />;
  }
  if (kind.type === 'status-code') {
    return <StatusCodeBadge group={kind.group} code={kind.code} label={kind.label} size="md" />;
  }
  if (kind.type === 'block') {
    if (kind.kind === 'entity-relation-table' && component.tableData) {
      return (
        <EntityRelationTable
          componentId={component.id}
          tableData={component.tableData}
          isSelected={isSelected}
          onUpdateHeader={(header) => onUpdateTableHeader(component.id, header)}
          onAddRow={(rowId, name) => onAddTableRow(component.id, rowId, name)}
          onRemoveRow={(rowId) => onRemoveTableRow(component.id, rowId)}
          onRenameRow={(rowId, name) => onRenameTableRow(component.id, rowId, name)}
          onCycleKey={(rowId) => onCycleTableKey(component.id, rowId)}
        />
      );
    }
    return (
      <BlockRenderer
        kind={kind.kind}
        label={component.label}
        size="md"
        onRenameLabel={(newLabel) => onRename(component.id, newLabel)}
      />
    );
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
  onRename,
  isConnectionDragging,
  highlightedPorts,
  frames,
  onSetComponentFrame,
  onHighlightFrame,
  onUpdateTableHeader,
  onAddTableRow,
  onRemoveTableRow,
  onRenameTableRow,
  onCycleTableKey,
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
      if (isConnectionDragging) return;
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

      // Highlight frame under component center (visual feedback only)
      const center = { x: newX + component.width / 2, y: newY + component.height / 2 };
      const targetFrame = frames.find((f) => isPointInsideFrame(center, f));
      onHighlightFrame(targetFrame?.id ?? null);
    },
    [component.id, component.width, component.height, transform.scale, onMove, frames, onHighlightFrame]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragStartRef.current) {
      // Compute final center position for frame assignment
      const dx = (e.clientX - dragStartRef.current.pointerX) / transform.scale;
      const dy = (e.clientY - dragStartRef.current.pointerY) / transform.scale;
      const newX = snapToGrid(dragStartRef.current.compX + dx);
      const newY = snapToGrid(dragStartRef.current.compY + dy);
      const center = { x: newX + component.width / 2, y: newY + component.height / 2 };

      if (!component.frameId) {
        const targetFrame = frames.find((f) => isPointInsideFrame(center, f));
        if (targetFrame) {
          onSetComponentFrame(component.id, targetFrame.id);
        }
      } else {
        const parentFrame = frames.find((f) => f.id === component.frameId);
        if (parentFrame && !isPointInsideFrame(center, parentFrame)) {
          onSetComponentFrame(component.id, null);
        }
      }

      onHighlightFrame(null);
    }
    dragStartRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, [component.id, component.width, component.height, component.frameId, transform.scale, frames, onSetComponentFrame, onHighlightFrame]);

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
      <ComponentVisual
        component={component}
        isSelected={isSelected}
        onRename={onRename}
        onUpdateTableHeader={onUpdateTableHeader}
        onAddTableRow={onAddTableRow}
        onRemoveTableRow={onRemoveTableRow}
        onRenameTableRow={onRenameTableRow}
        onCycleTableKey={onCycleTableKey}
      />

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
