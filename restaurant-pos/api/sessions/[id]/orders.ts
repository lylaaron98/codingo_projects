import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../../backend/lib/db';
import Session from '../../../backend/models/Session';
import Order from '../../../backend/models/Order';
import MenuItem from '../../../backend/models/MenuItem';
import { requireAuth } from '../../../backend/middleware/auth';
import { requireRole } from '../../../backend/middleware/role';
import { createOrderSchema } from '../../../backend/validators/order';
import {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendError,
  sendServerError,
  handleCors,
} from '../../../backend/lib/responses';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const authReq = await requireAuth(req, res);
    if (!authReq) return;
    if (!(await requireRole(authReq, res, ['WAITER']))) return;

    const { id } = req.query;

    const validation = createOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    // Find session
    const session = await Session.findById(id);
    if (!session) {
      return sendNotFound(res, 'Session not found');
    }

    if (session.status === 'CLOSED') {
      return sendError(res, 'Cannot add orders to closed session', 400);
    }

    // Fetch menu items and create snapshots
    const { items } = validation.data;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return sendError(
          res,
          `Menu item not found: ${item.menuItemId}`,
          400
        );
      }

      if (!menuItem.isAvailable) {
        return sendError(res, `Menu item not available: ${menuItem.name}`, 400);
      }

      orderItems.push({
        menuItemId: menuItem._id,
        nameSnapshot: menuItem.name,
        priceSnapshot: menuItem.price,
        categorySnapshot: menuItem.category,
        qty: item.qty,
        notes: item.notes || '',
      });
    }

    // Create order
    const newOrder = await Order.create({
      sessionId: session._id,
      items: orderItems,
      status: 'NEW',
      createdAt: new Date(),
    });

    return sendSuccess(res, { order: newOrder }, 201);
  } catch (error) {
    console.error('Create order error:', error);
    return sendServerError(res);
  }
}
