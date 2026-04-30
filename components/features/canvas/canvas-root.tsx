'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvasTool } from '@/hooks/use-canvas-tool';
import { useDragDrop } from '@/hooks/use-drag-drop';
import { useConnectionDrag } from '@/hooks/use-connection-drag';
import { useMarqueeSelect } from '@/hooks/use-marquee-select';
import { useFrameDraw } from '@/hooks/use-frame-draw';
import { useTextBlockPlace } from '@/hooks/use-text-block-place';
import { useShapeDraw } from '@/hooks/use-shape-draw';
import { useClipboard } from '@/hooks/use-clipboard';
import { BADGE_DIMENSIONS, GRID_SIZE } from '@/lib/constants';
import { getBlockDef } from '@/lib/block-registry';
import type {
  PaletteItemKind,
  PortSide,
  PlacedComponent,
  Connection,
  Frame,
  CanvasTransform,
  Cardinality,
  ShapeKind,
  TextStyle,
  ShapeStyle,
} from '@/lib/types';
import { isPointInsideFrame } from '@/lib/frame-utils';
import { getSmartRoutePoints, pointsToPath, oppositePort, truncatePolyline, PORT_HIT_RADIUS, isRowPort, polylineMidpoint, polylineProject } from '@/lib/connection-utils';
import { getCardinalityGlyphPaths } from '@/lib/cardinality-glyph';
import { buildFlowChains, composeFlowPath, FLOW_SPEED } from '@/lib/flow-chain';
import { CanvasViewport } from './canvas-viewport';
import { CanvasDropZone } from './canvas-drop-zone';
import { CanvasToolbar } from './canvas-toolbar';
import { ShapeGeometry } from './shape-renderer';
import { ConnectionInspector } from '@/components/features/inspector/connection-inspector';
import { TextBlockInspector } from '@/components/features/inspector/text-block-inspector';
import { ShapeInspector } from '@/components/features/inspector/shape-inspector';
import { ShortcutsOverlay } from './shortcuts-overlay';
import { Tooltip } from '@/components/ui/tooltip';
import { CircleHelp } from 'lucide-react';

/** Serialize a PortSide to a stable string key for the highlightedPorts set. */
function portKey(componentId: string, port: PortSide): string {
  if (isRowPort(port)) {
    return `${componentId}:${port.side}:${port.rowId}`;
  }
  return `${componentId}:${port}`;
}

function getDimensions(kind: PaletteItemKind) {
  if (kind.type === 'block') {
    const def = getBlockDef(kind.kind);
    return def ? { width: def.defaultWidth, height: def.defaultHeight } : BADGE_DIMENSIONS;
  }
  return BADGE_DIMENSIONS;
}

export interface CanvasRootProps {
  // State
  placedComponents: PlacedComponent[];
  connections: Connection[];
  selectedIds: string[];
  selectedConnectionId: string | null;
  frames: Frame[];
  selectedFrameId: string | null;
  transform: CanvasTransform;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  exportLayerRef: React.RefObject<HTMLDivElement | null>;
  // Callbacks — component
  addComponent: (kind: PaletteItemKind, x: number, y: number, width: number, height: number, frameId?: string, extras?: Partial<Pick<PlacedComponent, 'text' | 'textStyle' | 'shapeStyle'>>) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  resizeComponent: (id: string, width: number, height: number) => void;
  // Callbacks — connection
  addConnection: (sourceId: string, sourcePort: PortSide, targetId: string, targetPort: PortSide) => void;
  removeConnection: (id: string) => void;
  selectConnection: (id: string | null) => void;
  // Callbacks — multi-select
  selectMany: (ids: string[]) => void;
  removeMany: (ids: string[]) => void;
  // Callbacks — frame
  addFrame: (payload: Omit<Frame, 'id' | 'zIndex'>, childIds?: string[]) => void;
  moveFrame: (id: string, x: number, y: number) => void;
  removeFrame: (id: string) => void;
  selectFrame: (id: string | null) => void;
  renameFrame: (id: string, label: string) => void;
  renameComponent: (id: string, label: string) => void;
  resizeFrame: (id: string, width: number, height: number, x: number, y: number) => void;
  setComponentFrame: (componentId: string, frameId: string | null) => void;
  setFrameParent: (frameId: string, parentFrameId: string | null) => void;
  // Pan/zoom handlers (owned by page.tsx via useCanvas)
  isPanActive: boolean;
  setIsPanActive: (v: boolean) => void;
  didPanRef: React.RefObject<boolean>;
  spaceHeldRef: React.RefObject<boolean>;
  ctrlHeldRef: React.RefObject<boolean>;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  resetTransform: () => void;
  // Callbacks — entity relation table
  updateTableHeader: (id: string, header: string) => void;
  addTableRow: (id: string, rowId?: string, name?: string) => void;
  removeTableRow: (id: string, rowId: string) => void;
  renameTableRow: (id: string, rowId: string, name: string) => void;
  cycleTableKey: (id: string, rowId: string) => void;
  updateConnectionCardinality: (id: string, cardinality: Cardinality) => void;
  updateConnectionLabel: (id: string, label: string) => void;
  updateConnectionLabelT: (id: string, labelT: number) => void;
  updateText: (id: string, text: string) => void;
  updateTextStyle: (id: string, style: Partial<TextStyle>) => void;
  updateShapeStyle: (id: string, style: Partial<ShapeStyle>) => void;
  updateShapeKind: (id: string, shape: ShapeKind) => void;
  // Clipboard & history
  undo: () => void;
  pasteComponents: (components: PlacedComponent[], connections: Connection[], frames: Frame[]) => void;
  beginDragHistory: () => void;
  endDragHistory: () => void;
  // Diagram persistence callback
  onStateChange: () => void;
  // Snap & alignment
  snapEnabled: boolean;
  onSnapToggle: () => void;
  onAlign: (direction: import('@/lib/types').AlignmentDirection) => void;
}

