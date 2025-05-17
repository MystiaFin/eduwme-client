import { z } from 'zod';

export const courseBatchSchema = z.object({
    courseBatchId: z.string().min(1),
    stage: z.number().int().positive(),
    courseList: z.array(z.string()).nonempty(),
})

export const courseBatchUpdateSchema = z.object({
    courseBatchId: z.string().min(1),
    stage: z.number().int().positive(),
    courseList: z.array(z.string()).nonempty(),
}).partial()



