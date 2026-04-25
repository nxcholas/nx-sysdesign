import { z } from 'zod';

const MAX_ITEMS = 500;
const MAX_STRING = 512;
const MAX_TEXT = 10_000;

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const sizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

const paletteItemKindSchema = z.object({
  type: z.literal('block'),
  kind: z.string().max(128),
});

const placedComponentSchema = z.object({
  id: z.string().max(128),
  kind: paletteItemKindSchema,
  position: positionSchema,
  size: sizeSchema,
  label: z.string().max(MAX_STRING).optional(),
  text: z.string().max(MAX_TEXT).optional(),
  frameId: z.string().max(128).nullable().optional(),
  // allow extra fields from future versions without breaking
}).strip();

const connectionSchema = z.object({
  id: z.string().max(128),
  fromId: z.string().max(128),
  toId: z.string().max(128),
  label: z.string().max(MAX_STRING).optional(),
}).strip();

const frameSchema = z.object({
  id: z.string().max(128),
  name: z.string().max(MAX_STRING),
  position: positionSchema,
  size: sizeSchema,
  parentId: z.string().max(128).nullable().optional(),
}).strip();

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
  return result.success ? result.data : null;
}
