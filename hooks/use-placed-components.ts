'use client';

import { useReducer, useCallback, useRef } from 'react';
import type {
  CanvasState,
  CanvasAction,
  PaletteItemKind,
  PortSide,
  Connection,
  Frame,
  DiagramSchema,
  Cardinality,
  TextStyle,
  ShapeStyle,
  ShapeKind,
  AlignmentDirection,
} from '@/lib/types';
import { computeAlignedPositions } from '@/lib/canvas-utils';
import { isRowPort } from '@/lib/connection-utils';
import { getFrameBounds } from '@/lib/frame-utils';
import { FRAME_DEFAULT_LABEL } from '@/lib/constants';
import {
  addRow as addTableRow,
  removeRow as removeTableRow,
  renameRow as renameTableRow,
  cycleKeyType as cycleTableKey,
  createDefaultTableData,
} from '@/lib/entity-relation';
import type { EntityRelationRow, CardinalityEnd } from '@/lib/types';

function migrateCardinalityEnd(end: any): CardinalityEnd {
  if (end?.symbol) return end as CardinalityEnd;
  // Legacy { min, max } → symbol
  const m = end?.min;
  const x = end?.max;
  if (m === 1 && x === 1) return { symbol: 'one-and-only-one' };
  if (m === 0 && x === 1) return { symbol: 'zero-or-one' };
  if (m === 1 && x === 'many') return { symbol: 'one-or-many' };
  if (m === 0 && x === 'many') return { symbol: 'zero-or-many' };
  return { symbol: 'one-and-only-one' };
}

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'ADD': {
      const newComponent = {
        ...action.payload,
        id: crypto.randomUUID(),
        zIndex: state.nextZIndex,
      };
      return {
        ...state,
        placedComponents: [...state.placedComponents, newComponent],
        selectedIds: [newComponent.id],
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case 'MOVE': {
      const updated = state.placedComponents.map((c) =>
        c.id === action.id ? { ...c, x: action.x, y: action.y } : c
      );
      return { ...state, placedComponents: updated };
    }
    case 'MOVE_MANY': {
      const moveMap = new Map(action.moves.map((m) => [m.id, m]));
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) => {
          const m = moveMap.get(c.id);
          return m ? { ...c, x: m.x, y: m.y } : c;
        }),
      };
    }
    case 'REMOVE': {
      const remaining = state.placedComponents.filter((c) => c.id !== action.id);
      return {
        ...state,
        placedComponents: remaining,
        connections: state.connections.filter(
          (conn) => conn.sourceId !== action.id && conn.targetId !== action.id
        ),
        selectedIds: state.selectedIds.filter((id) => id !== action.id),
      };
    }
    case 'REMOVE_MANY': {
      const idsToRemove = new Set(action.ids);
      return {
        ...state,
        placedComponents: state.placedComponents.filter((c) => !idsToRemove.has(c.id)),
        connections: state.connections.filter(
          (conn) => !idsToRemove.has(conn.sourceId) && !idsToRemove.has(conn.targetId)
        ),
        selectedIds: [],
      };
    }
    case 'SELECT': {
      return { ...state, selectedIds: action.id ? [action.id] : [], selectedConnectionId: null, selectedFrameId: null };
    }
    case 'SELECT_MANY': {
      return {
        ...state,
        selectedIds: action.ids,
        selectedConnectionId: null,
        selectedFrameId: action.frameId !== undefined ? (action.frameId ?? null) : null,
      };
    }
    case 'SELECT_CONNECTION': {
      return { ...state, selectedConnectionId: action.id, selectedIds: [], selectedFrameId: null };
    }
    case 'RESIZE': {
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) =>
          c.id === action.id ? { ...c, width: action.width, height: action.height } : c
        ),
      };
    }
    case 'ADD_CONNECTION': {
      const { sourceId, targetId, sourcePort, targetPort } = action.payload;
      const sourceComp = state.placedComponents.find((c) => c.id === sourceId);
      const targetComp = state.placedComponents.find((c) => c.id === targetId);
      const isERRowConnection =
        isRowPort(sourcePort) &&
        isRowPort(targetPort) &&
        sourceComp?.tableData !== undefined &&
        targetComp?.tableData !== undefined;
      const defaultCardinality: Cardinality | undefined = isERRowConnection
        ? { source: { symbol: 'one-and-only-one' }, target: { symbol: 'one-or-many' } }
        : undefined;
      const newConnection: Connection = {
        ...action.payload,
        id: crypto.randomUUID(),
        ...(defaultCardinality ? { cardinality: defaultCardinality } : {}),
      };
      return {
        ...state,
        connections: [...state.connections, newConnection],
      };
    }
    case 'REMOVE_CONNECTION': {
      return {
        ...state,
        connections: state.connections.filter((c) => c.id !== action.id),
        selectedConnectionId: state.selectedConnectionId === action.id ? null : state.selectedConnectionId,
      };
    }
    case 'ADD_FRAME': {
      const childIds = action.childIds ?? [];
      const children = state.placedComponents.filter((c) => childIds.includes(c.id));
      const newFrame: Frame = {
        ...action.payload,
        id: crypto.randomUUID(),
        zIndex: state.nextZIndex,
        label: action.payload.label || FRAME_DEFAULT_LABEL,
        ...(children.length > 0 ? getFrameBounds(children) : {}),
      };
      const updatedComponents = state.placedComponents.map((c) =>
        childIds.includes(c.id) ? { ...c, frameId: newFrame.id } : c
      );
      return {
        ...state,
        frames: [...state.frames, newFrame],
        placedComponents: updatedComponents,
        selectedFrameId: newFrame.id,
        selectedIds: [],
        selectedConnectionId: null,
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case 'MOVE_FRAME': {
      const frame = state.frames.find((f) => f.id === action.id);
      if (!frame) return state;
      const dx = action.x - frame.x;
      const dy = action.y - frame.y;
      // Collect all descendant frame IDs (frames nested inside this frame, recursively)
      const getDescendantIds = (parentId: string): string[] => {
        const children = state.frames.filter((f) => f.parentFrameId === parentId).map((f) => f.id);
        return children.flatMap((cid) => [cid, ...getDescendantIds(cid)]);
      };
      const descendantIds = new Set(getDescendantIds(action.id));
      return {
        ...state,
        frames: state.frames.map((f) => {
          if (f.id === action.id) return { ...f, x: action.x, y: action.y };
          if (descendantIds.has(f.id)) return { ...f, x: f.x + dx, y: f.y + dy };
          return f;
        }),
        placedComponents: state.placedComponents.map((c) =>
          c.frameId === action.id || (c.frameId && descendantIds.has(c.frameId))
            ? { ...c, x: c.x + dx, y: c.y + dy }
            : c
        ),
      };
    }
    case 'REMOVE_FRAME': {
      return {
        ...state,
        frames: state.frames
          .filter((f) => f.id !== action.id)
          .map((f) => f.parentFrameId === action.id ? { ...f, parentFrameId: undefined } : f),
        placedComponents: state.placedComponents.map((c) =>
          c.frameId === action.id ? { ...c, frameId: undefined } : c
        ),
        connections: state.connections.filter(
          (conn) => conn.sourceId !== action.id && conn.targetId !== action.id
        ),
        selectedFrameId: state.selectedFrameId === action.id ? null : state.selectedFrameId,
      };
    }
    case 'SELECT_FRAME': {
      return { ...state, selectedFrameId: action.id, selectedIds: [], selectedConnectionId: null };
    }
    case 'RENAME_FRAME': {
      return {
        ...state,
        frames: state.frames.map((f) =>
          f.id === action.id ? { ...f, label: action.label } : f
        ),
      };
    }
    case 'RENAME_COMPONENT': {
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) =>
          c.id === action.id ? { ...c, label: action.label } : c
        ),
      };
    }
    case 'RESIZE_FRAME': {
      return {
        ...state,
        frames: state.frames.map((f) =>
          f.id === action.id
            ? { ...f, x: action.x, y: action.y, width: action.width, height: action.height }
            : f
        ),
      };
    }
    case 'UPDATE_TABLE_HEADER': {
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) =>
          c.id === action.id && c.tableData
            ? { ...c, tableData: { ...c.tableData, header: action.header } }
            : c
        ),
      };
    }
    case 'ADD_TABLE_ROW': {
      // header=34px, each row=28px, add-button=28px
      const TABLE_ROW_H = 28;
      const TABLE_FIXED_H = 62; // header(34) + add-button(28)
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) => {
          if (!(c.id === action.id && c.tableData)) return c;
          const newRows = addTableRow(c.tableData.rows, action.rowId, action.name ?? '');
          const newHeight = newRows.length * TABLE_ROW_H + TABLE_FIXED_H;
          return {
            ...c,
            height: Math.max(c.height, newHeight),
            tableData: { ...c.tableData, rows: newRows },
          };
        }),
      };
    }
    case 'REMOVE_TABLE_ROW': {
      const updatedComponents = state.placedComponents.map((c) =>
        c.id === action.id && c.tableData
          ? {
              ...c,
              tableData: {
                ...c.tableData,
                rows: removeTableRow(c.tableData.rows, action.rowId),
              },
            }
          : c
      );
      const filteredConnections = state.connections.filter((conn) => {
        const srcRowPort = isRowPort(conn.sourcePort) && conn.sourceId === action.id && conn.sourcePort.rowId === action.rowId;
        const tgtRowPort = isRowPort(conn.targetPort) && conn.targetId === action.id && conn.targetPort.rowId === action.rowId;
        return !srcRowPort && !tgtRowPort;
      });
      return {
        ...state,
        placedComponents: updatedComponents,
        connections: filteredConnections,
      };
    }
    case 'RENAME_TABLE_ROW': {
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) =>
          c.id === action.id && c.tableData
            ? {
                ...c,
                tableData: {
                  ...c.tableData,
                  rows: renameTableRow(c.tableData.rows, action.rowId, action.name),
                },
              }
            : c
        ),
      };
    }
    case 'CYCLE_TABLE_KEY': {
      const updatedComponentsForKey = state.placedComponents.map((c) =>
        c.id === action.id && c.tableData
          ? {
              ...c,
              tableData: {
                ...c.tableData,
                rows: cycleTableKey(c.tableData.rows, action.rowId),
              },
            }
          : c
      );
      // Cascade-delete connections if the row's new keyType is 'none'
      const updatedComp = updatedComponentsForKey.find((c) => c.id === action.id);
      const newKeyType = updatedComp?.tableData?.rows.find((r) => r.id === action.rowId)?.keyType;
      let filteredConnectionsForKey = state.connections;
      if (newKeyType === 'none') {
        filteredConnectionsForKey = state.connections.filter((conn) => {
          const srcRowPort = isRowPort(conn.sourcePort) && conn.sourceId === action.id && conn.sourcePort.rowId === action.rowId;
          const tgtRowPort = isRowPort(conn.targetPort) && conn.targetId === action.id && conn.targetPort.rowId === action.rowId;
          return !srcRowPort && !tgtRowPort;
        });
      }
      return {
        ...state,
        placedComponents: updatedComponentsForKey,
        connections: filteredConnectionsForKey,
      };
    }
    case 'UPDATE_CONNECTION_CARDINALITY': {
      return {
        ...state,
        connections: state.connections.map((c) =>
          c.id === action.id ? { ...c, cardinality: action.cardinality } : c
        ),
      };
    }
    case 'UPDATE_CONNECTION_LABEL': {
      return {
        ...state,
        connections: state.connections.map((c) =>
          c.id === action.id ? { ...c, label: action.label || undefined } : c
        ),
      };
    }
    case 'UPDATE_CONNECTION_LABEL_T': {
      return {
        ...state,
        connections: state.connections.map((c) =>
          c.id === action.id ? { ...c, labelT: action.labelT } : c
        ),
      };
    }
    case 'UPDATE_TEXT': {
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) =>
          c.id === action.id ? { ...c, text: action.text } : c
        ),
      };
    }
    case 'UPDATE_TEXT_STYLE': {
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) =>
          c.id === action.id ? { ...c, textStyle: { ...c.textStyle, ...action.style } as TextStyle } : c
        ),
      };
    }
    case 'UPDATE_SHAPE_STYLE': {
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) =>
          c.id === action.id && c.kind.type === 'shape'
            ? { ...c, shapeStyle: { ...c.shapeStyle, ...action.style } as ShapeStyle }
            : c
        ),
      };
    }
    case 'UPDATE_SHAPE_KIND': {
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) =>
          c.id === action.id && c.kind.type === 'shape'
            ? { ...c, kind: { type: 'shape', shape: action.shape } }
            : c
        ),
      };
    }
    case 'SET_COMPONENT_FRAME': {
      const updated = state.placedComponents.map((c) =>
        c.id === action.componentId ? { ...c, frameId: action.frameId ?? undefined } : c
      );
      return { ...state, placedComponents: updated };
    }
    case 'SET_FRAME_PARENT': {
      const updatedFrames = state.frames.map((f) =>
        f.id === action.frameId
          ? { ...f, parentFrameId: action.parentFrameId ?? undefined }
          : f
      );
      // Recompute zIndex for all frames based on nesting depth
      const reindexed = updatedFrames.map((f) => {
        let depth = 0;
        let cur: Frame | undefined = f;
        while (cur?.parentFrameId) {
          cur = updatedFrames.find((x) => x.id === cur!.parentFrameId);
          depth++;
        }
        return { ...f, zIndex: depth };
      });
      return { ...state, frames: reindexed };
    }
    case 'LOAD_DIAGRAM': {
      const allZIndexes = [
        ...action.payload.components.map((c) => c.zIndex),
        ...action.payload.frames.map((f) => f.zIndex),
      ];
      // Normalize legacy rows that used isPrimaryKey boolean instead of keyType
      const normalizeRow = (r: any): EntityRelationRow => ({
        id: typeof r.id === 'string' && r.id ? r.id : crypto.randomUUID(),
        name: typeof r.name === 'string' ? r.name : '',
        keyType: r.keyType === 'PK' || r.keyType === 'FK' ? r.keyType : (r.isPrimaryKey ? 'PK' : 'none'),
      });
      const normalizedComponents = action.payload.components.map((c) =>
        c.tableData
          ? { ...c, tableData: { ...c.tableData, rows: c.tableData.rows.map(normalizeRow) } }
          : c
      );
      const normalizedConnections = action.payload.connections.map((conn) =>
        conn.cardinality
          ? {
              ...conn,
              cardinality: {
                source: migrateCardinalityEnd(conn.cardinality.source),
                target: migrateCardinalityEnd(conn.cardinality.target),
              },
            }
          : conn
      );
      return {
        ...initialState,
        placedComponents: normalizedComponents,
        connections: normalizedConnections,
        frames: action.payload.frames,
        nextZIndex: allZIndexes.length === 0 ? 1 : Math.max(...allZIndexes) + 1,
      };
    }
    case 'PASTE': {
      const baseZ = state.nextZIndex;
      const compsWithZ = action.components.map((c, i) => ({ ...c, zIndex: baseZ + i }));
      const newFrameCount = action.frames.length;
      const pastedFrames = action.frames.map((f, i) => ({ ...f, zIndex: baseZ + action.components.length + i }));
      return {
        ...state,
        placedComponents: [...state.placedComponents, ...compsWithZ],
        connections: [...state.connections, ...action.connections],
        frames: [...state.frames, ...pastedFrames],
        selectedIds: compsWithZ.map((c) => c.id),
        selectedConnectionId: null,
        selectedFrameId: pastedFrames.length === 1 ? (pastedFrames[0]?.id ?? null) : null,
        nextZIndex: baseZ + action.components.length + newFrameCount,
      };
    }
    case 'ALIGN_COMPONENTS': {
      const positions = computeAlignedPositions(state.placedComponents, action.ids, action.direction);
      if (Object.keys(positions).length === 0) return state;
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) =>
          positions[c.id] ? { ...c, ...positions[c.id] } : c
        ),
      };
    }
    case 'RESTORE_STATE':
      return action.state;
    default:
      return state;
  }
}