export function CanvasRoot(props: CanvasRootProps) {
  const {
    placedComponents,
    connections,
    selectedIds,
    selectedConnectionId,
    frames,
    selectedFrameId,
    transform,
    canvasRef,
    exportLayerRef,
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
    renameComponent,
    resizeFrame,
    setComponentFrame,
    setFrameParent,
    updateTableHeader,
    addTableRow,
    removeTableRow,
    renameTableRow,
    cycleTableKey,
    updateConnectionCardinality,
    updateConnectionLabel,
    updateConnectionLabelT,
    updateText,
    updateTextStyle,
    updateShapeStyle,
    updateShapeKind,
    isPanActive,
    setIsPanActive,
    didPanRef,
    spaceHeldRef,
    ctrlHeldRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetTransform,
    undo,
    pasteComponents,
    beginDragHistory,
    endDragHistory,
    onStateChange,
    snapEnabled,
    onSnapToggle,
    onAlign,
  } = props;

  // useCanvasTool is purely local UI state — kept internal
  const { activeTool, setActiveTool } = useCanvasTool();

  // Sync isPanActive when the pan tool is explicitly selected or deselected
  useEffect(() => {
    if (activeTool === 'pan') {
      setIsPanActive(true);
    } else {
      // Only clear if neither modifier key is held
      if (!spaceHeldRef.current && !ctrlHeldRef.current) {
        setIsPanActive(false);
      }
    }
  }, [activeTool, setIsPanActive, spaceHeldRef, ctrlHeldRef]);

  // isPanBlockActive is the final derived value used by child components
  const isPanBlockActive = isPanActive || activeTool === 'pan';

  const [activeShape, setActiveShape] = useState<ShapeKind | null>(null);
  const [autoFocusId, setAutoFocusId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [flowVisible, setFlowVisible] = useState(true);
  const [labelEditingId, setLabelEditingId] = useState<string | null>(null);
  const [labelDraggingId, setLabelDraggingId] = useState<string | null>(null);
  const labelDragRef = useRef<{ connId: string; canvasPoints: { x: number; y: number }[] } | null>(null);

  const { handleDragOver, handleDrop } = useDragDrop();

  // Refs that mirror state so native window listeners (in useConnectionDrag) can
  // always read the latest values without stale closures.
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const placedComponentsRef = useRef(placedComponents);
  placedComponentsRef.current = placedComponents;
  const framesRef = useRef(frames);
  framesRef.current = frames;
  const connectionsRef = useRef(connections);
  connectionsRef.current = connections;
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  const selectedFrameIdRef = useRef(selectedFrameId);
  selectedFrameIdRef.current = selectedFrameId;

  const { copy: clipboardCopy, paste: clipboardPaste } = useClipboard(
    () => selectedIdsRef.current,
    () => placedComponentsRef.current,
    () => connectionsRef.current,
    () => framesRef.current,
    () => selectedFrameIdRef.current,
    pasteComponents,
  );

  const {
    connectionDragState,
    connectionActiveRef,
    startConnectionDrag,
    endConnectionDrag,
  } = useConnectionDrag(addConnection, canvasRef, transformRef, placedComponentsRef, framesRef);

  const {
    selectionRect,
    didMarqueeRef,
    handleSelectionPointerDown,
    handleSelectionPointerMove,
    handleSelectionPointerUp,
  } = useMarqueeSelect(canvasRef, transform, placedComponents, selectMany, selectComponent, selectConnection);

  const {
    frameDrawRect,
    handleFramePointerDown,
    handleFramePointerMove,
    handleFramePointerUp,
  } = useFrameDraw(canvasRef, transform, placedComponents, addFrame, setActiveTool);

  const { handleTextBlockPointerDown } = useTextBlockPlace(
    canvasRef,
    transform,
    placedComponents,
    (kind, x, y, w, h, frameId, extras) => addComponent(kind, x, y, w, h, frameId, extras),
    setActiveTool,
    (id) => {
      // '__latest__' sentinel: we need to find the newly added component by comparing
      // before/after — canvas-root will set autoFocusId to the last placedComponent id
      // after the state update via a useEffect.
      if (id === '__latest__') setAutoFocusId('__latest__');
    },
  );


  const {
    shapeDrawRect,
    handleShapePointerDown,
    handleShapePointerMove,
    handleShapePointerUp,
  } = useShapeDraw(canvasRef, transform, activeShape, addComponent, setActiveTool);

  // After a text block is placed, resolve '__latest__' to the actual new component id
  useEffect(() => {
    if (autoFocusId === '__latest__' && placedComponents.length > 0) {
      const last = placedComponents[placedComponents.length - 1];
      if (last && last.kind.type === 'text-block') {
        setAutoFocusId(last.id);
        // Clear after one render so it doesn't re-trigger
        const timer = setTimeout(() => setAutoFocusId(null), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [autoFocusId, placedComponents]);

  const [isDragOver, setIsDragOver] = useState(false);
  const [highlightedFrameId, setHighlightedFrameId] = useState<string | null>(null);

  // Notify diagram hook when canvas state changes (with mount guard to avoid
  // firing on initial render / diagram load).
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    onStateChange();
  }, [placedComponents, connections, frames, onStateChange]);

  // Keyboard shortcuts: Delete/Backspace, Ctrl+C/V/Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName ?? '';
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (active?.isContentEditable ?? false);

      const ctrl = e.ctrlKey || e.metaKey;

      // ? — toggle shortcuts overlay (skip when typing)
      if (e.key === '?' && !inInput && !ctrl) {
        setShowShortcuts(prev => !prev);
        return;
      }

      // A — toggle data flow animation
      if ((e.key === 'a' || e.key === 'A') && !inInput && !ctrl) {
        setFlowVisible(prev => !prev);
        return;
      }

      // Ctrl+Z — undo (allowed even when nothing is selected)
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        if (inInput) return;
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+C — copy selected components
      if (ctrl && e.key === 'c') {
        if (inInput) return;
        if (selectedIds.length > 0) {
          e.preventDefault();
          clipboardCopy();
        }
        return;
      }

      // Ctrl+V — paste clipboard
      if (ctrl && e.key === 'v') {
        if (inInput) return;
        e.preventDefault();
        clipboardPaste();
        return;
      }

      // Delete/Backspace — remove selected
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (selectedIds.length === 0 && !selectedConnectionId && !selectedFrameId) return;
      if (inInput) return;
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
  }, [selectedIds, selectedConnectionId, selectedFrameId, removeMany, removeConnection, removeFrame, undo, clipboardCopy, clipboardPaste, showShortcuts]);

  const onDragEnter = useCallback(() => setIsDragOver(true), []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      setIsDragOver(false);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const result = handleDrop(e, rect, transform, snapEnabled);
      if (!result) return;
      const { payload, x, y } = result;
      const { width, height } = getDimensions(payload);
      const dropX = x - width / 2;
      const dropY = y - height / 2;
      const center = { x, y };
      const targetFrame = frames.find((f) => isPointInsideFrame(center, f));
      addComponent(payload, dropX, dropY, width, height, targetFrame?.id);
    },
    [transform, handleDrop, addComponent, frames, canvasRef]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (didPanRef.current) return;
      if (didMarqueeRef.current) return;
      if (e.target === canvasRef.current) {
        selectComponent(null);
        selectConnection(null);
        selectFrame(null);
        setHighlightedFrameId(null);
      }
    },
    [didPanRef, didMarqueeRef, canvasRef, selectComponent, selectConnection, selectFrame]
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

      // Text block: left-click in text-block mode
      if (isLeftClick && activeTool === 'text-block') {
        handleTextBlockPointerDown(e);
        return;
      }

      // Shape draw: left-click in shape mode (only when a shape is selected)
      if (isLeftClick && activeTool === 'shape' && activeShape) {
        handleShapePointerDown(e);
        return;
      }

      // Selection: left-click in select mode on empty canvas
      if (isLeftClick && activeTool === 'select') {
        handleSelectionPointerDown(e);
      }
    },
    [connectionActiveRef, activeTool, activeShape, spaceHeldRef, ctrlHeldRef, handlePointerDown, handleFramePointerDown, handleTextBlockPointerDown, handleShapePointerDown, handleSelectionPointerDown]
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (connectionActiveRef.current) return;
      handlePointerMove(e);
      handleSelectionPointerMove(e);
      handleFramePointerMove(e);
      handleShapePointerMove(e);
    },
    [connectionActiveRef, handlePointerMove, handleSelectionPointerMove, handleFramePointerMove, handleShapePointerMove]
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
      handleShapePointerUp(e);
    },
    [connectionActiveRef, handlePointerUp, handleSelectionPointerUp, handleFramePointerUp, handleShapePointerUp]
  );

  const handleConnectionDragStart = useCallback(
    (componentId: string, port: PortSide, e: React.PointerEvent) => {
      const el = canvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      startConnectionDrag(componentId, port, e, rect, transform);
    },
    [startConnectionDrag, transform, canvasRef]
  );

  const handleConnectionDragEnd = useCallback(
    (componentId: string, port: PortSide) => {
      endConnectionDrag(componentId, port);
    },
    [endConnectionDrag]
  );

  return (
    <main
      ref={canvasRef}
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
            : activeTool === 'shape'
              ? 'crosshair'
              : activeTool === 'text-block'
                ? 'text'
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
      {/* Connection inspector — shown when a connection is selected */}
      {selectedConnectionId && (() => {
        const conn = connections.find(c => c.id === selectedConnectionId);
        if (!conn) return null;
        return (
          <ConnectionInspector
            connection={conn}
            onUpdateCardinality={updateConnectionCardinality}
            onUpdateLabel={updateConnectionLabel}
            onRemove={removeConnection}
          />
        );
      })()}

      {/* Shape inspector — shown when a shape component is selected */}
      {selectedIds.length === 1 && (() => {
        const comp = placedComponents.find(c => c.id === selectedIds[0]);
        if (!comp || comp.kind.type !== 'shape') return null;
        return (
          <ShapeInspector
            component={comp}
            onUpdateStyle={(style) => updateShapeStyle(comp.id, style)}
            onUpdateShape={(shape) => updateShapeKind(comp.id, shape)}
            onUpdateTextStyle={(style) => updateTextStyle(comp.id, style)}
            onRemove={() => removeComponent(comp.id)}
          />
        );
      })()}

      {/* Text block inspector — shown when a text block is selected */}
      {selectedIds.length === 1 && (() => {
        const comp = placedComponents.find(c => c.id === selectedIds[0]);
        if (!comp || comp.kind.type !== 'text-block') return null;
        return (
          <TextBlockInspector
            component={comp}
            onUpdateTextStyle={(style) => updateTextStyle(comp.id, style)}
            onRemove={() => removeComponent(comp.id)}
          />
        );
      })()}

      {/* Flow bubble layer — rendered BEFORE viewport so bubbles appear behind components */}
      {connections.length > 0 && flowVisible && (() => {
        const { scale, translateX, translateY } = transform;
        const toScreen = (pt: { x: number; y: number }) => ({
          x: pt.x * scale + translateX,
          y: pt.y * scale + translateY,
        });
        const flowChains = buildFlowChains(connections, [...placedComponents, ...frames]);
        if (flowChains.length === 0) return null;

        return (
          <svg
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
            width="100%"
            height="100%"
          >
            <defs>
              <filter id="flow-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g>
              {flowChains.map((chain) => {
                const { pathD, totalLength } = composeFlowPath(chain.segments, toScreen, placedComponents);
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
          </svg>
        );
      })()}

      {/* Export layer — wraps viewport + connections so both are captured in PNG export */}
      <div ref={exportLayerRef} style={{ position: 'absolute', inset: 0 }}>

      {/* Placed components + frames layer */}
      <CanvasViewport
        transform={transform}
        placedComponents={placedComponents}
        selectedIds={selectedIds}
        onSelect={selectComponent}
        onMove={moveComponent}
        onRemove={removeComponent}
        onResize={resizeComponent}
        onResizeWithMove={(id, x, y, w, h) => { resizeComponent(id, w, h); moveComponent(id, x, y); }}
        onConnectionDragStart={handleConnectionDragStart}
        onConnectionDragEnd={handleConnectionDragEnd}
        connectionDragState={connectionDragState}
        highlightedPorts={(() => {
          const set = new Set<string>();
          if (selectedConnectionId) {
            const conn = connections.find(c => c.id === selectedConnectionId);
            if (conn) {
              set.add(portKey(conn.sourceId, conn.sourcePort));
              set.add(portKey(conn.targetId, conn.targetPort));
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
        onRenameComponent={renameComponent}
        onResizeFrame={resizeFrame}
        onSetComponentFrame={setComponentFrame}
        onSetFrameParent={setFrameParent}
        onHighlightFrame={setHighlightedFrameId}
        onUpdateTableHeader={updateTableHeader}
        onAddTableRow={addTableRow}
        onRemoveTableRow={removeTableRow}
        onRenameTableRow={renameTableRow}
        onCycleTableKey={cycleTableKey}
        onTextChange={updateText}
        autoFocusId={autoFocusId}
        onBeginDragHistory={beginDragHistory}
        onEndDragHistory={endDragHistory}
        isPanActive={isPanBlockActive}
      />

      {/* Connections overlay — rendered AFTER viewport so hit areas are above frames/components */}
      {(connections.length > 0 || connectionDragState.active) && (() => {
        const { scale, translateX, translateY } = transform;
        const toScreen = (pt: { x: number; y: number }) => ({
          x: pt.x * scale + translateX,
          y: pt.y * scale + translateY,
        });
        const toCanvas = (screenX: number, screenY: number) => ({
          x: (screenX - translateX) / scale,
          y: (screenY - translateY) / scale,
        });
        type EntityRect = { id: string; x: number; y: number; width: number; height: number };
        const entityMap = new Map<string, EntityRect>([
          ...placedComponents.map(c => [c.id, c] as [string, EntityRect]),
          ...frames.map(f => [f.id, f] as [string, EntityRect]),
        ]);

        return (
          <svg
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
            width="100%"
            height="100%"
          >
            {/* ── Pass 1: connection lines + cardinality glyphs (no labels) ── */}
            {connections.map((conn) => {
              const source = entityMap.get(conn.sourceId);
              const target = entityMap.get(conn.targetId);
              if (!source || !target) return null;
              const obstacles = placedComponents.filter(e => e.id !== conn.sourceId && e.id !== conn.targetId);
              const sourceComp = placedComponents.find(c => c.id === conn.sourceId);
              const targetComp = placedComponents.find(c => c.id === conn.targetId);
              const sourceWithTable = sourceComp ? sourceComp : source;
              const targetWithTable = targetComp ? targetComp : target;
              const points = getSmartRoutePoints(sourceWithTable, targetWithTable, conn.sourcePort, conn.targetPort, obstacles);
              const screenPoints = points.map(toScreen);
              const pathD = pointsToPath(screenPoints);
              const hitPoints = truncatePolyline(screenPoints, PORT_HIT_RADIUS * scale);
              const hitPathD = pointsToPath(hitPoints);
              const isConnSelected = conn.id === selectedConnectionId;
              const strokeColor = isConnSelected ? '#3b82f6' : '#6b7280';

              const cardinalityGlyphs: React.ReactNode[] = [];
              if (conn.cardinality && screenPoints.length >= 2) {
                const srcAnchor = screenPoints[0]!;
                const srcNext = screenPoints[1]!;
                const srcDx = srcNext.x - srcAnchor.x;
                const srcDy = srcNext.y - srcAnchor.y;
                const srcLen = Math.sqrt(srcDx * srcDx + srcDy * srcDy);
                if (srcLen > 0) {
                  const srcDir = { dx: srcDx / srcLen, dy: srcDy / srcLen };
                  getCardinalityGlyphPaths(conn.cardinality.source, srcAnchor, srcDir).forEach((d, i) => {
                    cardinalityGlyphs.push(
                      <path key={`src-${i}`} d={d} fill="none" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" style={{ pointerEvents: 'none' }} />
                    );
                  });
                }
                const tgtAnchor = screenPoints[screenPoints.length - 1]!;
                const tgtPrev = screenPoints[screenPoints.length - 2]!;
                const tgtDx = tgtPrev.x - tgtAnchor.x;
                const tgtDy = tgtPrev.y - tgtAnchor.y;
                const tgtLen = Math.sqrt(tgtDx * tgtDx + tgtDy * tgtDy);
                if (tgtLen > 0) {
                  const tgtDir = { dx: tgtDx / tgtLen, dy: tgtDy / tgtLen };
                  getCardinalityGlyphPaths(conn.cardinality.target, tgtAnchor, tgtDir).forEach((d, i) => {
                    cardinalityGlyphs.push(
                      <path key={`tgt-${i}`} d={d} fill="none" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" style={{ pointerEvents: 'none' }} />
                    );
                  });
                }
              }

              return (
                <g key={`path-${conn.id}`}>
                  <path
                    d={hitPathD}
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
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      selectConnection(conn.id);
                      setLabelEditingId(conn.id);
                    }}
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isConnSelected ? 3 : 2}
                    strokeLinecap="round"
                    style={{ pointerEvents: 'none' }}
                  />
                  {cardinalityGlyphs}
                </g>
              );
            })}
            {/* ── Pass 2: labels — rendered after all paths so they are always on top ── */}
            {connections.map((conn) => {
              if (!conn.label && labelEditingId !== conn.id) return null;
              const source = entityMap.get(conn.sourceId);
              const target = entityMap.get(conn.targetId);
              if (!source || !target) return null;
              const obstacles = placedComponents.filter(e => e.id !== conn.sourceId && e.id !== conn.targetId);
              const sourceComp = placedComponents.find(c => c.id === conn.sourceId);
              const targetComp = placedComponents.find(c => c.id === conn.targetId);
              const sourceWithTable = sourceComp ? sourceComp : source;
              const targetWithTable = targetComp ? targetComp : target;
              // Canvas-space route points (used for arc-length midpoint + projection)
              const canvasPoints = getSmartRoutePoints(sourceWithTable, targetWithTable, conn.sourcePort, conn.targetPort, obstacles);

              // Bug 1 fix: arc-length midpoint using labelT (or 0.5 default)
              const labelT = conn.labelT ?? 0.5;
              const canvasMid = polylineMidpoint(canvasPoints, labelT);
              const midPt = toScreen(canvasMid);

              const isEditingLabel = labelEditingId === conn.id;
              const isDraggingLabel = labelDraggingId === conn.id;
              const PILL_PX = 8;
              const PILL_PY = 4;
              const FONT_SIZE = 11;
              const labelCharWidth = (conn.label?.length ?? 0) * 7;
              const pillW = Math.max(labelCharWidth + PILL_PX * 2, 36);
              const pillH = FONT_SIZE + PILL_PY * 2;

              return (
                <g key={`label-${conn.id}`}>
                  {conn.label && !isEditingLabel && (
                    <g
                      style={{ pointerEvents: 'auto', cursor: isDraggingLabel ? 'grabbing' : 'grab' }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setLabelDraggingId(conn.id);
                        labelDragRef.current = { connId: conn.id, canvasPoints };
                        (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
                      }}
                      onPointerMove={(e) => {
                        if (!labelDragRef.current || labelDragRef.current.connId !== conn.id) return;
                        const rect = canvasRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        const canvasCursor = toCanvas(e.clientX - rect.left, e.clientY - rect.top);
                        const { t } = polylineProject(labelDragRef.current.canvasPoints, canvasCursor);
                        updateConnectionLabelT(conn.id, t);
                      }}
                      onPointerUp={(e) => {
                        if (labelDragRef.current?.connId === conn.id) {
                          (e.currentTarget as SVGGElement).releasePointerCapture(e.pointerId);
                          labelDragRef.current = null;
                          setLabelDraggingId(null);
                        }
                      }}
                    >
                      <rect
                        x={midPt.x - pillW / 2}
                        y={midPt.y - pillH / 2}
                        width={pillW}
                        height={pillH}
                        rx={4}
                        fill="#1e2028"
                        stroke={isDraggingLabel ? '#3b82f6' : '#374151'}
                        strokeWidth={1}
                      />
                      <text
                        x={midPt.x}
                        y={midPt.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={FONT_SIZE}
                        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
                        fill="#e5e7eb"
                        style={{ userSelect: 'none' }}
                      >
                        {conn.label}
                      </text>
                    </g>
                  )}
                  {isEditingLabel && (
                    <foreignObject
                      x={midPt.x - 100}
                      y={midPt.y - 14}
                      width={200}
                      height={28}
                      style={{ overflow: 'visible' }}
                    >
                      <input
                        // @ts-expect-error xmlns required for SVG foreignObject
                        xmlns="http://www.w3.org/1999/xhtml"
                        type="text"
                        autoFocus
                        defaultValue={conn.label ?? ''}
                        placeholder="Label…"
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateConnectionLabel(conn.id, (e.target as HTMLInputElement).value.trim());
                            setLabelEditingId(null);
                          } else if (e.key === 'Escape') {
                            setLabelEditingId(null);
                          }
                        }}
                        onBlur={(e) => {
                          updateConnectionLabel(conn.id, e.target.value.trim());
                          setLabelEditingId(null);
                        }}
                        style={{
                          width: '200px',
                          height: '28px',
                          background: '#1e2028',
                          color: '#e5e7eb',
                          border: '1px solid #3b82f6',
                          borderRadius: '4px',
                          outline: 'none',
                          padding: '0 8px',
                          fontSize: '11px',
                          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                        }}
                      />
                    </foreignObject>
                  )}
                </g>
              );
            })}

            {/* Temporary connection line during drag */}
            {connectionDragState.active && (() => {
              const src = entityMap.get(connectionDragState.sourceId);
              if (!src) return null;
              const cursorCanvas = { x: connectionDragState.cursorX, y: connectionDragState.cursorY };
              const targetRect = { x: cursorCanvas.x - 0.5, y: cursorCanvas.y - 0.5, width: 1, height: 1 };
              const tgtPort = oppositePort(connectionDragState.sourcePort);
              const obstacles = placedComponents.filter(e => e.id !== connectionDragState.sourceId);
              const pts = getSmartRoutePoints(src, targetRect, connectionDragState.sourcePort, tgtPort, obstacles);
              const pathD = pointsToPath(pts.map(toScreen));
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

      </div>{/* end export layer */}

      {/* Drop zone visual indicator */}
      <CanvasDropZone isDragOver={isDragOver} />

      {/* Zoom controls + shortcuts trigger */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 z-10">
        <Tooltip content="Keyboard shortcuts (?)">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setShowShortcuts(true)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 bg-panel-bg
              border border-panel-border hover:text-gray-200 hover:border-gray-600
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              transition-colors cursor-pointer"
            aria-label="Show keyboard shortcuts"
          >
            <CircleHelp size={14} />
          </button>
        </Tooltip>
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

      {/* Shape draw preview */}
      {shapeDrawRect && activeShape && (() => {
        const { scale, translateX, translateY } = transform;
        const sw = shapeDrawRect.width * scale;
        const sh = shapeDrawRect.height * scale;
        return (
          <div
            className="absolute pointer-events-none"
            style={{
              left: shapeDrawRect.x * scale + translateX,
              top: shapeDrawRect.y * scale + translateY,
              width: sw,
              height: sh,
              zIndex: 5,
            }}
          >
            <svg width={sw} height={sh} viewBox={`0 0 ${sw} ${sh}`} style={{ overflow: 'visible' }}>
              <ShapeGeometry
                kind={activeShape}
                width={sw}
                height={sh}
                fill="transparent"
                stroke="rgba(156,163,175,0.7)"
                strokeWidth={1.5}
              />
            </svg>
          </div>
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
      <CanvasToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onShapeSelect={setActiveShape}
        flowVisible={flowVisible}
        onFlowToggle={() => setFlowVisible(prev => !prev)}
        snapEnabled={snapEnabled}
        onSnapToggle={onSnapToggle}
        selectedCount={selectedIds.length}
        onAlign={onAlign}
      />

      {/* Empty state hint */}
      {placedComponents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-gray-600 text-sm font-mono select-none">
            Drag components from the panel to get started
          </p>
        </div>
      )}

      {/* Keyboard shortcuts overlay */}
      <ShortcutsOverlay open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </main>
  );
}
