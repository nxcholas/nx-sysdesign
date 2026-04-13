import type { ComponentRole } from './types';

// --- Shape Types ---

export type IconShape =
  | 'circle'
  | 'rect'
  | 'cylinder'
  | 'hexagon'
  | 'diamond'
  | 'shield'
  | 'cloud'
  | 'parallelogram';

// --- Category Types ---

export type BlockCategory =
  | 'client'
  | 'compute'
  | 'storage'
  | 'caching'
  | 'messaging'
  | 'networking'
  | 'security'
  | 'monitoring'
  | 'data'
  | 'external';

export interface BlockVisual {
  shape: IconShape;
  /** Full Tailwind class literal — e.g. 'bg-blue-600'. Never interpolated. */
  bgClass: string;
  borderClass: string;
  iconColorClass: string;
  svgViewBox?: string;
  /** SVG path `d` attributes (Heroicons 24/solid or Lucide). */
  svgPaths: string[];
  svgFillRule?: 'evenodd' | 'nonzero';
  /** Escape hatch for CSS-constructed visuals that can't be expressed as SVG paths. */
  complexVisualKey?: string;
}

export interface BlockDefinition {
  /** Stable kebab-case key — serialized to localStorage. Never change after release. */
  kind: string;
  label: string;
  category: BlockCategory;
  sortOrder: number;
  role: ComponentRole;
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  visual: BlockVisual;
}

export interface CategoryMeta {
  id: BlockCategory;
  label: string;
  defaultOpen: boolean;
  blocks: BlockDefinition[];
}

// --- Registry Array ---
// All Tailwind color classes are written as complete string literals so Tailwind's
// content scanner can find them at build time (no dynamic interpolation).

