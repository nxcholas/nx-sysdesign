'use client';

import { useReducer, useCallback } from 'react';
import type {
  CanvasState,
  CanvasAction,
  PaletteItemKind,
  PortSide,
  Connection,
  Frame,
  DiagramSchema,
  Cardinality,
} from '@/lib/types';
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
      return { ...state, selectedIds: action.ids, selectedConnectionId: null, selectedFrameId: null };
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
      return {
        ...state,
        frames: state.frames.map((f) =>
          f.id === action.id ? { ...f, x: action.x, y: action.y } : f
        ),
        placedComponents: state.placedComponents.map((c) =>
          c.frameId === action.id ? { ...c, x: c.x + dx, y: c.y + dy } : c
        ),
      };
    }
    case 'REMOVE_FRAME': {
      return {
        ...state,
        frames: state.frames.filter((f) => f.id !== action.id),
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
    case 'SET_COMPONENT_FRAME': {
      const updated = state.placedComponents.map((c) =>
        c.id === action.componentId ? { ...c, frameId: action.frameId ?? undefined } : c
      );
      return { ...state, placedComponents: updated };
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

export function usePlacedComponents() {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  const addComponent = useCallback(
    (kind: PaletteItemKind, x: number, y: number, width: number, height: number, frameId?: string) => {
      const tableData =
        kind.type === 'block' && kind.kind === 'entity-relation-table'
          ? createDefaultTableData()
          : undefined;
      dispatch({ type: 'ADD', payload: { kind, x, y, width, height, frameId, tableData } });
    },
    []
  );

  const moveComponent = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE', id, x, y });
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

  const selectMany = useCallback((ids: string[]) => {
    dispatch({ type: 'SELECT_MANY', ids });
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

  const loadDiagram = useCallback(
    (schema: Pick<DiagramSchema, 'components' | 'connections' | 'frames'>) => {
      dispatch({ type: 'LOAD_DIAGRAM', payload: schema });
    },
    []
  );

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
    loadDiagram,
    updateTableHeader,
    addTableRow: addTableRowAction,
    removeTableRow: removeTableRowAction,
    renameTableRow: renameTableRowAction,
    cycleTableKey: cycleTableKeyAction,
    updateConnectionCardinality,
  };
}
