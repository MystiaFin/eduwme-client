import { z } from 'zod';

export const courseSchema = z.object({
    courseBatchId: z.string().min(1),
    courseId: z.string().min(1),
    title: z.string().min(1),
    level: z.number().int().positive(),
    logo: z.string().optional(),
})

export const courseUpdateSchema = z.object({
    courseBatchId: z.string().min(1),
    courseId: z.string().min(1),
    title: z.string().min(1),
    level: z.number().int().positive(),
    logo: z.string().optional(),
})