const REGISTRY_ARRAY: BlockDefinition[] = [
  // ─── Clients & Devices ────────────────────────────────────────────────────

  {
    kind: 'user',
    label: 'User',
    category: 'client',
    sortOrder: 0,
    role: 'entity',
    defaultWidth: 80,
    defaultHeight: 96,
    minWidth: 80,
    minHeight: 96,
    visual: {
      shape: 'circle',
      bgClass: 'bg-blue-600',
      borderClass: 'border-blue-400',
      iconColorClass: 'text-white',
      svgPaths: [
        'M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0zM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'browser',
    label: 'Browser',
    category: 'client',
    sortOrder: 1,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 80,
    minHeight: 80,
    visual: {
      shape: 'rect',
      bgClass: 'bg-sky-600',
      borderClass: 'border-sky-400',
      iconColorClass: 'text-white',
      // Heroicons: globe-alt
      svgPaths: [
        'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 2.25 12c0 5.385 4.365 9.75 9.75 9.75 4.218 0 7.823-2.665 9.18-6.413l.022-.057z',
        'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM3.03 11.25a8.25 8.25 0 0 1 15.94 0h-2.3a5.752 5.752 0 0 0-11.34 0H3.03zm.003 1.5h2.297a5.752 5.752 0 0 0 11.34 0h2.3a8.25 8.25 0 0 1-15.937 0z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'mobile-app',
    label: 'Mobile App',
    category: 'client',
    sortOrder: 2,
    role: 'entity',
    defaultWidth: 80,
    defaultHeight: 96,
    minWidth: 72,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-sky-600',
      borderClass: 'border-sky-400',
      iconColorClass: 'text-white',
      // Heroicons: device-phone-mobile
      svgPaths: [
        'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3',
      ],
    },
  },
  {
    kind: 'desktop-app',
    label: 'Desktop App',
    category: 'client',
    sortOrder: 3,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-sky-700',
      borderClass: 'border-sky-500',
      iconColorClass: 'text-white',
      // Heroicons: computer-desktop
      svgPaths: [
        'M8.25 21a.75.75 0 0 0 0 1.5h2.25v1.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75V22.5h2.25a.75.75 0 0 0 0-1.5H8.25zM2.25 4.5A2.25 2.25 0 0 1 4.5 2.25h15a2.25 2.25 0 0 1 2.25 2.25v11.25a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 15.75V4.5z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'iot-device',
    label: 'IoT Device',
    category: 'client',
    sortOrder: 4,
    role: 'entity',
    defaultWidth: 88,
    defaultHeight: 96,
    minWidth: 80,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-cyan-700',
      borderClass: 'border-cyan-500',
      iconColorClass: 'text-white',
      // Heroicons: cpu-chip
      svgPaths: [
        'M6.375 7.125V4.875a3 3 0 0 1 3-3h1.5a3 3 0 0 1 3 3v2.25h.75a2.25 2.25 0 0 1 2.25 2.25v.75h2.25a.75.75 0 0 1 0 1.5H18.75v.75a2.25 2.25 0 0 1-.659 1.591l-.16.16v.01l.16.16a2.25 2.25 0 0 1 .659 1.59v.75h2.25a.75.75 0 0 1 0 1.5H18.75v.75a2.25 2.25 0 0 1-2.25 2.25h-.75v2.25a3 3 0 0 1-3 3h-1.5a3 3 0 0 1-3-3V18h-.75a2.25 2.25 0 0 1-2.25-2.25V15H3a.75.75 0 0 1 0-1.5h2.25v-.75A2.25 2.25 0 0 1 5.909 11.159l.16-.16-.16-.16A2.25 2.25 0 0 1 5.25 9.25V8.5H3A.75.75 0 0 1 3 7h2.25v-.75a2.25 2.25 0 0 1 1.125-1.948V7.125zM9.75 6.375a.75.75 0 0 0-1.5 0v.75h1.5v-.75zm0 11.25v-.75h-1.5v.75a.75.75 0 0 0 1.5 0zm4.5 0a.75.75 0 0 0 1.5 0v-.75h-1.5v.75zm0-11.25v.75h1.5v-.75a.75.75 0 0 0-1.5 0zM9 9h6v6H9V9z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'cli',
    label: 'CLI',
    category: 'client',
    sortOrder: 5,
    role: 'entity',
    defaultWidth: 88,
    defaultHeight: 96,
    minWidth: 80,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-gray-700',
      borderClass: 'border-gray-500',
      iconColorClass: 'text-white',
      // Heroicons: command-line
      svgPaths: [
        'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25z',
      ],
    },
  },

  // ─── Compute & Servers ────────────────────────────────────────────────────

  {
    kind: 'web-server',
    label: 'Web Server',
    category: 'compute',
    sortOrder: 0,
    role: 'entity',
    defaultWidth: 128,
    defaultHeight: 96,
    minWidth: 128,
    minHeight: 96,
    visual: {
      shape: 'rect',
      bgClass: 'bg-indigo-700',
      borderClass: 'border-indigo-500',
      iconColorClass: 'text-white',
      svgPaths: [],
      complexVisualKey: 'server-rack',
    },
  },
  {
    kind: 'api-gateway',
    label: 'API Gateway',
    category: 'compute',
    sortOrder: 1,
    role: 'entity',
    defaultWidth: 112,
    defaultHeight: 96,
    minWidth: 104,
    minHeight: 88,
    visual: {
      shape: 'hexagon',
      bgClass: 'bg-violet-700',
      borderClass: 'border-violet-500',
      iconColorClass: 'text-white',
      // Heroicons: arrows-pointing-in
      svgPaths: [
        'M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25',
      ],
    },
  },
  {
    kind: 'load-balancer',
    label: 'Load Balancer',
    category: 'compute',
    sortOrder: 2,
    role: 'entity',
    defaultWidth: 112,
    defaultHeight: 96,
    minWidth: 104,
    minHeight: 88,
    visual: {
      shape: 'hexagon',
      bgClass: 'bg-purple-700',
      borderClass: 'border-purple-500',
      iconColorClass: 'text-white',
      // Heroicons: arrows-right-left
      svgPaths: [
        'm7.5 21 3-3m0 0 3 3m-3-3v-4.5m6-10.5L15 3m0 0-3 3m3-3v4.5m6 0h-4.5m0 0-3-3m3 3-3 3M3 12h4.5m0 0 3-3m-3 3 3 3',
      ],
    },
  },
  {
    kind: 'container',
    label: 'Container',
    category: 'compute',
    sortOrder: 3,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-blue-700',
      borderClass: 'border-blue-500',
      iconColorClass: 'text-white',
      // Heroicons: cube
      svgPaths: [
        'm21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
      ],
    },
  },
  {
    kind: 'serverless-fn',
    label: 'Lambda / Fn',
    category: 'compute',
    sortOrder: 4,
    role: 'process',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'diamond',
      bgClass: 'bg-amber-700',
      borderClass: 'border-amber-500',
      iconColorClass: 'text-white',
      // Heroicons: bolt
      svgPaths: [
        'M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001z',
      ],
    },
  },
  {
    kind: 'vm',
    label: 'Virtual Machine',
    category: 'compute',
    sortOrder: 5,
    role: 'entity',
    defaultWidth: 112,
    defaultHeight: 96,
    minWidth: 104,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-indigo-800',
      borderClass: 'border-indigo-600',
      iconColorClass: 'text-white',
      // Heroicons: server-stack
      svgPaths: [
        'M5.507 4.048A3 3 0 0 1 7.785 3h8.43a3 3 0 0 1 2.278 1.048l1.722 2.008A4.533 4.533 0 0 0 19.5 6h-15c-.243 0-.482.02-.715.056L5.507 4.048zM4.25 7.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0zM16.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3zm0 3a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3z',
        'M1.5 7.5A4.5 4.5 0 0 1 6 3h12a4.5 4.5 0 0 1 4.5 4.5v9a4.5 4.5 0 0 1-4.5 4.5H6A4.5 4.5 0 0 1 1.5 16.5v-9z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'k8s-pod',
    label: 'K8s Pod',
    category: 'compute',
    sortOrder: 6,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-blue-800',
      borderClass: 'border-blue-600',
      iconColorClass: 'text-white',
      // Heroicons: circle-stack (represents grouped pods)
      svgPaths: [
        'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
      ],
    },
  },
  {
    kind: 'microservice',
    label: 'Microservice',
    category: 'compute',
    sortOrder: 7,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-teal-700',
      borderClass: 'border-teal-500',
      iconColorClass: 'text-white',
      // Heroicons: puzzle-piece
      svgPaths: [
        'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0z',
      ],
    },
  },
  {
    kind: 'reverse-proxy',
    label: 'Reverse Proxy',
    category: 'compute',
    sortOrder: 8,
    role: 'entity',
    defaultWidth: 112,
    defaultHeight: 96,
    minWidth: 104,
    minHeight: 88,
    visual: {
      shape: 'hexagon',
      bgClass: 'bg-slate-600',
      borderClass: 'border-slate-400',
      iconColorClass: 'text-white',
      // Heroicons: shield-check
      svgPaths: [
        'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
      ],
    },
  },
  {
    kind: 'worker',
    label: 'Worker',
    category: 'compute',
    sortOrder: 9,
    role: 'process',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-orange-700',
      borderClass: 'border-orange-500',
      iconColorClass: 'text-white',
      // Heroicons: cog-6-tooth
      svgPaths: [
        'M12 .75a8.25 8.25 0 1 0 0 16.5A8.25 8.25 0 0 0 12 .75zM9.813 11.016a2.25 2.25 0 0 1 4.374 0v.012a.75.75 0 0 1-1.5 0v-.012a.75.75 0 0 0-1.374 0v.012a.75.75 0 0 1-1.5 0v-.012zM12 6.75a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75z',
        'M9.75 12.375a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0z',
      ],
      svgFillRule: 'evenodd',
    },
  },

  // ─── Storage & Databases ──────────────────────────────────────────────────

  {
    kind: 'database',
    label: 'Database',
    category: 'storage',
    sortOrder: 0,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 112,
    minWidth: 96,
    minHeight: 112,
    visual: {
      shape: 'cylinder',
      bgClass: 'bg-emerald-700',
      borderClass: 'border-emerald-500',
      iconColorClass: 'text-white',
      svgPaths: [],
      complexVisualKey: 'cylinder-icon',
    },
  },
  {
    kind: 'sql-db',
    label: 'SQL Database',
    category: 'storage',
    sortOrder: 1,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 112,
    minWidth: 96,
    minHeight: 112,
    visual: {
      shape: 'cylinder',
      bgClass: 'bg-emerald-600',
      borderClass: 'border-emerald-400',
      iconColorClass: 'text-white',
      // Heroicons: table-cells
      svgPaths: [
        'M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0H8.25m9.75 0h1.5',
      ],
    },
  },
  {
    kind: 'nosql-db',
    label: 'NoSQL Database',
    category: 'storage',
    sortOrder: 2,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 112,
    minWidth: 96,
    minHeight: 112,
    visual: {
      shape: 'cylinder',
      bgClass: 'bg-lime-700',
      borderClass: 'border-lime-500',
      iconColorClass: 'text-white',
      // Heroicons: document-text
      svgPaths: [
        'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z',
      ],
    },
  },
  {
    kind: 'object-storage',
    label: 'Object Storage',
    category: 'storage',
    sortOrder: 3,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-teal-700',
      borderClass: 'border-teal-500',
      iconColorClass: 'text-white',
      // Heroicons: archive-box
      svgPaths: [
        'M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z',
        'M3.087 9l.54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'file-storage',
    label: 'File Storage',
    category: 'storage',
    sortOrder: 4,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-stone-600',
      borderClass: 'border-stone-400',
      iconColorClass: 'text-white',
      // Heroicons: folder
      svgPaths: [
        'M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15zM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 12h-15a4.483 4.483 0 0 0-3 1.146z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'data-warehouse',
    label: 'Data Warehouse',
    category: 'storage',
    sortOrder: 5,
    role: 'entity',
    defaultWidth: 112,
    defaultHeight: 112,
    minWidth: 104,
    minHeight: 104,
    visual: {
      shape: 'cylinder',
      bgClass: 'bg-indigo-600',
      borderClass: 'border-indigo-400',
      iconColorClass: 'text-white',
      // Heroicons: building-library
      svgPaths: [
        'M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3h1.5m-1.5 3h1.5m-7.5-3h1.5m-1.5 3h1.5m13.5-3h1.5m-1.5 3h1.5M6.75 21h13.5',
      ],
    },
  },
  {
    kind: 'data-lake',
    label: 'Data Lake',
    category: 'storage',
    sortOrder: 6,
    role: 'entity',
    defaultWidth: 112,
    defaultHeight: 96,
    minWidth: 104,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-cyan-800',
      borderClass: 'border-cyan-600',
      iconColorClass: 'text-white',
      // Wave pattern (Lucide waves simplified)
      svgPaths: [
        'M3 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M3 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M3 18c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2',
      ],
    },
  },
  {
    kind: 'blob-storage',
    label: 'Blob Storage',
    category: 'storage',
    sortOrder: 7,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-teal-800',
      borderClass: 'border-teal-600',
      iconColorClass: 'text-white',
      // Heroicons: document
      svgPaths: [
        'M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625z',
        'M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963z',
      ],
      svgFillRule: 'evenodd',
    },
  },

  // ─── Caching ──────────────────────────────────────────────────────────────

  {
    kind: 'cache',
    label: 'Cache',
    category: 'caching',
    sortOrder: 0,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-red-700',
      borderClass: 'border-red-500',
      iconColorClass: 'text-white',
      // Heroicons: bolt
      svgPaths: [
        'M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.718a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .945-.143z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'redis',
    label: 'Redis',
    category: 'caching',
    sortOrder: 1,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-red-600',
      borderClass: 'border-red-400',
      iconColorClass: 'text-white',
      // Heroicons: circle-stack (represents in-memory data layers)
      svgPaths: [
        'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
      ],
    },
  },
  {
    kind: 'cdn',
    label: 'CDN',
    category: 'caching',
    sortOrder: 2,
    role: 'entity',
    defaultWidth: 112,
    defaultHeight: 96,
    minWidth: 104,
    minHeight: 88,
    visual: {
      shape: 'cloud',
      bgClass: 'bg-blue-600',
      borderClass: 'border-blue-400',
      iconColorClass: 'text-white',
      // Heroicons: signal (broadcasting / CDN distribution)
      svgPaths: [
        'M8.25 4.5a7.5 7.5 0 0 1 15 0v8.25a7.5 7.5 0 0 1-15 0V4.5zM6 10.5a9 9 0 1 0 18 0A9 9 0 0 0 6 10.5zM5.25 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0zm13.5 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z',
        'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'browser-cache',
    label: 'Browser Cache',
    category: 'caching',
    sortOrder: 3,
    role: 'entity',
    defaultWidth: 88,
    defaultHeight: 96,
    minWidth: 80,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-sky-700',
      borderClass: 'border-sky-500',
      iconColorClass: 'text-white',
      // Heroicons: clock
      svgPaths: [
        'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6z',
      ],
      svgFillRule: 'evenodd',
    },
  },

  // ─── Messaging & Events ───────────────────────────────────────────────────

  {
    kind: 'message-queue',
    label: 'Message Queue',
    category: 'messaging',
    sortOrder: 0,
    role: 'entity',
    defaultWidth: 120,
    defaultHeight: 96,
    minWidth: 112,
    minHeight: 88,
    visual: {
      shape: 'parallelogram',
      bgClass: 'bg-yellow-700',
      borderClass: 'border-yellow-500',
      iconColorClass: 'text-white',
      // Heroicons: queue-list
      svgPaths: [
        'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75z',
      ],
    },
  },
  {
    kind: 'pub-sub',
    label: 'Pub / Sub',
    category: 'messaging',
    sortOrder: 1,
    role: 'entity',
    defaultWidth: 112,
    defaultHeight: 96,
    minWidth: 104,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-yellow-600',
      borderClass: 'border-yellow-400',
      iconColorClass: 'text-white',
      // Heroicons: signal (broadcast)
      svgPaths: [
        'M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12z',
      ],
    },
  },
  {
    kind: 'event-bus',
    label: 'Event Bus',
    category: 'messaging',
    sortOrder: 2,
    role: 'entity',
    defaultWidth: 120,
    defaultHeight: 96,
    minWidth: 112,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-orange-600',
      borderClass: 'border-orange-400',
      iconColorClass: 'text-white',
      // Heroicons: bars-3 (bus bar representation)
      svgPaths: [
        'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
      ],
    },
  },
  {
    kind: 'stream-processor',
    label: 'Stream Processor',
    category: 'messaging',
    sortOrder: 3,
    role: 'process',
    defaultWidth: 112,
    defaultHeight: 96,
    minWidth: 104,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-amber-600',
      borderClass: 'border-amber-400',
      iconColorClass: 'text-white',
      // Heroicons: arrow-trending-up
      svgPaths: [
        'M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941',
      ],
    },
  },
  {
    kind: 'webhook',
    label: 'Webhook',
    category: 'messaging',
    sortOrder: 4,
    role: 'process',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-pink-700',
      borderClass: 'border-pink-500',
      iconColorClass: 'text-white',
      // Heroicons: arrow-uturn-right
      svgPaths: [
        'm15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3',
      ],
    },
  },
  {
    kind: 'notification-service',
    label: 'Notification',
    category: 'messaging',
    sortOrder: 5,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-rose-600',
      borderClass: 'border-rose-400',
      iconColorClass: 'text-white',
      // Heroicons: bell
      svgPaths: [
        'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0',
      ],
    },
  },

  // ─── Networking & Infrastructure ──────────────────────────────────────────

  {
    kind: 'internet',
    label: 'Internet',
    category: 'networking',
    sortOrder: 0,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'cloud',
      bgClass: 'bg-gray-600',
      borderClass: 'border-gray-400',
      iconColorClass: 'text-white',
      // Heroicons: globe-americas
      svgPaths: [
        'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072c.328-.052.66-.1.994-.144C8.363 5.714 9.52 5.625 10.5 5.625c.924 0 1.99.085 2.986.235.74.112 1.517.285 2.181.546.63.246 1.083.579 1.083.844 0 .17-.158.347-.39.534-.188.152-.426.3-.678.434-.504.264-1.078.48-1.6.658a14.264 14.264 0 0 1-2.118.45 14.026 14.026 0 0 1-2.218.045 14.16 14.16 0 0 1-1.9-.25 13.977 13.977 0 0 1-1.686-.48c-.5-.17-.967-.375-1.38-.6a3.876 3.876 0 0 1-.58-.4c-.177-.157-.277-.308-.277-.458 0-.176.123-.367.359-.556.193-.153.46-.302.748-.432a8.87 8.87 0 0 1 1.09-.376z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'dns',
    label: 'DNS',
    category: 'networking',
    sortOrder: 1,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-blue-800',
      borderClass: 'border-blue-600',
      iconColorClass: 'text-white',
      // Heroicons: at-symbol
      svgPaths: [
        'M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25',
      ],
    },
  },
  {
    kind: 'firewall',
    label: 'Firewall',
    category: 'networking',
    sortOrder: 2,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'shield',
      bgClass: 'bg-red-800',
      borderClass: 'border-red-600',
      iconColorClass: 'text-white',
      // Heroicons: fire
      svgPaths: [
        'M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48z',
        'M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'vpc',
    label: 'VPC',
    category: 'networking',
    sortOrder: 3,
    role: 'entity',
    defaultWidth: 128,
    defaultHeight: 128,
    minWidth: 120,
    minHeight: 120,
    visual: {
      shape: 'rect',
      bgClass: 'bg-slate-700',
      borderClass: 'border-slate-500',
      iconColorClass: 'text-white',
      // Heroicons: square-3-stack-3d
      svgPaths: [
        'M12 2.25 3 7.5l9 5.25 9-5.25L12 2.25zM3 12.25l9 5.25 9-5.25M3 17l9 5.25L21 17',
      ],
    },
  },
  {
    kind: 'subnet',
    label: 'Subnet',
    category: 'networking',
    sortOrder: 4,
    role: 'entity',
    defaultWidth: 112,
    defaultHeight: 96,
    minWidth: 104,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-slate-600',
      borderClass: 'border-slate-400',
      iconColorClass: 'text-white',
      // Heroicons: squares-2x2
      svgPaths: [
        'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25zM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'availability-zone',
    label: 'Availability Zone',
    category: 'networking',
    sortOrder: 5,
    role: 'entity',
    defaultWidth: 120,
    defaultHeight: 96,
    minWidth: 112,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-slate-800',
      borderClass: 'border-slate-600',
      iconColorClass: 'text-white',
      // Heroicons: map-pin
      svgPaths: [
        'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
        'M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'region',
    label: 'Region',
    category: 'networking',
    sortOrder: 6,
    role: 'entity',
    defaultWidth: 128,
    defaultHeight: 96,
    minWidth: 120,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-gray-700',
      borderClass: 'border-gray-500',
      iconColorClass: 'text-white',
      // Heroicons: map
      svgPaths: [
        'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z',
      ],
    },
  },

  // ─── Security & Identity ──────────────────────────────────────────────────

  {
    kind: 'auth-service',
    label: 'Auth Service',
    category: 'security',
    sortOrder: 0,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'shield',
      bgClass: 'bg-green-700',
      borderClass: 'border-green-500',
      iconColorClass: 'text-white',
      // Heroicons: lock-closed
      svgPaths: [
        'M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'waf',
    label: 'WAF',
    category: 'security',
    sortOrder: 1,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'shield',
      bgClass: 'bg-red-700',
      borderClass: 'border-red-500',
      iconColorClass: 'text-white',
      // Heroicons: shield-check
      svgPaths: [
        'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
      ],
    },
  },
  {
    kind: 'encryption',
    label: 'Encryption',
    category: 'security',
    sortOrder: 2,
    role: 'process',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'shield',
      bgClass: 'bg-emerald-800',
      borderClass: 'border-emerald-600',
      iconColorClass: 'text-white',
      // Heroicons: key
      svgPaths: [
        'M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25z',
      ],
    },
  },
  {
    kind: 'certificate',
    label: 'Certificate',
    category: 'security',
    sortOrder: 3,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-green-600',
      borderClass: 'border-green-400',
      iconColorClass: 'text-white',
      // Heroicons: document-check
      svgPaths: [
        'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
      ],
    },
  },
  {
    kind: 'secrets-manager',
    label: 'Secrets Manager',
    category: 'security',
    sortOrder: 4,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-yellow-800',
      borderClass: 'border-yellow-600',
      iconColorClass: 'text-white',
      // Heroicons: lock-open (vault representation)
      svgPaths: [
        'M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z',
      ],
    },
  },
  {
    kind: 'iam',
    label: 'IAM',
    category: 'security',
    sortOrder: 5,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'shield',
      bgClass: 'bg-blue-700',
      borderClass: 'border-blue-500',
      iconColorClass: 'text-white',
      // Heroicons: user-circle
      svgPaths: [
        'M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438zM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'oauth',
    label: 'OAuth',
    category: 'security',
    sortOrder: 6,
    role: 'process',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-purple-600',
      borderClass: 'border-purple-400',
      iconColorClass: 'text-white',
      // Heroicons: finger-print
      svgPaths: [
        'M12 1.5c-1.921 0-3.816.111-5.68.327-1.497.174-2.57 1.46-2.57 2.93V21.75a.75.75 0 0 0 1.5 0V4.757c0-.98.7-1.833 1.682-1.944C8.461 2.596 10.22 2.25 12 2.25c1.78 0 3.539.346 5.068.563.982.111 1.682.964 1.682 1.944V21.75a.75.75 0 0 0 1.5 0V4.757c0-1.47-1.073-2.756-2.57-2.93A48.465 48.465 0 0 0 12 1.5z',
        'M8.25 6.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5zm0 3.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5zm0 3.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5z',
      ],
      svgFillRule: 'evenodd',
    },
  },

  // ─── Monitoring & Observability ───────────────────────────────────────────

  {
    kind: 'logging',
    label: 'Logging',
    category: 'monitoring',
    sortOrder: 0,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-gray-600',
      borderClass: 'border-gray-400',
      iconColorClass: 'text-white',
      // Heroicons: document-text
      svgPaths: [
        'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z',
      ],
    },
  },
  {
    kind: 'metrics',
    label: 'Metrics',
    category: 'monitoring',
    sortOrder: 1,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-blue-600',
      borderClass: 'border-blue-400',
      iconColorClass: 'text-white',
      // Heroicons: chart-bar
      svgPaths: [
        'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z',
      ],
    },
  },
  {
    kind: 'alerting',
    label: 'Alerting',
    category: 'monitoring',
    sortOrder: 2,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-red-600',
      borderClass: 'border-red-400',
      iconColorClass: 'text-white',
      // Heroicons: exclamation-triangle
      svgPaths: [
        'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
      ],
    },
  },
  {
    kind: 'tracing',
    label: 'Tracing',
    category: 'monitoring',
    sortOrder: 3,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-violet-600',
      borderClass: 'border-violet-400',
      iconColorClass: 'text-white',
      // Heroicons: eye (observability)
      svgPaths: [
        'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z',
        'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'health-check',
    label: 'Health Check',
    category: 'monitoring',
    sortOrder: 4,
    role: 'process',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-green-600',
      borderClass: 'border-green-400',
      iconColorClass: 'text-white',
      // Heroicons: heart
      svgPaths: [
        'M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'dashboard',
    label: 'Dashboard',
    category: 'monitoring',
    sortOrder: 5,
    role: 'entity',
    defaultWidth: 112,
    defaultHeight: 96,
    minWidth: 104,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-indigo-600',
      borderClass: 'border-indigo-400',
      iconColorClass: 'text-white',
      // Heroicons: squares-2x2
      svgPaths: [
        'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25zM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25z',
      ],
      svgFillRule: 'evenodd',
    },
  },

  // ─── Data Processing ──────────────────────────────────────────────────────

  {
    kind: 'etl-pipeline',
    label: 'ETL Pipeline',
    category: 'data',
    sortOrder: 0,
    role: 'process',
    defaultWidth: 120,
    defaultHeight: 96,
    minWidth: 112,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-teal-600',
      borderClass: 'border-teal-400',
      iconColorClass: 'text-white',
      // Heroicons: funnel
      svgPaths: [
        'M18.75 4.5H5.25a.75.75 0 0 0-.596 1.207l6.196 7.43V18a.75.75 0 0 0 1.04.692l2.25-.9A.75.75 0 0 0 14.25 17v-3.863l6.196-7.43A.75.75 0 0 0 18.75 4.5z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'search-engine',
    label: 'Search Engine',
    category: 'data',
    sortOrder: 1,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-amber-700',
      borderClass: 'border-amber-500',
      iconColorClass: 'text-white',
      // Heroicons: magnifying-glass
      svgPaths: [
        'M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5zM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'graph-db',
    label: 'Graph Database',
    category: 'data',
    sortOrder: 2,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 112,
    minWidth: 96,
    minHeight: 112,
    visual: {
      shape: 'cylinder',
      bgClass: 'bg-purple-700',
      borderClass: 'border-purple-500',
      iconColorClass: 'text-white',
      // Heroicons: share (connected nodes)
      svgPaths: [
        'M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755z',
      ],
    },
  },
  {
    kind: 'time-series-db',
    label: 'Time-Series DB',
    category: 'data',
    sortOrder: 3,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 112,
    minWidth: 96,
    minHeight: 112,
    visual: {
      shape: 'cylinder',
      bgClass: 'bg-cyan-700',
      borderClass: 'border-cyan-500',
      iconColorClass: 'text-white',
      // Heroicons: clock
      svgPaths: [
        'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'data-pipeline',
    label: 'Data Pipeline',
    category: 'data',
    sortOrder: 4,
    role: 'process',
    defaultWidth: 120,
    defaultHeight: 96,
    minWidth: 112,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-teal-700',
      borderClass: 'border-teal-500',
      iconColorClass: 'text-white',
      // Heroicons: arrows-right-left
      svgPaths: [
        'm7.5 21 3-3m0 0 3 3m-3-3v-4.5m6-10.5L15 3m0 0-3 3m3-3v4.5m6 0h-4.5m0 0-3-3m3 3-3 3M3 12h4.5m0 0 3-3m-3 3 3 3',
      ],
    },
  },

  // ─── External Services ────────────────────────────────────────────────────

  {
    kind: 'third-party-api',
    label: '3rd Party API',
    category: 'external',
    sortOrder: 0,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'cloud',
      bgClass: 'bg-gray-700',
      borderClass: 'border-gray-500',
      iconColorClass: 'text-white',
      // Heroicons: link
      svgPaths: [
        'M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244',
      ],
    },
  },
  {
    kind: 'email-service',
    label: 'Email Service',
    category: 'external',
    sortOrder: 1,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-sky-600',
      borderClass: 'border-sky-400',
      iconColorClass: 'text-white',
      // Heroicons: envelope
      svgPaths: [
        'M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67z',
        'M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908z',
      ],
    },
  },
  {
    kind: 'sms-service',
    label: 'SMS Service',
    category: 'external',
    sortOrder: 2,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-green-600',
      borderClass: 'border-green-400',
      iconColorClass: 'text-white',
      // Heroicons: chat-bubble-left
      svgPaths: [
        'M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
      ],
    },
  },
  {
    kind: 'payment-gateway',
    label: 'Payment Gateway',
    category: 'external',
    sortOrder: 3,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-green-700',
      borderClass: 'border-green-500',
      iconColorClass: 'text-white',
      // Heroicons: credit-card
      svgPaths: [
        'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z',
      ],
    },
  },
  {
    kind: 'analytics',
    label: 'Analytics',
    category: 'external',
    sortOrder: 4,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-orange-600',
      borderClass: 'border-orange-400',
      iconColorClass: 'text-white',
      // Heroicons: chart-pie
      svgPaths: [
        'M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6z',
        'M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'identity-provider',
    label: 'Identity Provider',
    category: 'external',
    sortOrder: 5,
    role: 'entity',
    defaultWidth: 104,
    defaultHeight: 96,
    minWidth: 96,
    minHeight: 88,
    visual: {
      shape: 'rect',
      bgClass: 'bg-purple-700',
      borderClass: 'border-purple-500',
      iconColorClass: 'text-white',
      // Heroicons: identification
      svgPaths: [
        'M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15zm4.125 3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zm-3.873 8.703a4.126 4.126 0 0 1 7.746 0 .75.75 0 0 1-.351.92 7.47 7.47 0 0 1-3.522.877 7.47 7.47 0 0 1-3.522-.877.75.75 0 0 1-.351-.92zM15 8.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15zM14.25 12a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75zm.75 2.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15z',
      ],
      svgFillRule: 'evenodd',
    },
  },
  {
    kind: 'storage-provider',
    label: 'Cloud Storage',
    category: 'external',
    sortOrder: 6,
    role: 'entity',
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 88,
    minHeight: 88,
    visual: {
      shape: 'cloud',
      bgClass: 'bg-blue-700',
      borderClass: 'border-blue-500',
      iconColorClass: 'text-white',
      // Heroicons: cloud-arrow-up
      svgPaths: [
        'M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75z',
      ],
    },
  },
];

