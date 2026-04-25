import type { DiagramTemplate } from './index';

const USERS_ID = 'd1b2c3d4-0001-0000-0000-000000000004';
const ORDERS_ID = 'd1b2c3d4-0002-0000-0000-000000000004';
const PRODUCTS_ID = 'd1b2c3d4-0003-0000-0000-000000000004';

const thumbnail = (
  <svg aria-hidden="true" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
      <marker id="er-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#6b7280" />
      </marker>
    </defs>
    <rect width="200" height="120" fill="#0d1117" />
    <rect x="8" y="14" width="60" height="46" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="38" y="23" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">users</text>
    <line x1="8" y1="27" x2="68" y2="27" stroke="#4b5563" strokeWidth="0.5" />
    <text x="14" y="35" fill="#9ca3af" fontSize="4.5" fontFamily="sans-serif">PK  id</text>
    <text x="14" y="43" fill="#9ca3af" fontSize="4.5" fontFamily="sans-serif">     email</text>
    <text x="14" y="51" fill="#9ca3af" fontSize="4.5" fontFamily="sans-serif">     name</text>
    <rect x="84" y="14" width="60" height="46" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="114" y="23" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">orders</text>
    <line x1="84" y1="27" x2="144" y2="27" stroke="#4b5563" strokeWidth="0.5" />
    <text x="90" y="35" fill="#9ca3af" fontSize="4.5" fontFamily="sans-serif">PK  id</text>
    <text x="90" y="43" fill="#9ca3af" fontSize="4.5" fontFamily="sans-serif">FK  user_id</text>
    <text x="90" y="51" fill="#9ca3af" fontSize="4.5" fontFamily="sans-serif">     total</text>
    <rect x="84" y="72" width="60" height="38" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="114" y="81" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">products</text>
    <line x1="84" y1="85" x2="144" y2="85" stroke="#4b5563" strokeWidth="0.5" />
    <text x="90" y="93" fill="#9ca3af" fontSize="4.5" fontFamily="sans-serif">PK  id</text>
    <text x="90" y="101" fill="#9ca3af" fontSize="4.5" fontFamily="sans-serif">     name</text>
    <line x1="68" y1="35" x2="84" y2="43" stroke="#6b7280" strokeWidth="1" markerEnd="url(#er-arrow)" />
    <line x1="114" y1="60" x2="114" y2="72" stroke="#6b7280" strokeWidth="1" markerEnd="url(#er-arrow)" />
  </svg>
);

export const erDiagramTemplate: DiagramTemplate = {
  id: 'er-diagram',
  name: 'ER Diagram',
  description: 'Entity-relationship model with three related tables',
  thumbnail,
  components: [
    {
      id: USERS_ID,
      kind: { type: 'block', kind: 'entity-relation-table' },
      x: 80,
      y: 180,
      width: 240,
      height: 182,
      zIndex: 1,
      tableData: {
        header: 'users',
        rows: [
          { id: 'r1', name: 'id', keyType: 'PK' },
          { id: 'r2', name: 'email', keyType: 'none' },
          { id: 'r3', name: 'name', keyType: 'none' },
        ],
      },
    },
    {
      id: ORDERS_ID,
      kind: { type: 'block', kind: 'entity-relation-table' },
      x: 400,
      y: 180,
      width: 240,
      height: 182,
      zIndex: 2,
      tableData: {
        header: 'orders',
        rows: [
          { id: 'r4', name: 'id', keyType: 'PK' },
          { id: 'r5', name: 'user_id', keyType: 'FK' },
          { id: 'r6', name: 'total', keyType: 'none' },
        ],
      },
    },
    {
      id: PRODUCTS_ID,
      kind: { type: 'block', kind: 'entity-relation-table' },
      x: 400,
      y: 420,
      width: 240,
      height: 182,
      zIndex: 3,
      tableData: {
        header: 'products',
        rows: [
          { id: 'r7', name: 'id', keyType: 'PK' },
          { id: 'r8', name: 'name', keyType: 'none' },
          { id: 'r9', name: 'price', keyType: 'none' },
        ],
      },
    },
  ],
  connections: [
    {
      id: 'er-conn-1',
      sourceId: USERS_ID,
      sourcePort: { kind: 'row', rowId: 'r1', side: 'right' },
      targetId: ORDERS_ID,
      targetPort: { kind: 'row', rowId: 'r5', side: 'left' },
    },
    {
      id: 'er-conn-2',
      sourceId: ORDERS_ID,
      sourcePort: 'bottom',
      targetId: PRODUCTS_ID,
      targetPort: 'top',
    },
  ],
  frames: [],
};
