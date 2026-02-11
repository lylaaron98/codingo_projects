import { z } from 'zod';

export const openSessionSchema = z.object({
  tableId: z.string().min(1, 'Table ID is required'),
});

export const paymentSchema = z.object({
  method: z.enum(['CASH', 'CARD'], {
    errorMap: () => ({ message: 'Method must be CASH or CARD' }),
  }),
});

export type OpenSessionInput = z.infer<typeof openSessionSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
