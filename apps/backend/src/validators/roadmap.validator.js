import { z } from 'zod';

export const generateRoadmapSchema = z.object({
  careerId: z.string().optional(),
  durationWeeks: z.number().int().min(2).max(24).optional().default(8),
});

export const toggleTaskSchema = z.object({
  isCompleted: z.boolean(),
});