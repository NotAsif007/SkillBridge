import { z } from 'zod';

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

export const devLoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['STUDENT', 'COLLEGE_ADMIN', 'SUPER_ADMIN']).default('STUDENT'),
  name: z.string().min(1).optional(),
  organizationId: z.string().optional(),
  departmentId: z.string().optional(),
});