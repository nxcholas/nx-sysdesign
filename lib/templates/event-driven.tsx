import type { DiagramTemplate } from './index';

const PRODUCER_ID = 'c1b2c3d4-0001-0000-0000-000000000003';
const QUEUE_ID = 'c1b2c3d4-0002-0000-0000-000000000003';
const WORKER_A_ID = 'c1b2c3d4-0003-0000-0000-000000000003';
const WORKER_B_ID = 'c1b2c3d4-0004-0000-0000-000000000003';
const WORKER_C_ID = 'c1b2c3d4-0005-0000-0000-000000000003';
const DB_ID = 'c1b2c3d4-0006-0000-0000-000000000003';

const thumbnail = (
  <svg aria-hidden="true" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
      <marker id="ed-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#6b7280" />
      </marker>
    </defs>
    <rect width="200" height="120" fill="#0d1117" />
    <rect x="8" y="50" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="26" y="59" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Producer</text>
    <rect x="60" y="50" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="78" y="59" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Queue</text>
    <rect x="112" y="18" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="130" y="27" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Consumer A</text>
    <rect x="112" y="50" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="130" y="59" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Consumer B</text>
    <rect x="112" y="82" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="130" y="91" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Consumer C</text>
    <rect x="160" y="50" width="32" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="176" y="59" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Results DB</text>
    <line x1="44" y1="57" x2="60" y2="57" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ed-arrow)" />
    <line x1="96" y1="54" x2="112" y2="26" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ed-arrow)" />
    <line x1="96" y1="57" x2="112" y2="57" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ed-arrow)" />
    <line x1="96" y1="60" x2="112" y2="87" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ed-arrow)" />
    <line x1="148" y1="25" x2="160" y2="55" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ed-arrow)" />
    <line x1="148" y1="57" x2="160" y2="57" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ed-arrow)" />
    <line x1="148" y1="89" x2="160" y2="62" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ed-arrow)" />
  </svg>
);

export const eventDrivenTemplate: DiagramTemplate = {
  id: 'event-driven',
  name: 'Event-Driven',
  description: 'Producers publishing events to a queue consumed by async workers',
  thumbnail,
  components: [
    { id: PRODUCER_ID, kind: { type: 'block', kind: 'web-server' }, x: 80, y: 240, width: 128, height: 96, label: 'Producer', zIndex: 1 },
    { id: QUEUE_ID, kind: { type: 'block', kind: 'message-queue' }, x: 300, y: 245, width: 120, height: 96, label: 'Event Queue', zIndex: 2 },
    { id: WORKER_A_ID, kind: { type: 'block', kind: 'worker' }, x: 510, y: 160, width: 96, height: 96, label: 'Consumer A', zIndex: 3 },
    { id: WORKER_B_ID, kind: { type: 'block', kind: 'worker' }, x: 510, y: 280, width: 96, height: 96, label: 'Consumer B', zIndex: 4 },
    { id: WORKER_C_ID, kind: { type: 'block', kind: 'worker' }, x: 510, y: 400, width: 96, height: 96, label: 'Consumer C', zIndex: 5 },
    { id: DB_ID, kind: { type: 'block', kind: 'database' }, x: 680, y: 220, width: 96, height: 112, label: 'Results DB', zIndex: 6 },
  ],
  connections: [
    { id: 'ed-conn-1', sourceId: PRODUCER_ID, sourcePort: 'right', targetId: QUEUE_ID, targetPort: 'left' },
    { id: 'ed-conn-2', sourceId: QUEUE_ID, sourcePort: 'right', targetId: WORKER_A_ID, targetPort: 'left' },
    { id: 'ed-conn-3', sourceId: QUEUE_ID, sourcePort: 'right', targetId: WORKER_B_ID, targetPort: 'left' },
    { id: 'ed-conn-4', sourceId: QUEUE_ID, sourcePort: 'right', targetId: WORKER_C_ID, targetPort: 'left' },
    { id: 'ed-conn-5', sourceId: WORKER_A_ID, sourcePort: 'right', targetId: DB_ID, targetPort: 'left' },
    { id: 'ed-conn-6', sourceId: WORKER_B_ID, sourcePort: 'right', targetId: DB_ID, targetPort: 'left' },
    { id: 'ed-conn-7', sourceId: WORKER_C_ID, sourcePort: 'right', targetId: DB_ID, targetPort: 'left' },
  ],
  frames: [],
};
