import type { DiagramTemplate } from './index';

const USER_ID = 'a1b2c3d4-0001-0000-0000-000000000001';
const GATEWAY_ID = 'a1b2c3d4-0002-0000-0000-000000000001';
const SVC_A_ID = 'a1b2c3d4-0003-0000-0000-000000000001';
const SVC_B_ID = 'a1b2c3d4-0004-0000-0000-000000000001';
const SVC_C_ID = 'a1b2c3d4-0005-0000-0000-000000000001';
const DB_ID = 'a1b2c3d4-0006-0000-0000-000000000001';
const REDIS_ID = 'a1b2c3d4-0007-0000-0000-000000000001';
const QUEUE_ID = 'a1b2c3d4-0008-0000-0000-000000000001';

const thumbnail = (
  <svg aria-hidden="true" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
      <marker id="ms-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#6b7280" />
      </marker>
    </defs>
    <rect width="200" height="120" fill="#0d1117" />
    <rect x="8" y="52" width="28" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="22" y="61" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">User</text>
    <rect x="50" y="52" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="68" y="61" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">API GW</text>
    <rect x="104" y="18" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="122" y="27" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">User Svc</text>
    <rect x="104" y="52" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="122" y="61" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Order Svc</text>
    <rect x="104" y="86" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="122" y="95" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Pay Svc</text>
    <rect x="158" y="18" width="32" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="174" y="27" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Users DB</text>
    <rect x="158" y="52" width="32" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="174" y="61" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Cache</text>
    <rect x="158" y="86" width="32" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="174" y="95" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Queue</text>
    <line x1="36" y1="59" x2="50" y2="59" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ms-arrow)" />
    <line x1="86" y1="56" x2="104" y2="27" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ms-arrow)" />
    <line x1="86" y1="59" x2="104" y2="59" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ms-arrow)" />
    <line x1="86" y1="62" x2="104" y2="91" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ms-arrow)" />
    <line x1="140" y1="25" x2="158" y2="25" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ms-arrow)" />
    <line x1="140" y1="59" x2="158" y2="59" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ms-arrow)" />
    <line x1="140" y1="93" x2="158" y2="93" stroke="#6b7280" strokeWidth="1" markerEnd="url(#ms-arrow)" />
  </svg>
);

export const microservicesTemplate: DiagramTemplate = {
  id: 'microservices',
  name: 'Microservices',
  description: 'API Gateway routing to independent services with shared data stores',
  thumbnail,
  components: [
    { id: USER_ID, kind: { type: 'block', kind: 'user' }, x: 100, y: 280, width: 80, height: 96, label: 'User', zIndex: 1 },
    { id: GATEWAY_ID, kind: { type: 'block', kind: 'api-gateway' }, x: 260, y: 275, width: 112, height: 96, label: 'API Gateway', zIndex: 2 },
    { id: SVC_A_ID, kind: { type: 'block', kind: 'microservice' }, x: 450, y: 160, width: 104, height: 96, label: 'User Service', zIndex: 3 },
    { id: SVC_B_ID, kind: { type: 'block', kind: 'microservice' }, x: 450, y: 280, width: 104, height: 96, label: 'Order Service', zIndex: 4 },
    { id: SVC_C_ID, kind: { type: 'block', kind: 'microservice' }, x: 450, y: 400, width: 104, height: 96, label: 'Payment Service', zIndex: 5 },
    { id: DB_ID, kind: { type: 'block', kind: 'sql-db' }, x: 640, y: 220, width: 96, height: 112, label: 'Users DB', zIndex: 6 },
    { id: REDIS_ID, kind: { type: 'block', kind: 'redis' }, x: 640, y: 360, width: 96, height: 96, label: 'Cache', zIndex: 7 },
    { id: QUEUE_ID, kind: { type: 'block', kind: 'message-queue' }, x: 640, y: 480, width: 120, height: 96, label: 'Event Queue', zIndex: 8 },
  ],
  connections: [
    { id: 'ms-conn-1', sourceId: USER_ID, sourcePort: 'right', targetId: GATEWAY_ID, targetPort: 'left' },
    { id: 'ms-conn-2', sourceId: GATEWAY_ID, sourcePort: 'right', targetId: SVC_A_ID, targetPort: 'left' },
    { id: 'ms-conn-3', sourceId: GATEWAY_ID, sourcePort: 'right', targetId: SVC_B_ID, targetPort: 'left' },
    { id: 'ms-conn-4', sourceId: GATEWAY_ID, sourcePort: 'right', targetId: SVC_C_ID, targetPort: 'left' },
    { id: 'ms-conn-5', sourceId: SVC_A_ID, sourcePort: 'right', targetId: DB_ID, targetPort: 'left' },
    { id: 'ms-conn-6', sourceId: SVC_B_ID, sourcePort: 'right', targetId: REDIS_ID, targetPort: 'left' },
    { id: 'ms-conn-7', sourceId: SVC_C_ID, sourcePort: 'right', targetId: QUEUE_ID, targetPort: 'left' },
  ],
  frames: [],
};
