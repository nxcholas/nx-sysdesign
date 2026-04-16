// --- HTTP Types ---

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type StatusCodeGroup = '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

export type StatusCode = {
  code: number;
  label: string;
  group: StatusCodeGroup;
};

// --- System Block Types ---

export type BlockKind = string;

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
  defaultOpen?: boolean;
  items: PaletteItem[];
}

// --- Canvas Tool Types ---

export type CanvasTool = 'select' | 'pan' | 'frame';

export interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// --- Canvas Types ---

export interface CanvasTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

// --- Frame Types ---

export interface Frame {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

// --- Placed Component Types ---

export type RowKeyType = 'PK' | 'FK' | 'none';

export interface EntityRelationRow {
  id: string;
  name: string;
  keyType: RowKeyType;
}

export interface EntityRelationData {
  header: string;
  rows: EntityRelationRow[];
}

export interface PlacedComponent {
  id: string;
  kind: PaletteItemKind;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  zIndex: number;
  frameId?: string;
  /** Only populated when kind is a block with kind 'entity-relation-table'. */
  tableData?: EntityRelationData;
}

// --- Connection Types ---

export type EdgePortSide = 'top' | 'right' | 'bottom' | 'left';

export type RowPortSide = {
  kind: 'row';
  rowId: string;
  side: 'left' | 'right';
};

export type PortSide = EdgePortSide | RowPortSide;

export type CardinalitySymbol =
  | 'none'
  | 'one'
  | 'many'
  | 'one-and-only-one'
  | 'zero-or-one'
  | 'one-or-many'
  | 'zero-or-many';

export type CardinalityEnd = {
  symbol: CardinalitySymbol;
};

export type Cardinality = {
  source: CardinalityEnd;
  target: CardinalityEnd;
};

export interface Connection {
  id: string;
  sourceId: string;
  sourcePort: PortSide;
  targetId: string;
  targetPort: PortSide;
  cardinality?: Cardinality;
}

// --- Canvas Reducer ---

export type CanvasAction =
  | { type: 'ADD'; payload: Omit<PlacedComponent, 'id' | 'zIndex'> }
  | { type: 'MOVE'; id: string; x: number; y: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'SELECT'; id: string | null }
  | { type: 'SELECT_MANY'; ids: string[] }
  | { type: 'SELECT_CONNECTION'; id: string | null }
  | { type: 'RESIZE'; id: string; width: number; height: number }
  | { type: 'ADD_CONNECTION'; payload: Omit<Connection, 'id'> }
  | { type: 'REMOVE_CONNECTION'; id: string }
  | { type: 'REMOVE_MANY'; ids: string[] }
  | { type: 'ADD_FRAME'; payload: Omit<Frame, 'id' | 'zIndex'>; childIds?: string[] }
  | { type: 'MOVE_FRAME'; id: string; x: number; y: number }
  | { type: 'REMOVE_FRAME'; id: string }
  | { type: 'SELECT_FRAME'; id: string | null }
  | { type: 'RENAME_FRAME'; id: string; label: string }
  | { type: 'RENAME_COMPONENT'; id: string; label: string }
  | { type: 'RESIZE_FRAME'; id: string; width: number; height: number; x: number; y: number }
  | { type: 'SET_COMPONENT_FRAME'; componentId: string; frameId: string | null }
  | { type: 'UPDATE_TABLE_HEADER'; id: string; header: string }
  | { type: 'ADD_TABLE_ROW'; id: string; rowId?: string; name?: string; focus?: boolean }
  | { type: 'REMOVE_TABLE_ROW'; id: string; rowId: string }
  | { type: 'RENAME_TABLE_ROW'; id: string; rowId: string; name: string }
  | { type: 'CYCLE_TABLE_KEY'; id: string; rowId: string }
  | { type: 'UPDATE_CONNECTION_CARDINALITY'; id: string; cardinality: Cardinality }
  | { type: 'LOAD_DIAGRAM'; payload: Pick<DiagramSchema, 'components' | 'connections' | 'frames'> };

export interface CanvasState {
  placedComponents: PlacedComponent[];
  connections: Connection[];
  selectedIds: string[];
  selectedConnectionId: string | null;
  nextZIndex: number;
  frames: Frame[];
  selectedFrameId: string | null;
}

// --- Diagram Persistence Types ---

export type SaveMode = 'auto' | 'manual';

export interface DiagramSchema {
  id: string;
  name: string;
  createdAt: string;       // ISO 8601
  updatedAt: string;
  components: PlacedComponent[];
  connections: Connection[];
  frames: Frame[];
  viewport: CanvasTransform;
}

export interface DiagramsStore {
  diagrams: DiagramSchema[];
  activeDiagramId: string;
  openTabIds: string[];
}
