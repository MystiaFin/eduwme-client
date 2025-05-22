import { z } from 'zod';

export const createExerciseSchema = z.object({
    exerciseId: z.string().min(1),
    courseId: z.string().min(1),
    courseBatchId: z.string().min(1), 
    title: z.string().min(1),
    dateCreated: z.date().optional(), 
    difficultyLevel: z.number().int().positive(), 
    animType: z.string().min(1), 
    type: z.string().min(1), 
    question: z.string().min(1), 
    answer: z.array(z.string()).min(1) 
});

export const updateExerciseSchema = z.object({
    exerciseId: z.string().min(1),
    courseId: z.string().min(1),
    courseBatchId: z.string().min(1), 
    title: z.string().min(1),
    dateCreated: z.date().optional(), 
    difficultyLevel: z.number().int().positive(), 
    animType: z.string().min(1), 
    type: z.string().min(1), 
    question: z.string().min(1), 
    answer: z.array(z.string()).min(1) 
}); 