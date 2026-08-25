import { z } from 'zod';

export const updateProfileSchema = z.object({
  rollNumber: z.string().trim().max(50).optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  departmentId: z.string().optional(),
  interests: z.array(z.string().trim()).optional(),
  preferredRoles: z.array(z.string().trim()).optional(),
  preferredLocations: z.array(z.string().trim()).optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
});

export const addSkillSchema = z.object({
  skillId: z.string().min(1, 'Skill ID is required'),
  proficiencyLevel: z.number().int().min(1).max(5).default(1),
});

export const setTargetCareerSchema = z.object({
  careerId: z.string().min(1, 'Career ID is required'),
});