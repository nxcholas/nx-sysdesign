'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvas } from '@/hooks/use-canvas';
import { useCanvasTool } from '@/hooks/use-canvas-tool';
import { useDragDrop } from '@/hooks/use-drag-drop';
import { usePlacedComponents } from '@/hooks/use-placed-components';
import { useConnectionDrag } from '@/hooks/use-connection-drag';
import { useMarqueeSelect } from '@/hooks/use-marquee-select';
import { useFrameDraw } from '@/hooks/use-frame-draw';
import { BLOCK_DIMENSIONS, BADGE_DIMENSIONS, GRID_SIZE } from '@/lib/constants';
import type { PaletteItemKind, PortSide } from '@/lib/types';
import { isPointInsideFrame } from '@/lib/frame-utils';
import { getPortPosition, getSmartRoutePoints, pointsToPath, polylineMidpoint, getTempConnectionPath } from '@/lib/connection-utils';
import { buildFlowChains, composeFlowPath, FLOW_SPEED } from '@/lib/flow-chain';
import { CanvasViewport } from './canvas-viewport';
import { CanvasDropZone } from './canvas-drop-zone';
import { CanvasToolbar } from './canvas-toolbar';

function getDimensions(kind: PaletteItemKind) {
  if (kind.type === 'block') return BLOCK_DIMENSIONS[kind.kind];
  return BADGE_DIMENSIONS;
}

