import express from 'express';
import Session from '../models/Session.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { openSessionSchema, paymentSchema } from '../validators/session.ts';
import { createOrderSchema } from '../validators/order.ts';
import { requireAuth, requireRole } from '../middleware/auth-express.js';
import {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendError,
  sendServerError,
} from '../lib/responses-express.js';

const router = express.Router();

// POST /api/sessions/open - Open new session
router.post('/open', requireAuth, requireRole('WAITER', 'MANAGER'), async (req, res) => {
  try {
    const validation = openSessionSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const { tableId } = validation.data;

    const table = await Table.findById(tableId);
    if (!table) {
      return sendNotFound(res, 'Table not found');
    }

    if (table.status === 'OCCUPIED') {
      return sendError(res, 'Table is already occupied', 400);
    }

    const existingSession = await Session.findOne({
      tableId: table._id,
      status: 'OPEN',
    });

    if (existingSession) {
      return sendError(res, 'Table already has an open session', 400);
    }

    const newSession = await Session.create({
      tableId: table._id,
      status: 'OPEN',
      openedAt: new Date(),
    });

    table.status = 'OCCUPIED';
    table.currentSessionId = newSession._id;
    await table.save();

    return sendSuccess(
      res,
      {
        session: newSession,
        table: {
          id: table._id,
          tableNumber: table.tableNumber,
          status: table.status,
        },
      },
      201
    );
  } catch (error) {
    console.error('Open session error:', error);
    return sendServerError(res, error);
  }
});

// GET /api/sessions/:id/bill - Get bill for session
router.get('/:id/bill', requireAuth, requireRole('CASHIER', 'MANAGER'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('tableId');
    if (!session) {
      return sendNotFound(res, 'Session not found');
    }

    if (session.status === 'CLOSED') {
      return sendError(res, 'Session is already closed', 400);
    }

    const orders = await Order.find({ sessionId: session._id }).lean();
    
    console.log('[BILL DEBUG] Session ID:', session._id);
    console.log('[BILL DEBUG] Found orders:', orders.length);
    if (orders.length > 0) {
      console.log('[BILL DEBUG] First order items:', orders[0].items);
    }

    const itemsMap = new Map();
    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
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
      }
    });

    const items = Array.from(itemsMap.values());
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    console.log('[BILL DEBUG] Total items in bill:', items.length);
    console.log('[BILL DEBUG] Bill items:', items);

    return sendSuccess(res, {
      bill: {
        sessionId: session._id,
        tableNumber: session.tableId.tableNumber,
        openedAt: session.openedAt,
        items,
        total,
      },
    });
  } catch (error) {
    console.error('Get bill error:', error);
    return sendServerError(res, error);
  }
});

// POST /api/sessions/:id/orders - Create order for session
router.post('/:id/orders', requireAuth, requireRole('WAITER', 'MANAGER'), async (req, res) => {
  try {
    const validation = createOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return sendNotFound(res, 'Session not found');
    }

    if (session.status === 'CLOSED') {
      return sendError(res, 'Cannot add orders to closed session', 400);
    }

    // Get menu items for price snapshots
    const menuItemIds = validation.data.items.map((item) => item.menuItemId);
    const MenuItem = (await import('../models/MenuItem.js')).default;
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    const orderItems = validation.data.items.map((item) => {
      const menuItem = menuItems.find((mi) => mi._id.toString() === item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }
      return {
        menuItemId: menuItem._id,
        nameSnapshot: menuItem.name,
        priceSnapshot: menuItem.price,
        qty: item.qty,
        notes: item.notes,
      };
    });

    const newOrder = await Order.create({
      sessionId: session._id,
      items: orderItems,
      status: 'NEW',
    });

    return sendSuccess(res, { order: newOrder }, 201);
  } catch (error) {
    console.error('Create order error:', error);
    return sendServerError(res, error);
  }
});

// POST /api/sessions/:id/pay - Pay for session
router.post('/:id/pay', requireAuth, requireRole('CASHIER', 'MANAGER'), async (req, res) => {
  try {
    const validation = paymentSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const session = await Session.findById(req.params.id).populate('tableId');
    if (!session) {
      return sendNotFound(res, 'Session not found');
    }

    if (session.status === 'CLOSED') {
      return sendError(res, 'Session is already closed', 400);
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ sessionId: session._id });
    if (existingPayment) {
      return sendError(res, 'Session is already paid', 400);
    }

    const orders = await Order.find({ sessionId: session._id });
    const total = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        return itemSum + (item.priceSnapshot * item.qty);
      }, 0);
    }, 0);

    const payment = await Payment.create({
      sessionId: session._id,
      amount: total,
      method: validation.data.method,
      paidAt: new Date(),
    });

    session.status = 'CLOSED';
    session.closedAt = new Date();
    await session.save();

    const table = session.tableId;
    table.status = 'FREE';
    table.currentSessionId = null;
    await table.save();

    return sendSuccess(res, { payment, session });
  } catch (error) {
    console.error('Payment error:', error);
    return sendServerError(res, error);
  }
});

// POST /api/sessions/:id/close - Close session
router.post('/:id/close', requireAuth, requireRole('WAITER', 'CASHIER', 'MANAGER'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('tableId');
    if (!session) {
      return sendNotFound(res, 'Session not found');
    }

    if (session.status === 'CLOSED') {
      return sendError(res, 'Session is already closed', 400);
    }

    session.status = 'CLOSED';
    session.closedAt = new Date();
    await session.save();

    const table = session.tableId;
    table.status = 'FREE';
    table.currentSessionId = null;
    await table.save();

    return sendSuccess(res, { session });
  } catch (error) {
    console.error('Close session error:', error);
    return sendServerError(res, error);
  }
});

export default router;
