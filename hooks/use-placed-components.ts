'use client';

import { useReducer, useCallback } from 'react';
import type {
  CanvasState,
  CanvasAction,
  PaletteItemKind,
  PortSide,
  Connection,
  Frame,
} from '@/lib/types';
import { getFrameBounds } from '@/lib/frame-utils';
import { FRAME_DEFAULT_LABEL } from '@/lib/constants';

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
      const newConnection: Connection = {
        ...action.payload,
        id: crypto.randomUUID(),
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
    case 'SET_COMPONENT_FRAME': {
      const updated = state.placedComponents.map((c) =>
        c.id === action.componentId ? { ...c, frameId: action.frameId ?? undefined } : c
      );
      return { ...state, placedComponents: updated };
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
      dispatch({ type: 'ADD', payload: { kind, x, y, width, height, frameId } });
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
      const exists = state.connections.some(
        (c) =>
          c.sourceId === sourceId &&
          c.sourcePort === sourcePort &&
          c.targetId === targetId &&
          c.targetPort === targetPort
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

  const resizeFrame = useCallback((id: string, width: number, height: number, x: number, y: number) => {
    dispatch({ type: 'RESIZE_FRAME', id, width, height, x, y });
  }, []);

  const setComponentFrame = useCallback((componentId: string, frameId: string | null) => {
    dispatch({ type: 'SET_COMPONENT_FRAME', componentId, frameId });
  }, []);

  return {
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
    resizeFrame,
    setComponentFrame,
  };
}