export function CanvasRoot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeTool, setActiveTool } = useCanvasTool();
  const { transform, didPanRef, spaceHeldRef, ctrlHeldRef, handlePointerDown, handlePointerMove, handlePointerUp, resetTransform } =
    useCanvas(containerRef);
  const { handleDragOver, handleDrop } = useDragDrop();
  const {
    placedComponents,
    connections,
    selectedIds,
    selectedConnectionId,
    frames,
    selectedFrameId,
    addComponent,
    moveComponent,
    removeComponent,
    selectComponent,
    resizeComponent,
    addConnection,
    removeConnection,
    selectConnection,
    selectMany,
    removeMany,
    addFrame,
    moveFrame,
    removeFrame,
    selectFrame,
    renameFrame,
    resizeFrame,
    setComponentFrame,
  } = usePlacedComponents();

  // Refs that mirror state so native window listeners (in useConnectionDrag) can
  // always read the latest values without stale closures.
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const placedComponentsRef = useRef(placedComponents);
  placedComponentsRef.current = placedComponents;
  const framesRef = useRef(frames);
  framesRef.current = frames;

  const {
    connectionDragState,
    connectionActiveRef,
    startConnectionDrag,
    endConnectionDrag,
  } = useConnectionDrag(addConnection, containerRef, transformRef, placedComponentsRef, framesRef);

  const {
    selectionRect,
    didMarqueeRef,
    handleSelectionPointerDown,
    handleSelectionPointerMove,
    handleSelectionPointerUp,
  } = useMarqueeSelect(containerRef, transform, placedComponents, selectMany, selectComponent, selectConnection);

  const {
    frameDrawRect,
    handleFramePointerDown,
    handleFramePointerMove,
    handleFramePointerUp,
  } = useFrameDraw(containerRef, transform, placedComponents, addFrame, setActiveTool);

  const [isDragOver, setIsDragOver] = useState(false);
  const [highlightedFrameId, setHighlightedFrameId] = useState<string | null>(null);

  // Keyboard shortcut: Delete/Backspace to remove selected component(s) or connection
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedIds.length === 0 && !selectedConnectionId && !selectedFrameId) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      if (selectedFrameId) {
        removeFrame(selectedFrameId);
      } else if (selectedConnectionId) {
        removeConnection(selectedConnectionId);
      } else if (selectedIds.length > 0) {
        removeMany(selectedIds);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIds, selectedConnectionId, selectedFrameId, removeMany, removeConnection, removeFrame]);

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
      const dropX = x - width / 2;
      const dropY = y - height / 2;
      const center = { x, y };
      const targetFrame = frames.find((f) => isPointInsideFrame(center, f));
      addComponent(payload, dropX, dropY, width, height, targetFrame?.id);
    },
    [transform, handleDrop, addComponent, frames]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (didPanRef.current) return;
      if (didMarqueeRef.current) return;
      if (e.target === containerRef.current) {
        selectComponent(null);
        selectConnection(null);
        selectFrame(null);
        setHighlightedFrameId(null);
      }
    },
    [didPanRef, didMarqueeRef, selectComponent, selectConnection, selectFrame, setHighlightedFrameId]
  );

  // Route pointer events between pan, marquee selection, frame draw, and connection drag.
  // Connection drag is handled by window-level native listeners and takes priority.
  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (connectionActiveRef.current) return;

      const isMiddleClick = e.button === 1;
      const isLeftClick = e.button === 0;

      // Pan: middle-click always, left-click if pan tool, space, or ctrl held
      if (isMiddleClick || (isLeftClick && (activeTool === 'pan' || spaceHeldRef.current || ctrlHeldRef.current))) {
        handlePointerDown(e);
        return;
      }

      // Frame draw: left-click in frame mode
      if (isLeftClick && activeTool === 'frame') {
        handleFramePointerDown(e);
        return;
      }

      // Selection: left-click in select mode on empty canvas
      if (isLeftClick && activeTool === 'select') {
        handleSelectionPointerDown(e);
      }
    },
    [connectionActiveRef, activeTool, spaceHeldRef, handlePointerDown, handleFramePointerDown, handleSelectionPointerDown]
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (connectionActiveRef.current) return;
      handlePointerMove(e);
      handleSelectionPointerMove(e);
      handleFramePointerMove(e);
    },
    [connectionActiveRef, handlePointerMove, handleSelectionPointerMove, handleFramePointerMove]
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
      handleSelectionPointerUp(e);
      handleFramePointerUp(e);
    },
    [connectionActiveRef, handlePointerUp, handleSelectionPointerUp, handleFramePointerUp]
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
        backgroundPosition: [
          `${transform.translateX % 32}px ${transform.translateY % 32}px`,
          `${transform.translateX % 32}px ${transform.translateY % 32}px`,
          `${transform.translateX % GRID_SIZE}px ${transform.translateY % GRID_SIZE}px`,
          `${transform.translateX % GRID_SIZE}px ${transform.translateY % GRID_SIZE}px`,
        ].join(', '),
        cursor: connectionActiveRef.current
          ? 'crosshair'
          : activeTool === 'frame'
            ? 'crosshair'
            : selectionRect
              ? 'crosshair'
              : (activeTool === 'pan' || ctrlHeldRef.current)
                ? 'grab'
                : 'default',
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
        type EntityRect = { id: string; x: number; y: number; width: number; height: number };
        const entityMap = new Map<string, EntityRect>([
          ...placedComponents.map(c => [c.id, c] as [string, EntityRect]),
          ...frames.map(f => [f.id, f] as [string, EntityRect]),
        ]);
        const flowChains = buildFlowChains(connections, [...placedComponents, ...frames]);

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
                {frames.map((f) => {
                  const screenPos = toScreen({ x: f.x, y: f.y });
                  return (
                    <rect
                      key={f.id}
                      x={screenPos.x}
                      y={screenPos.y}
                      width={f.width * scale}
                      height={f.height * scale}
                      fill="black"
                    />
                  );
                })}
              </mask>
            </defs>

            {/* Static connection lines with clickable hit areas */}
            {connections.map((conn) => {
              const source = entityMap.get(conn.sourceId);
              const target = entityMap.get(conn.targetId);
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
              const src = entityMap.get(connectionDragState.sourceId);
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
        type EntityRect = { id: string; x: number; y: number; width: number; height: number };
        const connEntityMap = new Map<string, EntityRect>([
          ...placedComponents.map(c => [c.id, c] as [string, EntityRect]),
          ...frames.map(f => [f.id, f] as [string, EntityRect]),
        ]);
        const source = connEntityMap.get(conn.sourceId);
        const target = connEntityMap.get(conn.targetId);
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

      {/* Placed components + frames layer */}
      <CanvasViewport
        transform={transform}
        placedComponents={placedComponents}
        selectedIds={selectedIds}
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
        frames={frames}
        selectedFrameId={selectedFrameId}
        highlightedFrameId={highlightedFrameId}
        onSelectFrame={selectFrame}
        onMoveFrame={moveFrame}
        onRemoveFrame={removeFrame}
        onRenameFrame={renameFrame}
        onResizeFrame={resizeFrame}
        onSetComponentFrame={setComponentFrame}
        onHighlightFrame={setHighlightedFrameId}
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

      {/* Selection rectangle overlay */}
      {selectionRect && (() => {
        const { scale, translateX, translateY } = transform;
        const x = Math.min(selectionRect.startX, selectionRect.endX);
        const y = Math.min(selectionRect.startY, selectionRect.endY);
        const w = Math.abs(selectionRect.endX - selectionRect.startX);
        const h = Math.abs(selectionRect.endY - selectionRect.startY);
        return (
          <div
            className="absolute pointer-events-none border border-blue-500/70 bg-blue-500/10"
            style={{
              left: x * scale + translateX,
              top: y * scale + translateY,
              width: w * scale,
              height: h * scale,
              zIndex: 5,
            }}
          />
        );
      })()}

      {/* Frame draw preview */}
      {frameDrawRect && (() => {
        const { scale, translateX, translateY } = transform;
        return (
          <div
            className="absolute pointer-events-none border border-dashed border-blue-400/70 bg-blue-400/5"
            style={{
              left: frameDrawRect.x * scale + translateX,
              top: frameDrawRect.y * scale + translateY,
              width: frameDrawRect.width * scale,
              height: frameDrawRect.height * scale,
              zIndex: 5,
            }}
          />
        );
      })()}

      {/* Canvas toolbar */}
      <CanvasToolbar activeTool={activeTool} onToolChange={setActiveTool} />

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
