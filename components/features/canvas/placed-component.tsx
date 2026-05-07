'use client';

import { useRef, useCallback, useEffect } from 'react';
import type { PlacedComponent, CanvasTransform, PortSide, RowPortSide, EdgePortSide, Frame } from '@/lib/types';
import { HttpMethodBadge } from '@/components/features/blocks/http-method-badge';
import { StatusCodeBadge } from '@/components/features/blocks/status-code-badge';
import { BlockRenderer } from '@/components/features/blocks/block-renderer';
import { EntityRelationTable } from '@/components/features/blocks/entity-relation-table';
import { TextBlockRenderer } from './text-block-renderer';
import { ShapeRenderer } from './shape-renderer';
import { DeleteButton } from './delete-button';
import { ResizeHandles } from './resize-handles';
import { ConnectionPort } from './connection-port';
import { snapToGrid } from '@/lib/canvas-utils';
import { isPointInsideFrame } from '@/lib/frame-utils';

interface PlacedComponentItemProps {
  component: PlacedComponent;
  isSelected: boolean;
  selectedIds: string[];
  allComponents: PlacedComponent[];
  transform: CanvasTransform;
  autoFocus?: boolean;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onMoveMany: (moves: { id: string; x: number; y: number }[]) => void;
  onRemove: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onResizeWithMove?: (id: string, x: number, y: number, width: number, height: number) => void;
  onBeginDragHistory: () => void;
  onEndDragHistory: () => void;
  onConnectionDragStart: (componentId: string, port: PortSide, e: React.PointerEvent) => void;
  onConnectionDragEnd: (componentId: string, port: PortSide) => void;
  onRename: (id: string, label: string) => void;
  onTextChange: (id: string, text: string) => void;
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
  isPanActive: boolean;
}

interface ComponentVisualProps {
  component: PlacedComponent;
  isSelected: boolean;
  isConnectionDragging: boolean;
  autoFocus?: boolean;
  onSelect?: () => void;
  onRename: (id: string, label: string) => void;
  onTextChange: (id: string, text: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onUpdateTableHeader: (id: string, header: string) => void;
  onAddTableRow: (id: string, rowId?: string, name?: string) => void;
  onRemoveTableRow: (id: string, rowId: string) => void;
  onRenameTableRow: (id: string, rowId: string, name: string) => void;
  onCycleTableKey: (id: string, rowId: string) => void;
  onConnectionDragStart: (componentId: string, port: RowPortSide, e: React.PointerEvent) => void;
}

function ComponentVisual({
  component,
  isSelected,
  isConnectionDragging,
  autoFocus,
  onSelect,
  onRename,
  onTextChange,
  onResize,
  onUpdateTableHeader,
  onAddTableRow,
  onRemoveTableRow,
  onRenameTableRow,
  onCycleTableKey,
  onConnectionDragStart,
}: ComponentVisualProps) {
  const { kind } = component;

  if (kind.type === 'http-method') {
    return <HttpMethodBadge method={kind.method} size="md" />;
  }
  if (kind.type === 'status-code') {
    return <StatusCodeBadge group={kind.group} code={kind.code} label={kind.label} size="md" />;
  }
  if (kind.type === 'text-block') {
    return (
      <div className="absolute inset-0">
        <TextBlockRenderer
          component={component}
          isSelected={isSelected}
          autoFocus={autoFocus}
          onTextChange={onTextChange}
          onSelect={onSelect}
          onResize={onResize}
        />
      </div>
    );
  }
  if (kind.type === 'shape') {
    return (
      <ShapeRenderer
        component={component}
        isSelected={isSelected}
        onTextChange={onTextChange}
        onResize={onResize}
      />
    );
  }
  if (kind.type === 'block') {
    if (kind.kind === 'entity-relation-table' && component.tableData) {
      return (
        <EntityRelationTable
          componentId={component.id}
          tableData={component.tableData}
          isSelected={isSelected}
          isConnectionDragging={isConnectionDragging}
          onUpdateHeader={(header) => onUpdateTableHeader(component.id, header)}
          onAddRow={(rowId, name) => onAddTableRow(component.id, rowId, name)}
          onRemoveRow={(rowId) => onRemoveTableRow(component.id, rowId)}
          onRenameRow={(rowId, name) => onRenameTableRow(component.id, rowId, name)}
          onCycleKey={(rowId) => onCycleTableKey(component.id, rowId)}
          onConnectionDragStart={onConnectionDragStart}
        />
      );
    }
    return (
      <BlockRenderer
        kind={kind.kind}
        label={component.label}
        size="md"
        canvasWidth={component.width}
        canvasHeight={component.height}
        onRenameLabel={(newLabel) => onRename(component.id, newLabel)}
      />
    );
  }
  return null;
}

const PORT_SIDES: EdgePortSide[] = ['top', 'right', 'bottom', 'left'];

export function PlacedComponentItem({
  component,
  isSelected,
  selectedIds,
  allComponents,
  transform,
  autoFocus,
  onSelect,
  onMove,
  onMoveMany,
  onRemove,
  onResize,
  onResizeWithMove,
  onBeginDragHistory,
  onEndDragHistory,
  onConnectionDragStart,
  onConnectionDragEnd,
  onRename,
  onTextChange,
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
  isPanActive,
}: PlacedComponentItemProps) {
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    // Start positions for all components being dragged (single or multi)
    starts: { id: string; x: number; y: number }[];
  } | null>(null);
  const hasCapturedRef = useRef(false);

