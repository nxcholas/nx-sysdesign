'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvas } from '@/hooks/use-canvas';
import { useDragDrop } from '@/hooks/use-drag-drop';
import { usePlacedComponents } from '@/hooks/use-placed-components';
import { useConnectionDrag } from '@/hooks/use-connection-drag';
import { BLOCK_DIMENSIONS, BADGE_DIMENSIONS } from '@/lib/constants';
import type { PaletteItemKind, PortSide } from '@/lib/types';
import { getPortPosition, getSmartRoutePoints, pointsToPath, polylineMidpoint, getTempConnectionPath } from '@/lib/connection-utils';
import { buildFlowChains, composeFlowPath, FLOW_SPEED } from '@/lib/flow-chain';
import { CanvasViewport } from './canvas-viewport';
import { CanvasDropZone } from './canvas-drop-zone';
import { GRID_SIZE } from '@/lib/constants';

function getDimensions(kind: PaletteItemKind) {
  if (kind.type === 'block') return BLOCK_DIMENSIONS[kind.kind];
  return BADGE_DIMENSIONS;
}

export function CanvasRoot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { transform, didPanRef, handlePointerDown, handlePointerMove, handlePointerUp, resetTransform } =
    useCanvas(containerRef);
  const { handleDragOver, handleDrop } = useDragDrop();
  const {
    placedComponents,
    connections,
    selectedId,
    selectedConnectionId,
    addComponent,
    moveComponent,
    removeComponent,
    selectComponent,
    resizeComponent,
    addConnection,
    removeConnection,
    selectConnection,
  } = usePlacedComponents();

  // Refs that mirror state so native window listeners (in useConnectionDrag) can
  // always read the latest values without stale closures.
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const placedComponentsRef = useRef(placedComponents);
  placedComponentsRef.current = placedComponents;

  const {
    connectionDragState,
    connectionActiveRef,
    startConnectionDrag,
    endConnectionDrag,
  } = useConnectionDrag(addConnection, containerRef, transformRef, placedComponentsRef);

  const [isDragOver, setIsDragOver] = useState(false);

  // Keyboard shortcut: Delete/Backspace to remove selected component or connection
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedId && !selectedConnectionId) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      if (selectedConnectionId) {
        removeConnection(selectedConnectionId);
      } else if (selectedId) {
        removeComponent(selectedId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, selectedConnectionId, removeComponent, removeConnection]);

  const onDragEnter = useCallback(() => setIsDragOver(true), []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      setIsDragOver(false);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const result = handleDrop(e, rect, transform);
      if (!result) return;
      const { payload, x, y } = result;
      const { width, height } = getDimensions(payload);
      addComponent(payload, x - width / 2, y - height / 2, width, height);
    },
    [transform, handleDrop, addComponent]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (didPanRef.current) return;
      if (e.target === containerRef.current) {
        selectComponent(null);
        selectConnection(null);
      }
    },
    [didPanRef, selectComponent, selectConnection]
  );

  // Guard all three pointer handlers: connection drag is handled by window-level
  // native listeners in useConnectionDrag. We suppress canvas pan while active.
  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (connectionActiveRef.current) return;
      handlePointerDown(e);
    },
    [connectionActiveRef, handlePointerDown]
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (connectionActiveRef.current) return;
      handlePointerMove(e);
    },
    [connectionActiveRef, handlePointerMove]
  );

  const handleCanvasPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (connectionActiveRef.current) {
        // Release any stale pointer capture on <main> from a prior pan
        const el = e.currentTarget as HTMLElement;
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
        return;
      }
      handlePointerUp(e);
    },
    [connectionActiveRef, handlePointerUp]
  );

  const handleConnectionDragStart = useCallback(
    (componentId: string, port: PortSide, e: React.PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      startConnectionDrag(componentId, port, e, rect, transform);
    },
    [startConnectionDrag, transform]
  );

  const handleConnectionDragEnd = useCallback(
    (componentId: string, port: PortSide) => {
      endConnectionDrag(componentId, port);
    },
    [endConnectionDrag]
  );

  return (
    <main
      ref={containerRef}
      aria-label="System design canvas"
      className="relative flex-1 overflow-hidden bg-canvas-bg canvas-grid"
      style={{
        backgroundPosition: `${transform.translateX % GRID_SIZE}px ${transform.translateY % GRID_SIZE}px`,
        cursor: connectionActiveRef.current ? 'crosshair' : 'default',
      }}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={handleDragOver}
      onDrop={onDrop}
      onClick={handleCanvasClick}
    >
      {/* Connections overlay — rendered in screen space, BEFORE viewport so bubbles flow behind components */}
      {(connections.length > 0 || connectionDragState.active) && (() => {
        const { scale, translateX, translateY } = transform;
        const toScreen = (pt: { x: number; y: number }) => ({
          x: pt.x * scale + translateX,
          y: pt.y * scale + translateY,
        });
        const componentMap = new Map(placedComponents.map(c => [c.id, c]));
        const flowChains = buildFlowChains(connections, placedComponents);

        return (
          <svg
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
            width="100%"
            height="100%"
          >
            {/* Shared glow filter + component mask for bubbles */}
            <defs>
              <filter id="flow-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <mask id="bubble-mask">
                <rect width="100%" height="100%" fill="white" />
                {placedComponents.map((comp) => {
                  const screenPos = toScreen({ x: comp.x, y: comp.y });
                  return (
                    <rect
                      key={comp.id}
                      x={screenPos.x}
                      y={screenPos.y}
                      width={comp.width * scale}
                      height={comp.height * scale}
                      fill="black"
                    />
                  );
                })}
              </mask>
            </defs>

            {/* Static connection lines with clickable hit areas */}
            {connections.map((conn) => {
              const source = componentMap.get(conn.sourceId);
              const target = componentMap.get(conn.targetId);
              if (!source || !target) return null;
              const points = getSmartRoutePoints(source, target, conn.sourcePort, conn.targetPort);
              const pathD = pointsToPath(points.map(toScreen));
              const isConnSelected = conn.id === selectedConnectionId;
              return (
                <g key={conn.id}>
                  {/* Invisible wide hit area for click detection */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={12}
                    strokeLinecap="round"
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectConnection(conn.id);
                    }}
                  />
                  {/* Visible connection line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isConnSelected ? '#3b82f6' : '#6b7280'}
                    strokeWidth={isConnSelected ? 3 : 2}
                    strokeLinecap="round"
                    style={{ pointerEvents: 'none' }}
                  />
                </g>
              );
            })}

            {/* Flow chain animations — one bubble per chain, masked behind components */}
            <g mask="url(#bubble-mask)">
              {flowChains.map((chain) => {
                const { pathD, totalLength } = composeFlowPath(chain.segments, toScreen);
                if (!pathD || totalLength === 0) return null;
                const dur = totalLength / FLOW_SPEED;
                const pathId = `flow-${chain.id}`;
                return (
                  <g key={chain.id}>
                    <path id={pathId} d={pathD} fill="none" stroke="none" />
                    <circle r={4} fill="#3b82f6" filter="url(#flow-glow)">
                      <animateMotion dur={`${dur}s`} repeatCount="indefinite">
                        <mpath href={`#${pathId}`} />
                      </animateMotion>
                    </circle>
                  </g>
                );
              })}
            </g>

            {/* Temporary connection line during drag */}
            {connectionDragState.active && (() => {
              const src = componentMap.get(connectionDragState.sourceId);
              if (!src) return null;
              const from = toScreen(getPortPosition(src, connectionDragState.sourcePort));
              const to = toScreen({
                x: connectionDragState.cursorX,
                y: connectionDragState.cursorY,
              });
              const pathD = getTempConnectionPath(from, to, connectionDragState.sourcePort);
              return (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })()}
          </svg>
        );
      })()}

      {/* Connection delete button — positioned at midpoint of selected connection */}
      {selectedConnectionId && (() => {
        const conn = connections.find(c => c.id === selectedConnectionId);
        if (!conn) return null;
        const componentMap = new Map(placedComponents.map(c => [c.id, c]));
        const source = componentMap.get(conn.sourceId);
        const target = componentMap.get(conn.targetId);
        if (!source || !target) return null;
        const { scale: s, translateX: tx, translateY: ty } = transform;
        const toScreen = (pt: { x: number; y: number }) => ({
          x: pt.x * s + tx,
          y: pt.y * s + ty,
        });
        const points = getSmartRoutePoints(source, target, conn.sourcePort, conn.targetPort);
        const mid = polylineMidpoint(points.map(toScreen));
        return (
          <button
            type="button"
            aria-label="Delete connection"
            onClick={() => removeConnection(selectedConnectionId)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ position: 'absolute', left: mid.x - 10, top: mid.y - 10, zIndex: 10 }}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-md transition-colors"
          >
            <svg width={10} height={10} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="2" y1="2" x2="8" y2="8" />
              <line x1="8" y1="2" x2="2" y2="8" />
            </svg>
          </button>
        );
      })()}

      {/* Placed components + connections layer */}
      <CanvasViewport
        transform={transform}
        placedComponents={placedComponents}
        selectedId={selectedId}
        onSelect={selectComponent}
        onMove={moveComponent}
        onRemove={removeComponent}
        onResize={resizeComponent}
        onConnectionDragStart={handleConnectionDragStart}
        onConnectionDragEnd={handleConnectionDragEnd}
        connectionDragState={connectionDragState}
        highlightedPorts={(() => {
          const set = new Set<string>();
          if (selectedConnectionId) {
            const conn = connections.find(c => c.id === selectedConnectionId);
            if (conn) {
              set.add(`${conn.sourceId}:${conn.sourcePort}`);
              set.add(`${conn.targetId}:${conn.targetPort}`);
            }
          }
          return set;
        })()}
      />

      {/* Drop zone visual indicator */}
      <CanvasDropZone isDragOver={isDragOver} />

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 z-10">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => resetTransform()}
          className="px-2.5 py-1 rounded text-xs font-mono text-gray-400 bg-panel-bg
            border border-panel-border hover:text-gray-200 hover:border-gray-600
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            transition-colors"
          aria-label="Reset canvas view"
          title="Reset view (100%)"
        >
          {Math.round(transform.scale * 100)}%
        </button>
      </div>

      {/* Empty state hint */}
      {placedComponents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-gray-600 text-sm font-mono select-none">
            Drag components from the panel to get started
          </p>
        </div>
      )}
    </main>
  );
}