// --- Build the Map ---

export const BLOCK_REGISTRY: ReadonlyMap<string, BlockDefinition> = new Map(
  REGISTRY_ARRAY.map((def) => [def.kind, def])
);

// --- Helpers ---

export function getBlockDef(kind: string): BlockDefinition | undefined {
  return BLOCK_REGISTRY.get(kind);
}

export function getBlocksByCategory(category: BlockCategory): BlockDefinition[] {
  return REGISTRY_ARRAY.filter((d) => d.category === category).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

const CATEGORY_META: { id: BlockCategory; label: string; defaultOpen: boolean }[] = [
  { id: 'client',     label: 'Clients & Devices',          defaultOpen: true  },
  { id: 'compute',    label: 'Compute & Servers',           defaultOpen: true  },
  { id: 'storage',    label: 'Storage & Databases',         defaultOpen: false },
  { id: 'caching',    label: 'Caching',                     defaultOpen: false },
  { id: 'messaging',  label: 'Messaging & Events',          defaultOpen: false },
  { id: 'networking', label: 'Networking & Infrastructure', defaultOpen: false },
  { id: 'security',   label: 'Security & Identity',         defaultOpen: false },
  { id: 'monitoring', label: 'Monitoring & Observability',  defaultOpen: false },
  { id: 'data',       label: 'Data Processing',             defaultOpen: false },
  { id: 'external',   label: 'External Services',           defaultOpen: false },
];

export function getAllCategories(): CategoryMeta[] {
  return CATEGORY_META.map((meta) => ({
    ...meta,
    blocks: getBlocksByCategory(meta.id),
  }));
}
