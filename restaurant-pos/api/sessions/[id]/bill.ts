import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../../backend/lib/db';
import Session from '../../../backend/models/Session';
import Table from '../../../backend/models/Table';
import Order from '../../../backend/models/Order';
import { requireAuth } from '../../../backend/middleware/auth';
import { requireRole } from '../../../backend/middleware/role';
import {
  sendSuccess,
  sendNotFound,
  sendError,
  sendServerError,
  handleCors,
} from '../../../backend/lib/responses';

// Table import required for Mongoose to register schema for populate
void Table;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const authReq = await requireAuth(req, res);
    if (!authReq) return;
    if (!(await requireRole(authReq, res, ['CASHIER', 'MANAGER']))) return;

    const { id } = req.query;

    // Find session
    const session = await Session.findById(id).populate('tableId');
    if (!session) {
      return sendNotFound(res, 'Session not found');
    }

    if (session.status === 'CLOSED') {
      return sendError(res, 'Session is already closed', 400);
    }

    // Get all orders for this session
    const orders = await Order.find({ sessionId: session._id });

    // Calculate totals - group by item name
    const itemsMap = new Map<string, { name: string; price: number; qty: number; subtotal: number }>();

    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const key = item.nameSnapshot; // Group by name to consolidate duplicates
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
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return sendSuccess(res, {
      bill: {
        sessionId: session._id,
        tableNumber: (session.tableId as any).tableNumber,
        openedAt: session.openedAt,
        items,
        total,
      },
    });
  } catch (error) {
    console.error('Get bill error:', error);
    return sendServerError(res);
  }
}
