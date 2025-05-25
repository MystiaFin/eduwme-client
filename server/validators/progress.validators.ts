import { z } from 'zod';

export const completeSchema = z.object({
  userId: z.string().nonempty(),
  courseBatchId: z.string().nonempty(),
  courseId: z.string().nonempty(),
  exerciseId: z.string().nonempty(),
});