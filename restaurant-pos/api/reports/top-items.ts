import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../backend/lib/db';
import Order from '../../backend/models/Order';
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

    const { from, to } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (from) {
      dateFilter.$gte = new Date(String(from));
    }
    if (to) {
      const endDate = new Date(String(to));
      endDate.setHours(23, 59, 59, 999);
      dateFilter.$lte = endDate;
    }

    // Get all orders in date range
    const filter = Object.keys(dateFilter).length
      ? { createdAt: dateFilter }
      : {};

    const orders = await Order.find(filter);

    // Aggregate by item
    const itemStats = new Map<
      string,
      {
        name: string;
        category: string;
        totalQty: number;
        totalRevenue: number;
      }
    >();

    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const key = item.nameSnapshot;
        if (itemStats.has(key)) {
          const stats = itemStats.get(key)!;
          stats.totalQty += item.qty;
          stats.totalRevenue += item.priceSnapshot * item.qty;
        } else {
          itemStats.set(key, {
            name: item.nameSnapshot,
            category: item.categorySnapshot,
            totalQty: item.qty,
            totalRevenue: item.priceSnapshot * item.qty,
          });
        }
      });
    });

    // Convert to array and sort by revenue
    const topItems = Array.from(itemStats.values())
      .map((item) => ({
        ...item,
        totalRevenue: Number(item.totalRevenue.toFixed(2)),
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10); // Top 10 items

    return sendSuccess(res, {
      items: topItems,
      dateRange: {
        from: from || 'all',
        to: to || 'all',
      },
    });
  } catch (error) {
    console.error('Top items report error:', error);
    return sendServerError(res);
  }
}
