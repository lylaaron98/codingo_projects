import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../backend/lib/db';
import Order from '../../backend/models/Order';
import Session from '../../backend/models/Session';
import Table from '../../backend/models/Table';
import { requireAuth } from '../../backend/middleware/auth';
import { requireRole } from '../../backend/middleware/role';
import { sendSuccess, sendServerError, handleCors } from '../../backend/lib/responses';

// Session and Table imports required for Mongoose to register schemas for populate
void Session;
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
    if (!(await requireRole(authReq, res, ['KITCHEN']))) return;

    const { status } = req.query;

    // Build query filter
    const filter: any = {};
    if (status) {
      const statusArray = String(status)
        .split(',')
        .map((s) => s.trim());
      filter.status = { $in: statusArray };
    } else {
      // Default: show NEW and IN_PROGRESS orders
      filter.status = { $in: ['NEW', 'IN_PROGRESS'] };
    }

    // Get orders with session/table info
    const orders = await Order.find(filter)
      .populate({
        path: 'sessionId',
        populate: {
          path: 'tableId',
        },
      })
      .sort({ createdAt: 1 });

    // Transform for frontend
    const ordersWithTableInfo = orders.map((order) => {
      const session = order.sessionId as any;
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
    return sendServerError(res);
  }
}
