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
  onHighlightFrame: (id: string | null) => void;
}

export function CanvasViewport({
  transform,
  placedComponents,
  selectedIds,
  onSelect,
  onMove,
  onRemove,
  onResize,
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
  onHighlightFrame,
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
      {/* Frames — rendered before components so they appear behind */}
      {frames.map((frame) => (
        <FrameComponent
          key={frame.id}
          frame={frame}
          isSelected={frame.id === selectedFrameId}
          isHighlighted={frame.id === highlightedFrameId}
          transform={transform}
          onSelect={onSelectFrame}
          onMove={onMoveFrame}
          onRemove={onRemoveFrame}
          onRename={onRenameFrame}
          onResize={onResizeFrame}
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
          onConnectionDragStart={onConnectionDragStart}
          onConnectionDragEnd={onConnectionDragEnd}
          onRename={onRenameComponent}
          isConnectionDragging={connectionDragState.active}
          highlightedPorts={highlightedPorts}
          frames={frames}
          onSetComponentFrame={onSetComponentFrame}
          onHighlightFrame={onHighlightFrame}
        />
      ))}
    </div>
  );
}
