import type {
  HttpMethod,
  StatusCodeGroup,
  StatusCode,
  PaletteSection,
} from './types';
import { getAllCategories } from './block-registry';

// --- Grid ---
export const GRID_SIZE = 8;
export const CANVAS_MIN_SCALE = 0.25;
export const CANVAS_MAX_SCALE = 4.0;
export const CANVAS_ZOOM_STEP = 0.001;

// --- Frame ---
export const FRAME_PADDING = 24;
export const FRAME_LABEL_HEIGHT = 28;
export const FRAME_MIN_WIDTH = 96;
export const FRAME_MIN_HEIGHT = 96;
export const FRAME_DEFAULT_LABEL = 'Untitled Container';

// --- HTTP Methods ---
export const HTTP_METHODS: HttpMethod[] = [
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS',
];

export const HTTP_METHOD_COLORS: Record<HttpMethod, { bg: string; text: string }> = {
  GET:     { bg: 'bg-green-600',  text: 'text-white' },
  POST:    { bg: 'bg-blue-600',   text: 'text-white' },
  PUT:     { bg: 'bg-amber-600',  text: 'text-white' },
  PATCH:   { bg: 'bg-violet-600', text: 'text-white' },
  DELETE:  { bg: 'bg-red-600',    text: 'text-white' },
  HEAD:    { bg: 'bg-slate-500',  text: 'text-white' },
  OPTIONS: { bg: 'bg-slate-500',  text: 'text-white' },
};

// --- Status Codes ---
export const STATUS_CODE_GROUPS: StatusCodeGroup[] = ['1xx', '2xx', '3xx', '4xx', '5xx'];

export const STATUS_CODE_GROUP_LABELS: Record<StatusCodeGroup, string> = {
  '1xx': 'Informational',
  '2xx': 'Success',
  '3xx': 'Redirection',
  '4xx': 'Client Error',
  '5xx': 'Server Error',
};

export const STATUS_CODE_COLORS: Record<StatusCodeGroup, { bg: string; text: string }> = {
  '1xx': { bg: 'bg-slate-500',  text: 'text-white' },
  '2xx': { bg: 'bg-green-600',  text: 'text-white' },
  '3xx': { bg: 'bg-blue-500',   text: 'text-white' },
  '4xx': { bg: 'bg-amber-600',  text: 'text-white' },
  '5xx': { bg: 'bg-red-600',    text: 'text-white' },
};

export const STATUS_CODES: StatusCode[] = [
  // 1xx
  { code: 100, label: 'Continue',             group: '1xx' },
  { code: 101, label: 'Switching Protocols',  group: '1xx' },
  { code: 102, label: 'Processing',           group: '1xx' },
  // 2xx
  { code: 200, label: 'OK',                   group: '2xx' },
  { code: 201, label: 'Created',              group: '2xx' },
  { code: 204, label: 'No Content',           group: '2xx' },
  { code: 206, label: 'Partial Content',      group: '2xx' },
  // 3xx
  { code: 301, label: 'Moved Permanently',    group: '3xx' },
  { code: 302, label: 'Found',                group: '3xx' },
  { code: 304, label: 'Not Modified',         group: '3xx' },
  { code: 307, label: 'Temp Redirect',        group: '3xx' },
  { code: 308, label: 'Perm Redirect',        group: '3xx' },
  // 4xx
  { code: 400, label: 'Bad Request',          group: '4xx' },
  { code: 401, label: 'Unauthorized',         group: '4xx' },
  { code: 403, label: 'Forbidden',            group: '4xx' },
  { code: 404, label: 'Not Found',            group: '4xx' },
  { code: 405, label: 'Method Not Allowed',   group: '4xx' },
  { code: 408, label: 'Request Timeout',      group: '4xx' },
  { code: 409, label: 'Conflict',             group: '4xx' },
  { code: 422, label: 'Unprocessable',        group: '4xx' },
  { code: 429, label: 'Too Many Requests',    group: '4xx' },
  // 5xx
  { code: 500, label: 'Internal Server Error', group: '5xx' },
  { code: 501, label: 'Not Implemented',      group: '5xx' },
  { code: 502, label: 'Bad Gateway',          group: '5xx' },
  { code: 503, label: 'Service Unavailable',  group: '5xx' },
  { code: 504, label: 'Gateway Timeout',      group: '5xx' },
];

// --- Badge Dimensions (HTTP methods + status codes) ---
export const BADGE_DIMENSIONS = { width: 96, height: 40 };

// --- Palette Sections (drives the side panel — pure data) ---

const httpMethodsSection: PaletteSection = {
  id: 'http-methods',
  label: 'HTTP Methods',
  defaultOpen: true,
  items: HTTP_METHODS.map((method) => ({
    id: `method-${method}`,
    label: method,
    dragPayload: { type: 'http-method' as const, method },
  })),
};

const statusCodesSection: PaletteSection = {
  id: 'status-codes',
  label: 'Status Codes',
  defaultOpen: true,
  items: STATUS_CODE_GROUPS.map((group) => ({
    id: `status-group-${group}`,
    label: `${group} — ${STATUS_CODE_GROUP_LABELS[group]}`,
    dragPayload: { type: 'status-code' as const, group },
  })),
};

const blockSections: PaletteSection[] = getAllCategories().map((cat) => ({
  id: `blocks-${cat.id}`,
  label: cat.label,
  defaultOpen: cat.defaultOpen,
  items: cat.blocks.map((def) => ({
    id: `block-${def.kind}`,
    label: def.label,
    dragPayload: { type: 'block' as const, kind: def.kind },
  })),
}));

const PRIORITY_CATEGORY_ORDER = ['entity-relation', 'client', 'compute', 'storage'];

export const PALETTE_SECTIONS: PaletteSection[] = [
  // Priority block sections in specified order
  ...PRIORITY_CATEGORY_ORDER
    .map((catId) => blockSections.find((s) => s.id === `blocks-${catId}`))
    .filter((s): s is PaletteSection => s !== undefined),
  // Remaining block sections not in the priority list
  ...blockSections.filter((s) => !PRIORITY_CATEGORY_ORDER.some((catId) => s.id === `blocks-${catId}`)),
  // HTTP helpers last
  httpMethodsSection,
  statusCodesSection,
];