const initialState: CanvasState = {
  placedComponents: [],
  connections: [],
  selectedIds: [],
  selectedConnectionId: null,
  nextZIndex: 1,
  frames: [],
  selectedFrameId: null,
};

const MUTATION_ACTIONS = new Set([
  'ADD', 'MOVE', 'MOVE_MANY', 'REMOVE', 'REMOVE_MANY', 'RESIZE', 'ALIGN_COMPONENTS',
  'ADD_CONNECTION', 'REMOVE_CONNECTION',
  'ADD_FRAME', 'MOVE_FRAME', 'REMOVE_FRAME', 'RENAME_FRAME', 'RENAME_COMPONENT',
  'RESIZE_FRAME', 'SET_COMPONENT_FRAME', 'SET_FRAME_PARENT',
  'UPDATE_TABLE_HEADER', 'ADD_TABLE_ROW', 'REMOVE_TABLE_ROW',
  'RENAME_TABLE_ROW', 'CYCLE_TABLE_KEY',
  'UPDATE_CONNECTION_CARDINALITY', 'UPDATE_CONNECTION_LABEL', 'UPDATE_CONNECTION_LABEL_T',
  'UPDATE_TEXT', 'UPDATE_TEXT_STYLE',
  'UPDATE_SHAPE_STYLE', 'UPDATE_SHAPE_KIND', 'PASTE',
]);

