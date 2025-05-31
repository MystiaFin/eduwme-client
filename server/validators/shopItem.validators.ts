import { z } from 'zod';

export const createShopItemSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  imageUrl: z.string().optional(),
  price: z.number().min(1),
  category: z.enum(['avatar', 'background', 'badge', 'theme', 'powerup']),
  isAvailable: z.boolean().optional(),
});

export const purchaseItemSchema = z.object({
  userId: z.string().min(1),
  itemId: z.string().min(1),
});

export const equipItemSchema = z.object({
  userId: z.string().min(1),
  itemId: z.string().min(1),
  equip: z.boolean(),
});