import {z} from 'zod';

export const profileSchema = z.object({
    userId: z.string().min(1),
    nickname: z.string().optional(),
    biodata: z.string().optional(),
    profilePicture: z.string().optional(),
})