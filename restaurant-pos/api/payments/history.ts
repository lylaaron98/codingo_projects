import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../backend/lib/db';
import Payment from '../../backend/models/Payment';
import Session from '../../backend/models/Session';
import Table from '../../backend/models/Table';
import { requireAuth } from '../../backend/middleware/auth';
import { requireRole } from '../../backend/middleware/role';
import { sendSuccess, sendServerError, handleCors } from '../../backend/lib/responses';

// Register models for populate
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
    if (!(await requireRole(authReq, res, ['CASHIER', 'MANAGER']))) return;

    const { startDate, endDate } = req.query;

    // Build query
    const query: any = {};
    
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

    // Fetch payments with session and table info
    const payments = await Payment.find(query)
      .populate({
        path: 'sessionId',
        populate: { path: 'tableId' }
      })
      .sort({ paidAt: -1 })
      .lean();

    const history = payments.map((payment: any) => {
      const session = payment.sessionId;
      const table = session?.tableId;
      
      return {
        _id: payment._id,
        tableNumber: table?.tableNumber || 'Unknown',
        amount: payment.amount,
        method: payment.method,
        paidAt: payment.paidAt,
        sessionId: session?._id,
        openedAt: session?.openedAt,
        closedAt: session?.closedAt,
      };
    });

    return sendSuccess(res, { history });
  } catch (error) {
    console.error('Payment history error:', error);
    return sendServerError(res);
  }
}
