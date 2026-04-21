import type { CanvasTransform, PlacedComponent, Frame, PortSide } from '@/lib/types';
import type { ConnectionDragState } from '@/hooks/use-connection-drag';
import { PlacedComponentItem } from './placed-component';
import { FrameComponent } from './frame-component';

interface CanvasViewportProps {
  transform: CanvasTransform;
  placedComponents: PlacedComponent[];
  selectedIds: string[];
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onResizeWithMove?: (id: string, x: number, y: number, width: number, height: number) => void;
  onConnectionDragStart: (entityId: string, port: PortSide, e: React.PointerEvent) => void;
  onConnectionDragEnd: (entityId: string, port: PortSide) => void;
  connectionDragState: ConnectionDragState;
  highlightedPorts: Set<string>;
  frames: Frame[];
  selectedFrameId: string | null;
  highlightedFrameId: string | null;
  onSelectFrame: (id: string) => void;
  onMoveFrame: (id: string, x: number, y: number) => void;
  onRemoveFrame: (id: string) => void;
  onRenameFrame: (id: string, label: string) => void;
  onRenameComponent: (id: string, label: string) => void;
  onResizeFrame: (id: string, width: number, height: number, x: number, y: number) => void;
  onSetComponentFrame: (componentId: string, frameId: string | null) => void;
  onSetFrameParent: (frameId: string, parentFrameId: string | null) => void;
  onHighlightFrame: (id: string | null) => void;
  onUpdateTableHeader: (id: string, header: string) => void;
  onAddTableRow: (id: string, rowId?: string, name?: string) => void;
  onRemoveTableRow: (id: string, rowId: string) => void;
  onRenameTableRow: (id: string, rowId: string, name: string) => void;
  onCycleTableKey: (id: string, rowId: string) => void;
  onTextChange: (id: string, text: string) => void;
  autoFocusId: string | null;
  onBeginDragHistory: () => void;
  onEndDragHistory: () => void;
}


export function CanvasViewport({
  transform,
  placedComponents,
  selectedIds,
  onSelect,
  onMove,
  onRemove,
  onResize,
  onResizeWithMove,
  onConnectionDragStart,
  onConnectionDragEnd,
  connectionDragState,
  highlightedPorts,
  frames,
  selectedFrameId,
  highlightedFrameId,
  onSelectFrame,
  onMoveFrame,
  onRemoveFrame,
  onRenameFrame,
  onRenameComponent,
  onResizeFrame,
  onSetComponentFrame,
  onSetFrameParent,
  onHighlightFrame,
  onUpdateTableHeader,
  onAddTableRow,
  onRemoveTableRow,
  onRenameTableRow,
  onCycleTableKey,
  onTextChange,
  autoFocusId,
  onBeginDragHistory,
  onEndDragHistory,
}: CanvasViewportProps) {
  const { scale, translateX, translateY } = transform;

  return (
    <div
      aria-hidden="true"
      style={{
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        transformOrigin: '0 0',
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        willChange: 'transform',
      }}
    >
      {/* Frames — sorted by zIndex so outer frames render first (behind inner frames) */}
      {[...frames].sort((a, b) => a.zIndex - b.zIndex).map((frame) => (
        <FrameComponent
          key={frame.id}
          frame={frame}
          isSelected={frame.id === selectedFrameId}
          isHighlighted={frame.id === highlightedFrameId}
          transform={transform}
          allFrames={frames}
          onSelect={onSelectFrame}
          onMove={onMoveFrame}
          onRemove={onRemoveFrame}
          onRename={onRenameFrame}
          onResize={onResizeFrame}
          onSetFrameParent={onSetFrameParent}
          onConnectionDragStart={onConnectionDragStart}
          onConnectionDragEnd={onConnectionDragEnd}
          connectionDragState={connectionDragState}
          highlightedPorts={highlightedPorts}
        />
      ))}

      {/* Placed components */}
      {placedComponents.map((component) => (
        <PlacedComponentItem
          key={component.id}
          component={component}
          isSelected={selectedIds.includes(component.id)}
          transform={transform}
          onSelect={onSelect}
          onMove={onMove}
          onRemove={onRemove}
          onResize={onResize}
          onResizeWithMove={onResizeWithMove}
          onConnectionDragStart={onConnectionDragStart}
          onConnectionDragEnd={onConnectionDragEnd}
          onRename={onRenameComponent}
          onTextChange={onTextChange}
          autoFocus={component.id === autoFocusId}
          onBeginDragHistory={onBeginDragHistory}
          onEndDragHistory={onEndDragHistory}
          isConnectionDragging={connectionDragState.active}
          highlightedPorts={highlightedPorts}
          frames={frames}
          onSetComponentFrame={onSetComponentFrame}
          onHighlightFrame={onHighlightFrame}
          onUpdateTableHeader={onUpdateTableHeader}
          onAddTableRow={onAddTableRow}
          onRemoveTableRow={onRemoveTableRow}
          onRenameTableRow={onRenameTableRow}
          onCycleTableKey={onCycleTableKey}
        />
      ))}
    </div>
  );
}
