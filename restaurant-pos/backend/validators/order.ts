import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1, 'Menu item ID is required'),
        qty: z.number().int().min(1, 'Quantity must be at least 1'),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'READY', 'SERVED'], {
    errorMap: () => ({
      message: 'Status must be NEW, IN_PROGRESS, READY, or SERVED',
    }),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
