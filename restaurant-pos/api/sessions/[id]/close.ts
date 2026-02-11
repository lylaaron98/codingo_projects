import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Types } from 'mongoose';
import { connectToDatabase } from '../../../backend/lib/db';
import Session from '../../../backend/models/Session';
import Table from '../../../backend/models/Table';
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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const authReq = await requireAuth(req, res);
    if (!authReq) return;
    if (!(await requireRole(authReq, res, ['WAITER', 'CASHIER', 'MANAGER']))) return;

    const { id } = req.query;

    if (!id || !Types.ObjectId.isValid(id as string)) {
      return sendError(res, 'Invalid session ID', 400);
    }

    const session = await Session.findById(id).populate('tableId');

    if (!session) {
      return sendNotFound(res, 'Session not found');
    }

    if (session.status === 'CLOSED') {
      return sendError(res, 'Session is already closed', 400);
    }

    // Close session
    session.status = 'CLOSED';
    session.closedAt = new Date();
    await session.save();

    // Free table
    const table = session.tableId as any;
    if (table) {
      table.status = 'FREE';
      table.currentSessionId = null;
      await table.save();
    }

    return sendSuccess(res, {
      session: {
        id: session._id,
        status: session.status,
        closedAt: session.closedAt,
      },
      table: table ? {
        id: table._id,
        tableNumber: table.tableNumber,
        status: table.status,
      } : null,
    });
  } catch (error) {
    console.error('Close session error:', error);
    return sendServerError(res);
  }
}