export function usePlacedComponents() {
  const [state, rawDispatch] = useReducer(canvasReducer, initialState);
  const historyRef = useRef<CanvasState[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  const skipHistoryRef = useRef(false);

  const dispatch = useCallback((action: CanvasAction) => {
    if (!skipHistoryRef.current && MUTATION_ACTIONS.has(action.type)) {
      historyRef.current = [...historyRef.current.slice(-49), stateRef.current];
    }
    rawDispatch(action);
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current[historyRef.current.length - 1]!;
    historyRef.current = historyRef.current.slice(0, -1);
    rawDispatch({ type: 'RESTORE_STATE', state: prev });
  }, []);

  const beginDragHistory = useCallback(() => {
    historyRef.current = [...historyRef.current.slice(-49), stateRef.current];
    skipHistoryRef.current = true;
  }, []);

  const endDragHistory = useCallback(() => {
    skipHistoryRef.current = false;
  }, []);

  const addComponent = useCallback(
    (
      kind: PaletteItemKind,
      x: number,
      y: number,
      width: number,
      height: number,
      frameId?: string,
      extras?: Partial<Pick<import('@/lib/types').PlacedComponent, 'text' | 'textStyle' | 'shapeStyle'>>,
    ) => {
      const tableData =
        kind.type === 'block' && kind.kind === 'entity-relation-table'
          ? createDefaultTableData()
          : undefined;
      dispatch({ type: 'ADD', payload: { kind, x, y, width, height, frameId, tableData, ...extras } });
    },
    []
  );

  const moveComponent = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE', id, x, y });
  }, []);

  const moveMany = useCallback((moves: { id: string; x: number; y: number }[]) => {
    dispatch({ type: 'MOVE_MANY', moves });
  }, []);

  const removeComponent = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const selectComponent = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT', id });
  }, []);

  const resizeComponent = useCallback((id: string, width: number, height: number) => {
    dispatch({ type: 'RESIZE', id, width, height });
  }, []);

  const addConnection = useCallback(
    (sourceId: string, sourcePort: PortSide, targetId: string, targetPort: PortSide) => {
      if (sourceId === targetId) return;
      // Block same-row self-connections (left grip → right grip on the same row)
      if (
        isRowPort(sourcePort) &&
        isRowPort(targetPort) &&
        sourcePort.rowId === targetPort.rowId
      ) return;
      const portEqual = (a: PortSide, b: PortSide): boolean => {
        if (typeof a === 'string' && typeof b === 'string') return a === b;
        if (typeof a === 'object' && typeof b === 'object') {
          return a.kind === b.kind && a.rowId === b.rowId && a.side === b.side;
        }
        return false;
      };
      const exists = state.connections.some(
        (c) =>
          c.sourceId === sourceId &&
          portEqual(c.sourcePort, sourcePort) &&
          c.targetId === targetId &&
          portEqual(c.targetPort, targetPort)
      );
      if (exists) return;
      dispatch({ type: 'ADD_CONNECTION', payload: { sourceId, sourcePort, targetId, targetPort } });
    },
    [state.connections]
  );

  const removeConnection = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CONNECTION', id });
  }, []);

  const selectConnection = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_CONNECTION', id });
  }, []);

  const selectMany = useCallback((ids: string[], frameId?: string | null) => {
    dispatch({ type: 'SELECT_MANY', ids, frameId });
  }, []);

  const removeMany = useCallback((ids: string[]) => {
    dispatch({ type: 'REMOVE_MANY', ids });
  }, []);

  const addFrame = useCallback(
    (payload: Omit<Frame, 'id' | 'zIndex'>, childIds?: string[]) => {
      dispatch({ type: 'ADD_FRAME', payload, childIds });
    },
    []
  );

  const moveFrame = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_FRAME', id, x, y });
  }, []);

  const removeFrame = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FRAME', id });
  }, []);

  const selectFrame = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_FRAME', id });
  }, []);

  const renameFrame = useCallback((id: string, label: string) => {
    dispatch({ type: 'RENAME_FRAME', id, label });
  }, []);

  const renameComponent = useCallback((id: string, label: string) => {
    dispatch({ type: 'RENAME_COMPONENT', id, label });
  }, []);

  const resizeFrame = useCallback((id: string, width: number, height: number, x: number, y: number) => {
    dispatch({ type: 'RESIZE_FRAME', id, width, height, x, y });
  }, []);

  const setComponentFrame = useCallback((componentId: string, frameId: string | null) => {
    dispatch({ type: 'SET_COMPONENT_FRAME', componentId, frameId });
  }, []);

  const setFrameParent = useCallback((frameId: string, parentFrameId: string | null) => {
    dispatch({ type: 'SET_FRAME_PARENT', frameId, parentFrameId });
  }, []);

  const updateTableHeader = useCallback((id: string, header: string) => {
    dispatch({ type: 'UPDATE_TABLE_HEADER', id, header });
  }, []);

  const addTableRowAction = useCallback(
    (id: string, rowId?: string, name?: string) => {
      dispatch({ type: 'ADD_TABLE_ROW', id, rowId, name });
    },
    []
  );

  const removeTableRowAction = useCallback((id: string, rowId: string) => {
    dispatch({ type: 'REMOVE_TABLE_ROW', id, rowId });
  }, []);

  const renameTableRowAction = useCallback((id: string, rowId: string, name: string) => {
    dispatch({ type: 'RENAME_TABLE_ROW', id, rowId, name });
  }, []);

  const cycleTableKeyAction = useCallback((id: string, rowId: string) => {
    dispatch({ type: 'CYCLE_TABLE_KEY', id, rowId });
  }, []);

  const updateConnectionCardinality = useCallback((id: string, cardinality: Cardinality) => {
    dispatch({ type: 'UPDATE_CONNECTION_CARDINALITY', id, cardinality });
  }, []);

  const updateConnectionLabel = useCallback((id: string, label: string) => {
    dispatch({ type: 'UPDATE_CONNECTION_LABEL', id, label });
  }, []);

  const updateConnectionLabelT = useCallback((id: string, labelT: number) => {
    dispatch({ type: 'UPDATE_CONNECTION_LABEL_T', id, labelT });
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    dispatch({ type: 'UPDATE_TEXT', id, text });
  }, []);

  const updateTextStyle = useCallback((id: string, style: Partial<TextStyle>) => {
    dispatch({ type: 'UPDATE_TEXT_STYLE', id, style });
  }, []);

  const updateShapeStyle = useCallback((id: string, style: Partial<ShapeStyle>) => {
    dispatch({ type: 'UPDATE_SHAPE_STYLE', id, style });
  }, []);

  const updateShapeKind = useCallback((id: string, shape: ShapeKind) => {
    dispatch({ type: 'UPDATE_SHAPE_KIND', id, shape });
  }, []);

  const loadDiagram = useCallback(
    (schema: Pick<DiagramSchema, 'components' | 'connections' | 'frames'>) => {
      dispatch({ type: 'LOAD_DIAGRAM', payload: schema });
    },
    []
  );

  const pasteComponents = useCallback(
    (components: import('@/lib/types').PlacedComponent[], connections: import('@/lib/types').Connection[], frames: import('@/lib/types').Frame[] = []) => {
      dispatch({ type: 'PASTE', components, connections, frames });
    },
    []
  );

  const alignComponents = useCallback((ids: string[], direction: AlignmentDirection) => {
    dispatch({ type: 'ALIGN_COMPONENTS', ids, direction });
  }, []);

  return {
    state,
    placedComponents: state.placedComponents,
    connections: state.connections,
    selectedIds: state.selectedIds,
    selectedConnectionId: state.selectedConnectionId,
    frames: state.frames,
    selectedFrameId: state.selectedFrameId,
    addComponent,
    moveComponent,
    moveMany,
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
    loadDiagram,
    updateTableHeader,
    addTableRow: addTableRowAction,
    removeTableRow: removeTableRowAction,
    renameTableRow: renameTableRowAction,
    cycleTableKey: cycleTableKeyAction,
    updateConnectionCardinality,
    updateConnectionLabel,
    updateConnectionLabelT,
    updateText,
    updateTextStyle,
    updateShapeStyle,
    updateShapeKind,
    undo,
    pasteComponents,
    alignComponents,
    beginDragHistory,
    endDragHistory,
  };
}
