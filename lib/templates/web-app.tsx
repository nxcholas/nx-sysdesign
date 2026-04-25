import type { DiagramTemplate } from './index';

const BROWSER_ID = 'b1b2c3d4-0001-0000-0000-000000000002';
const LB_ID = 'b1b2c3d4-0002-0000-0000-000000000002';
const WEB_A_ID = 'b1b2c3d4-0003-0000-0000-000000000002';
const WEB_B_ID = 'b1b2c3d4-0004-0000-0000-000000000002';
const DB_ID = 'b1b2c3d4-0005-0000-0000-000000000002';
const REDIS_ID = 'b1b2c3d4-0006-0000-0000-000000000002';

const thumbnail = (
  <svg aria-hidden="true" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
      <marker id="wa-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#6b7280" />
      </marker>
    </defs>
    <rect width="200" height="120" fill="#0d1117" />
    <rect x="8" y="50" width="30" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="23" y="59" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Browser</text>
    <rect x="52" y="50" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="70" y="59" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Load Bal</text>
    <rect x="104" y="28" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="122" y="37" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Web Svc A</text>
    <rect x="104" y="66" width="36" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="122" y="75" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Web Svc B</text>
    <rect x="158" y="28" width="32" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="174" y="37" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Primary DB</text>
    <rect x="158" y="66" width="32" height="14" fill="#1e2230" stroke="#4b5563" strokeWidth="1" rx="2" />
    <text x="174" y="75" fill="#9ca3af" fontSize="5" fontFamily="sans-serif" textAnchor="middle">Redis</text>
    <line x1="38" y1="57" x2="52" y2="57" stroke="#6b7280" strokeWidth="1" markerEnd="url(#wa-arrow)" />
    <line x1="88" y1="54" x2="104" y2="36" stroke="#6b7280" strokeWidth="1" markerEnd="url(#wa-arrow)" />
    <line x1="88" y1="60" x2="104" y2="73" stroke="#6b7280" strokeWidth="1" markerEnd="url(#wa-arrow)" />
    <line x1="140" y1="35" x2="158" y2="35" stroke="#6b7280" strokeWidth="1" markerEnd="url(#wa-arrow)" />
    <line x1="140" y1="73" x2="158" y2="73" stroke="#6b7280" strokeWidth="1" markerEnd="url(#wa-arrow)" />
    <line x1="140" y1="38" x2="155" y2="68" stroke="#6b7280" strokeWidth="1" markerEnd="url(#wa-arrow)" />
  </svg>
);

export const webAppTemplate: DiagramTemplate = {
  id: 'web-app',
  name: 'Web App',
  description: 'Classic three-tier web architecture with load balancing and caching',
  thumbnail,
  components: [
    { id: BROWSER_ID, kind: { type: 'block', kind: 'browser' }, x: 80, y: 250, width: 96, height: 96, label: 'Browser', zIndex: 1 },
    { id: LB_ID, kind: { type: 'block', kind: 'load-balancer' }, x: 260, y: 248, width: 112, height: 96, label: 'Load Balancer', zIndex: 2 },
    { id: WEB_A_ID, kind: { type: 'block', kind: 'web-server' }, x: 450, y: 180, width: 128, height: 96, label: 'Web Server A', zIndex: 3 },
    { id: WEB_B_ID, kind: { type: 'block', kind: 'web-server' }, x: 450, y: 310, width: 128, height: 96, label: 'Web Server B', zIndex: 4 },
    { id: DB_ID, kind: { type: 'block', kind: 'sql-db' }, x: 660, y: 220, width: 96, height: 112, label: 'Primary DB', zIndex: 5 },
    { id: REDIS_ID, kind: { type: 'block', kind: 'redis' }, x: 660, y: 360, width: 96, height: 96, label: 'Redis Cache', zIndex: 6 },
  ],
  connections: [
    { id: 'wa-conn-1', sourceId: BROWSER_ID, sourcePort: 'right', targetId: LB_ID, targetPort: 'left' },
    { id: 'wa-conn-2', sourceId: LB_ID, sourcePort: 'right', targetId: WEB_A_ID, targetPort: 'left' },
    { id: 'wa-conn-3', sourceId: LB_ID, sourcePort: 'right', targetId: WEB_B_ID, targetPort: 'left' },
    { id: 'wa-conn-4', sourceId: WEB_A_ID, sourcePort: 'right', targetId: DB_ID, targetPort: 'left' },
    { id: 'wa-conn-5', sourceId: WEB_B_ID, sourcePort: 'right', targetId: REDIS_ID, targetPort: 'left' },
    { id: 'wa-conn-6', sourceId: WEB_A_ID, sourcePort: 'right', targetId: REDIS_ID, targetPort: 'left' },
  ],
  frames: [],
};
