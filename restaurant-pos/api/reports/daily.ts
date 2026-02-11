import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../backend/lib/db';
import Payment from '../../backend/models/Payment';
import { requireAuth } from '../../backend/middleware/auth';
import { requireRole } from '../../backend/middleware/role';
import { sendSuccess, sendServerError, handleCors } from '../../backend/lib/responses';

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
    if (!(await requireRole(authReq, res, ['MANAGER']))) return;

    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Parse date and create range
    const targetDate = new Date(String(date));
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get all payments for the day
    const payments = await Payment.find({
      paidAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Calculate stats
    const totalRevenue = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const totalOrders = payments.length;

    // Get unique sessions (customers)
    const sessionIds = new Set(
      payments.map((p) => p.sessionId.toString())
    );
    const totalCustomers = sessionIds.size;

    // Payment method breakdown
    const cashPayments = payments.filter(
      (p) => p.method === 'CASH'
    ).length;
    const cardPayments = payments.filter(
      (p) => p.method === 'CARD'
    ).length;

    return sendSuccess(res, {
      date: String(date),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalCustomers,
      paymentMethods: {
        cash: cashPayments,
        card: cardPayments,
      },
    });
  } catch (error) {
    console.error('Daily report error:', error);
    return sendServerError(res);
  }
}
