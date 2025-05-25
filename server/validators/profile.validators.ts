import {z} from 'zod';

export const profileSchema = z.object({
    userId: z.string().min(1),
    nickname: z.string().min(1).optional(),
    biodata: z.string().min(1).optional(),
    profilePicture: z.string().min(1).optional(),
})