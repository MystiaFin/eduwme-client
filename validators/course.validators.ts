import { z } from 'zod';

export const courseSchema = z.object({
    courseId: z.string().min(1),
    level: z.number().int().positive(),
    exerciseBatchList: z.array(z.string()).nonempty(),
})