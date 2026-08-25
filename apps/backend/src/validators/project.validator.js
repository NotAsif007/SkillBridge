import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  technologies: z.array(z.string().trim()).min(1, 'At least one technology is required'),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  liveDemoUrl: z.string().url('Invalid Demo URL').optional().or(z.literal('')),
  keyFeatures: z.array(z.string().trim()).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional().default('INTERMEDIATE'),
});

export const updateProjectSchema = createProjectSchema.partial();