import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../../backend/lib/db';
import Order from '../../../backend/models/Order';
import { requireAuth } from '../../../backend/middleware/auth';
import { requireRole } from '../../../backend/middleware/role';
import { updateOrderStatusSchema } from '../../../backend/validators/order';
import {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
  handleCors,
} from '../../../backend/lib/responses';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const authReq = await requireAuth(req, res);
    if (!authReq) return;
    if (!(await requireRole(authReq, res, ['KITCHEN']))) return;

    const { id } = req.query;

    const validation = updateOrderStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const { status } = validation.data;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return sendNotFound(res, 'Order not found');
    }

    return sendSuccess(res, { order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    return sendServerError(res);
  }
}
