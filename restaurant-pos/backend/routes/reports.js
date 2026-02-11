import express from 'express';
import Payment from '../models/Payment.js';
import Session from '../models/Session.js';
import Order from '../models/Order.js';
import { requireAuth, requireRole } from '../middleware/auth-express.js';
import {
  sendSuccess,
  sendServerError,
} from '../lib/responses-express.js';

const router = express.Router();

// GET /api/reports/daily - Get daily report
router.get('/daily', requireAuth, requireRole('MANAGER'), async (req, res) => {
  try {
    const { date } = req.query;

    const targetDate = date ? new Date(String(date)) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      paidAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const sessions = await Session.find({
      openedAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    return sendSuccess(res, {
      report: {
        date: targetDate.toISOString().split('T')[0],
        totalRevenue,
        totalOrders,
        totalCustomers: sessions.length,
      },
    });
  } catch (error) {
    console.error('Daily report error:', error);
    return sendServerError(res, error);
  }
});

// GET /api/reports/top-items - Get top selling items
router.get('/top-items', requireAuth, requireRole('MANAGER'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(String(startDate));
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(String(endDate));
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query).populate('items.menuItemId');

    const itemsMap = new Map();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.nameSnapshot;
        const existing = itemsMap.get(key);

        // Get category from populated menuItem, fallback to 'Unknown'
        const category = item.menuItemId?.category || 'Unknown';

        if (existing) {
          existing.totalQty += item.qty;
          existing.totalRevenue += item.priceSnapshot * item.qty;
          existing.orders += 1;
        } else {
          itemsMap.set(key, {
            name: item.nameSnapshot,
            category: category,
            totalQty: item.qty,
            totalRevenue: item.priceSnapshot * item.qty,
            orders: 1,
          });
        }
      });
    });

    const topItems = Array.from(itemsMap.values())
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 10);

    return sendSuccess(res, { items: topItems });
  } catch (error) {
    console.error('Top items error:', error);
    return sendServerError(res, error);
  }
});

// GET /api/reports/completed-orders - Get completed orders with bill details
router.get('/completed-orders', requireAuth, requireRole('MANAGER'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { status: 'CLOSED' };
    if (startDate || endDate) {
      query.closedAt = {};
      if (startDate) {
        const start = new Date(String(startDate));
        start.setHours(0, 0, 0, 0);
        query.closedAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(String(endDate));
        end.setHours(23, 59, 59, 999);
        query.closedAt.$lte = end;
      }
    }

    const sessions = await Session.find(query)
      .populate('tableId')
      .sort({ closedAt: -1 });

    const completedOrders = [];

    for (const session of sessions) {
      const orders = await Order.find({ sessionId: session._id });
      const payment = await Payment.findOne({ sessionId: session._id });

      if (payment && orders.length > 0) {
        const items = [];
        let totalAmount = 0;

        orders.forEach((order) => {
          order.items.forEach((item) => {
            const subtotal = item.priceSnapshot * item.qty;
            totalAmount += subtotal;
            items.push({
              name: item.nameSnapshot,
              price: item.priceSnapshot,
              qty: item.qty,
              subtotal: subtotal,
              notes: item.notes,
            });
          });
        });

        completedOrders.push({
          sessionId: session._id,
          tableNumber: session.tableId?.tableNumber || 'N/A',
          items: items,
          totalAmount: payment.amount,
          paymentMethod: payment.method,
          openedAt: session.openedAt,
          closedAt: session.closedAt,
          paidAt: payment.paidAt,
        });
      }
    }

    return sendSuccess(res, { orders: completedOrders });
  } catch (error) {
    console.error('Completed orders error:', error);
    return sendServerError(res, error);
  }
});

export default router;
