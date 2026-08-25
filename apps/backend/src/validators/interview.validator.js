import { z } from 'zod';

export const startSessionSchema = z.object({
  careerId: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().default('MEDIUM'),
  totalQuestions: z.number().int().min(1).max(10).optional().default(3),
});

export const submitAnswerSchema = z.object({
  answer: z.string().min(5, 'Answer must be at least 5 characters long'),
});