import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../../backend/lib/db';
import Session from '../../../backend/models/Session';
import Order from '../../../backend/models/Order';
import Payment from '../../../backend/models/Payment';
import Table from '../../../backend/models/Table';
import { requireAuth } from '../../../backend/middleware/auth';
import { requireRole } from '../../../backend/middleware/role';
import { paymentSchema } from '../../../backend/validators/session';

// Register Table model for populate
void Table;
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
    if (!(await requireRole(authReq, res, ['CASHIER', 'MANAGER']))) return;

    const validation = paymentSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const { id } = req.query;
    const { method } = validation.data;

    // Find session
    const session = await Session.findById(id).populate('tableId');
    if (!session) {
      return sendNotFound(res, 'Session not found');
    }

    if (session.status === 'CLOSED') {
      return sendError(res, 'Session is already closed', 400);
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ sessionId: session._id });
    if (existingPayment) {
      return sendError(res, 'Payment already processed for this session', 400);
    }

    // Calculate total amount
    const orders = await Order.find({ sessionId: session._id });
    let amount = 0;
    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        amount += item.priceSnapshot * item.qty;
      });
    });

    // Add 10% tax
    amount = amount * 1.1;

    // Create payment
    const payment = await Payment.create({
      sessionId: session._id,
      amount,
      method,
      paidAt: new Date(),
    });

    // Close session
    session.status = 'CLOSED';
    session.closedAt = new Date();
    await session.save();

    // Free table
    const table = session.tableId as any;
    table.status = 'FREE';
    table.currentSessionId = null;
    await table.save();

    return sendSuccess(res, {
      payment: {
        id: payment._id,
        amount: payment.amount,
        method: payment.method,
        paidAt: payment.paidAt,
      },
      session: {
        id: session._id,
        status: session.status,
        closedAt: session.closedAt,
      },
      table: {
        id: table._id,
        tableNumber: table.tableNumber,
        status: table.status,
      },
    });
  } catch (error) {
    console.error('Payment error:', error);
    return sendServerError(res);
  }
}
