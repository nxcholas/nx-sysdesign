import { z } from 'zod';

const MAX_ITEMS = 500;
const MAX_STRING = 512;
const MAX_TEXT = 10_000;

// PaletteItemKind — union matching lib/types.ts exactly
const paletteItemKindSchema = z.union([
  z.object({ type: z.literal('block'), kind: z.string().max(128) }),
  z.object({ type: z.literal('text-block') }),
  z.object({ type: z.literal('shape'), shape: z.string().max(128) }),
  z.object({ type: z.literal('http-method'), method: z.string().max(32) }),
  z.object({
    type: z.literal('status-code'),
    group: z.string().max(64),
    code: z.number().optional(),
    label: z.string().max(MAX_STRING).optional(),
  }),
]);

// PlacedComponent — flat x/y/width/height matching lib/types.ts
const placedComponentSchema = z.object({
  id: z.string().max(128),
  kind: paletteItemKindSchema,
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  zIndex: z.number(),
  label: z.string().max(MAX_STRING).optional(),
  frameId: z.string().max(128).optional(),
  text: z.string().max(MAX_TEXT).optional(),
  textStyle: z.object({
    fontSize: z.number(),
    bold: z.boolean(),
    italic: z.boolean(),
    underline: z.boolean(),
    strikethrough: z.boolean(),
    color: z.string().max(32),
    align: z.enum(['left', 'center', 'right']),
  }).optional(),
  shapeStyle: z.object({
    fill: z.string().max(32),
    stroke: z.string().max(32),
    strokeWidth: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }).optional(),
  tableData: z.unknown().optional(), // complex nested structure, validated loosely
}).loose(); // allow future fields without breaking saves

// Connection — sourceId/targetId/sourcePort/targetPort matching lib/types.ts
const connectionSchema = z.object({
  id: z.string().max(128),
  sourceId: z.string().max(128),
  targetId: z.string().max(128),
  sourcePort: z.unknown(),
  targetPort: z.unknown(),
  cardinality: z.unknown().optional(),
}).loose();

// Frame — flat x/y/width/height/label/zIndex matching lib/types.ts
const frameSchema = z.object({
  id: z.string().max(128),
  label: z.string().max(MAX_STRING),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  zIndex: z.number(),
  parentFrameId: z.string().max(128).optional(),
}).loose();

const viewportSchema = z.object({
  scale: z.number().positive().max(100),
  translateX: z.number(),
  translateY: z.number(),
});

export const diagramBodySchema = z.object({
  name: z.string().max(256).optional(),
  components: z.array(placedComponentSchema).max(MAX_ITEMS).optional().default([]),
  connections: z.array(connectionSchema).max(MAX_ITEMS).optional().default([]),
  frames: z.array(frameSchema).max(MAX_ITEMS).optional().default([]),
  viewport: viewportSchema.optional().default({ scale: 1, translateX: 0, translateY: 0 }),
});

export type DiagramBody = z.infer<typeof diagramBodySchema>;

const MAX_BODY_BYTES = 256 * 1024; // 256 KB

export async function parseDiagramBody(req: Request): Promise<DiagramBody | null> {
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) return null;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return null;
  }

  const result = diagramBodySchema.safeParse(raw);
  if (!result.success) {
    console.error('[diagram-schema] validation failed:', result.error.issues.slice(0, 5));
  }
  return result.success ? result.data : null;
}
