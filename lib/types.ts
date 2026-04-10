// --- HTTP Types ---

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type StatusCodeGroup = '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

export type StatusCode = {
  code: number;
  label: string;
  group: StatusCodeGroup;
};

// --- System Block Types ---

export type BlockKind = 'user' | 'web-server' | 'database';

/** Classification of a component in system design terms. */
export type ComponentRole = 'entity' | 'process';

// --- Palette / Drag Types ---

export type PaletteItemKind =
  | { type: 'http-method'; method: HttpMethod }
  | { type: 'status-code'; group: StatusCodeGroup; code?: number; label?: string }
  | { type: 'block'; kind: BlockKind };

export type DragPayload = PaletteItemKind;

export interface PaletteItem {
  id: string;
  label: string;
  dragPayload: DragPayload;
}

export interface PaletteSection {
  id: string;
  label: string;
  items: PaletteItem[];
}

// --- Canvas Types ---

export interface CanvasTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

// --- Placed Component Types ---

export interface PlacedComponent {
  id: string;
  kind: PaletteItemKind;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  zIndex: number;
}

// --- Connection Types ---

export type PortSide = 'top' | 'right' | 'bottom' | 'left';

export interface Connection {
  id: string;
  sourceId: string;
  sourcePort: PortSide;
  targetId: string;
  targetPort: PortSide;
}

// --- Canvas Reducer ---

export type CanvasAction =
  | { type: 'ADD'; payload: Omit<PlacedComponent, 'id' | 'zIndex'> }
  | { type: 'MOVE'; id: string; x: number; y: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'SELECT'; id: string | null }
  | { type: 'SELECT_CONNECTION'; id: string | null }
  | { type: 'RESIZE'; id: string; width: number; height: number }
  | { type: 'ADD_CONNECTION'; payload: Omit<Connection, 'id'> }
  | { type: 'REMOVE_CONNECTION'; id: string };

export interface CanvasState {
  placedComponents: PlacedComponent[];
  connections: Connection[];
  selectedId: string | null;
  selectedConnectionId: string | null;
  nextZIndex: number;
}
