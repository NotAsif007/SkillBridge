import { z } from 'zod';

export const analyzeResumeSchema = z.object({
  resumeText: z.string().min(20, 'Resume text must be at least 20 characters'),
  fileName: z.string().optional().default('resume.txt'),
  targetCareer: z.string().optional(),
});