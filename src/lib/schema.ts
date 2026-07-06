import { z } from 'zod';

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  icon: z.string(),
});

export const MapDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  minimap: z.string(),
});

export const LineupImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
  type: z.string(), // 'position' | 'crosshair' | 'result'
});

export const LineupVideoSchema = z.object({
  type: z.string(), // 'youtube'
  videoId: z.string(),
  startSeconds: z.number().optional(),
});

export const MinimapMarkSchema = z.object({
  x: z.number(),
  y: z.number(),
  angle: z.number().optional(),
});

export const LineupMediaSchema = z.object({
  images: z.array(LineupImageSchema),
  video: LineupVideoSchema.optional(),
  minimapMark: MinimapMarkSchema,
  standMark: MinimapMarkSchema.optional(),
});

export const LineupDetailsSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.string(),
  side: z.union([z.literal('attack'), z.literal('defense')]),
  site: z.string(),
  ability: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'pro-only']),
  tags: z.array(z.string()),
  media: LineupMediaSchema,
});

export const LineupSchema = z.object({
  id: z.string().uuid(),
  version: z.number(),
  agent: AgentSchema,
  map: MapDataSchema,
  lineup: LineupDetailsSchema,
  isCustom: z.boolean().optional(),
  isBookmarked: z.boolean().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
});

export const LineupListSchema = z.array(LineupSchema);
