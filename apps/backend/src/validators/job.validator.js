import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  location: z.string().optional().default('Remote'),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']).optional().default('FULL_TIME'),
  workplaceType: z.enum(['ON_SITE', 'HYBRID', 'REMOTE']).optional().default('REMOTE'),
  description: z.string().min(10, 'Job description must be at least 10 characters'),
  salaryRange: z
    .object({
      min: z.number().optional().default(0),
      max: z.number().optional().default(0),
      currency: z.string().optional().default('INR'),
    })
    .optional(),
  eligibility: z
    .object({
      minCgpa: z.number().min(0).max(10).optional().default(0),
      eligibleDepartments: z.array(z.string()).optional().default([]),
      graduationYears: z.array(z.number()).optional().default([]),
    })
    .optional(),
  requiredSkills: z
    .array(
      z.object({
        skillId: z.string(),
        minProficiency: z.number().int().min(1).max(5).optional().default(3),
        weight: z.number().int().min(1).max(10).optional().default(5),
      })
    )
    .optional()
    .default([]),
  deadline: z.string().datetime().optional().or(z.date().optional()),
});

export const applyJobSchema = z.object({
  coverLetter: z.string().optional().default(''),
  resumeId: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED']),
  notes: z.string().optional().default(''),
});