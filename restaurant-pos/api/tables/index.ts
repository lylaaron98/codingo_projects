import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../backend/lib/db';
import Table from '../../backend/models/Table';
import { requireAuth } from '../../backend/middleware/auth';
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

    const tables = await Table.find()
      .sort({ tableNumber: 1 })
      .lean();

    return sendSuccess(res, { tables });
  } catch (error) {
    console.error('Tables error:', error);
    return sendServerError(res);
  }
}
