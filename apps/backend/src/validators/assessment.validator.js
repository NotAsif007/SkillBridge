import { z } from 'zod';

export const submitAssessmentSchema = z.object({
  attemptId: z.string().min(1, 'Attempt ID is required'),
  answers: z
    .array(
      z.object({
        questionIndex: z.number().int().min(0),
        selectedOptionIndex: z.number().int().min(0),
        timeTakenSeconds: z.number().min(0).optional(),
      })
    )
    .min(1, 'At least one answer must be submitted'),
});