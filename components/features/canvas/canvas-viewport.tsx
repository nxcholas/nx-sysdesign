import type { CanvasTransform, PlacedComponent, PortSide } from '@/lib/types';
import type { ConnectionDragState } from '@/hooks/use-connection-drag';
import { PlacedComponentItem } from './placed-component';

interface CanvasViewportProps {
  transform: CanvasTransform;
  placedComponents: PlacedComponent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onConnectionDragStart: (componentId: string, port: PortSide, e: React.PointerEvent) => void;
  onConnectionDragEnd: (componentId: string, port: PortSide) => void;
  connectionDragState: ConnectionDragState;
  highlightedPorts: Set<string>;
}

export function CanvasViewport({
  transform,
  placedComponents,
  selectedId,
  onSelect,
  onMove,
  onRemove,
  onResize,
  onConnectionDragStart,
  onConnectionDragEnd,
  connectionDragState,
  highlightedPorts,
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
      {/* Placed components */}
      {placedComponents.map((component) => (
        <PlacedComponentItem
          key={component.id}
          component={component}
          isSelected={component.id === selectedId}
          transform={transform}
          onSelect={onSelect}
          onMove={onMove}
          onRemove={onRemove}
          onResize={onResize}
          onConnectionDragStart={onConnectionDragStart}
          onConnectionDragEnd={onConnectionDragEnd}
          isConnectionDragging={connectionDragState.active}
          highlightedPorts={highlightedPorts}
        />
      ))}
    </div>
  );
}
