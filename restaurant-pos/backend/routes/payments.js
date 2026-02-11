import express from 'express';
import Payment from '../models/Payment.js';
import Session from '../models/Session.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';
import { requireAuth, requireRole } from '../middleware/auth-express.js';
import {
  sendSuccess,
  sendServerError,
} from '../lib/responses-express.js';

const router = express.Router();

// GET /api/payments/history - Get payment history
router.get('/history', requireAuth, requireRole('CASHIER', 'MANAGER'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    
    if (startDate || endDate) {
      query.paidAt = {};
      if (startDate) {
        const start = new Date(String(startDate));
        start.setHours(0, 0, 0, 0);
        query.paidAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(String(endDate));
        end.setHours(23, 59, 59, 999);
        query.paidAt.$lte = end;
      }
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'sessionId',
        populate: { path: 'tableId' }
      })
      .sort({ paidAt: -1 })
      .lean();

    const history = await Promise.all(
      payments.map(async (payment) => {
        const session = payment.sessionId;
        const table = session?.tableId;
        
        const orders = await Order.find({ sessionId: session?._id }).lean();
        
        const itemsMap = new Map();
        
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const key = item.nameSnapshot;
            const existing = itemsMap.get(key);
            
            if (existing) {
              existing.qty += item.qty;
              existing.subtotal += item.priceSnapshot * item.qty;
            } else {
              itemsMap.set(key, {
                name: item.nameSnapshot,
                price: item.priceSnapshot,
                qty: item.qty,
                subtotal: item.priceSnapshot * item.qty,
              });
            }
          });
        });
        
        const items = Array.from(itemsMap.values());
        
        return {
          _id: payment._id,
          tableNumber: table?.tableNumber || 'Unknown',
          amount: payment.amount,
          method: payment.method,
          paidAt: payment.paidAt,
          sessionId: session?._id,
          openedAt: session?.openedAt,
          closedAt: session?.closedAt,
          orderIds: orders.map((o) => o._id),
          items,
        };
      })
    );

    return sendSuccess(res, { history });
  } catch (error) {
    console.error('Payment history error:', error);
    return sendServerError(res, error);
  }
});

export default router;
