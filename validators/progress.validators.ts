import { z } from 'zod';

export const completeExerciseSchema = z.object({
  courseBatchId: z.string(),
  courseId: z.string(),
  exerciseId: z.string(),
  score: z.number().min(0).optional(),
});