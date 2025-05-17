import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(8),
  confirm_password: z.string().min(8),
}).refine((data) => data.password === data.confirm_password, {
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});