'use client';

import { useReducer, useCallback } from 'react';
import type {
  CanvasState,
  CanvasAction,
  PaletteItemKind,
  PortSide,
  Connection,
} from '@/lib/types';

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
        selectedId: newComponent.id,
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case 'MOVE': {
      return {
        ...state,
        placedComponents: state.placedComponents.map((c) =>
          c.id === action.id ? { ...c, x: action.x, y: action.y } : c
        ),
      };
    }
    case 'REMOVE': {
      return {
        ...state,
        placedComponents: state.placedComponents.filter((c) => c.id !== action.id),
        connections: state.connections.filter(
          (conn) => conn.sourceId !== action.id && conn.targetId !== action.id
        ),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    }
    case 'SELECT': {
      return { ...state, selectedId: action.id, selectedConnectionId: null };
    }
    case 'SELECT_CONNECTION': {
      return { ...state, selectedConnectionId: action.id, selectedId: null };
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
    default:
      return state;
  }
}

const initialState: CanvasState = {
  placedComponents: [],
  connections: [],
  selectedId: null,
  selectedConnectionId: null,
  nextZIndex: 1,
};

export function usePlacedComponents() {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  const addComponent = useCallback(
    (kind: PaletteItemKind, x: number, y: number, width: number, height: number) => {
      dispatch({ type: 'ADD', payload: { kind, x, y, width, height } });
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
      // Prevent self-connections
      if (sourceId === targetId) return;
      // Prevent duplicate connections on the same port pair
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

  return {
    placedComponents: state.placedComponents,
    connections: state.connections,
    selectedId: state.selectedId,
    selectedConnectionId: state.selectedConnectionId,
    addComponent,
    moveComponent,
    removeComponent,
    selectComponent,
    resizeComponent,
    addConnection,
    removeConnection,
    selectConnection,
  };
}
