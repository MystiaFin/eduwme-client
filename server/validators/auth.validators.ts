import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(4, "Username must be at least 4 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    email: z.string().email(),
    password: z.string().min(8),
    confirm_password: z.string().min(8),
  })
  .refine((data) => data.password === data.confirm_password, {});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(2),
});
