import express from 'express';
import Order from '../models/Order.js';
import Session from '../models/Session.js';
import Table from '../models/Table.js';
import { updateOrderStatusSchema } from '../validators/order.ts';
import { requireAuth, requireRole } from '../middleware/auth-express.js';
import {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
} from '../lib/responses-express.js';

const router = express.Router();

// GET /api/orders/kitchen - Get kitchen orders
router.get('/kitchen', requireAuth, requireRole('KITCHEN'), async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      const statusArray = String(status).split(',').map((s) => s.trim());
      filter.status = { $in: statusArray };
    } else {
      filter.status = { $in: ['NEW', 'IN_PROGRESS'] };
    }

    const orders = await Order.find(filter)
      .populate({
        path: 'sessionId',
        populate: {
          path: 'tableId',
        },
      })
      .sort({ createdAt: 1 });

    const ordersWithTableInfo = orders.map((order) => {
      const session = order.sessionId;
      const table = session?.tableId;

      return {
        _id: order._id,
        sessionId: order.sessionId,
        tableNumber: table?.tableNumber || 'Unknown',
        items: order.items,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return sendSuccess(res, { orders: ordersWithTableInfo });
  } catch (error) {
    console.error('Kitchen orders error:', error);
    return sendServerError(res, error);
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', requireAuth, requireRole('KITCHEN'), async (req, res) => {
  try {
    const validation = updateOrderStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const { status } = validation.data;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return sendNotFound(res, 'Order not found');
    }

    return sendSuccess(res, { order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    return sendServerError(res, error);
  }
});

export default router;