  const isBlock = component.kind.type === 'block' || component.kind.type === 'text-block' || component.kind.type === 'shape';

  const DRAG_THRESHOLD = 4;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if (isConnectionDragging) return;
      if (isPanActive) return;
      e.stopPropagation();
      // Only reset selection to this component when it isn't already part of a multi-selection.
      // Preserving the selection lets the user drag the whole group.
      if (!isSelected || selectedIds.length <= 1) {
        onSelect(component.id);
      }
      hasCapturedRef.current = false;
      // Capture start positions for all currently selected components so we can
      // move them all together during the drag.
      const dragIds = isSelected && selectedIds.length > 1 ? selectedIds : [component.id];
      const starts = dragIds.flatMap((id) => {
        const comp = allComponents.find((c) => c.id === id);
        return comp ? [{ id, x: comp.x, y: comp.y }] : [];
      });
      dragStartRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        starts,
      };
    },
    [component.id, isSelected, selectedIds, allComponents, onSelect, isConnectionDragging, isPanActive]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current) return;
      if (!hasCapturedRef.current) {
        const sdx = e.clientX - dragStartRef.current.pointerX;
        const sdy = e.clientY - dragStartRef.current.pointerY;
        if (Math.hypot(sdx, sdy) < DRAG_THRESHOLD) return;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        hasCapturedRef.current = true;
        onBeginDragHistory();
      }
      const dx = (e.clientX - dragStartRef.current.pointerX) / transform.scale;
      const dy = (e.clientY - dragStartRef.current.pointerY) / transform.scale;

      const { starts } = dragStartRef.current;
      if (starts.length > 1) {
        onMoveMany(starts.map((s) => ({
          id: s.id,
          x: snapToGrid(s.x + dx),
          y: snapToGrid(s.y + dy),
        })));
      } else {
        const s = starts[0]!;
        const newX = snapToGrid(s.x + dx);
        const newY = snapToGrid(s.y + dy);
        onMove(component.id, newX, newY);

        // Highlight frame under component center (visual feedback only)
        const center = { x: newX + component.width / 2, y: newY + component.height / 2 };
        const targetFrame = frames.find((f) => isPointInsideFrame(center, f));
        onHighlightFrame(targetFrame?.id ?? null);
      }
    },
    [component.id, component.width, component.height, transform.scale, onMove, onMoveMany, frames, onHighlightFrame, onBeginDragHistory]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragStartRef.current) {
      const { starts } = dragStartRef.current;
      // Only update frame membership for single-component drags
      if (starts.length === 1) {
        const dx = (e.clientX - dragStartRef.current.pointerX) / transform.scale;
        const dy = (e.clientY - dragStartRef.current.pointerY) / transform.scale;
        const s = starts[0]!;
        const newX = snapToGrid(s.x + dx);
        const newY = snapToGrid(s.y + dy);
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
      }

      onHighlightFrame(null);
    }
    if (hasCapturedRef.current) onEndDragHistory();
    dragStartRef.current = null;
    hasCapturedRef.current = false;
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }, [component.id, component.width, component.height, component.frameId, transform.scale, frames, onSetComponentFrame, onHighlightFrame, onEndDragHistory]);

  const handlePointerCancel = useCallback(() => {
    if (hasCapturedRef.current) onEndDragHistory();
    dragStartRef.current = null;
    hasCapturedRef.current = false;
  }, [onEndDragHistory]);

  // Clear drag state if pointerup fires outside this element (e.g. inside the inspector panel
  // which calls stopPropagation, preventing the component's own onPointerUp from firing).
  useEffect(() => {
    const onWindowPointerUp = () => {
      if (!dragStartRef.current && !hasCapturedRef.current) return;
      if (hasCapturedRef.current) onEndDragHistory();
      dragStartRef.current = null;
      hasCapturedRef.current = false;
    };
    window.addEventListener('pointerup', onWindowPointerUp);
    return () => window.removeEventListener('pointerup', onWindowPointerUp);
  }, [onEndDragHistory]);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
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
        isConnectionDragging={isConnectionDragging}
        autoFocus={autoFocus}
        onSelect={() => onSelect(component.id)}
        onRename={onRename}
        onTextChange={onTextChange}
        onResize={onResize}
        onUpdateTableHeader={onUpdateTableHeader}
        onAddTableRow={onAddTableRow}
        onRemoveTableRow={onRemoveTableRow}
        onRenameTableRow={onRenameTableRow}
        onCycleTableKey={onCycleTableKey}
        onConnectionDragStart={(compId, port, e) => onConnectionDragStart(compId, port, e)}
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
          onResizeWithMove={onResizeWithMove}
          onBeginDragHistory={onBeginDragHistory}
          onEndDragHistory={onEndDragHistory}
        />
      )}
    </div>
  );
}
