import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../backend/lib/db';
import Table from '../../backend/models/Table';
import Session from '../../backend/models/Session';
import { requireAuth } from '../../backend/middleware/auth';
import { requireRole } from '../../backend/middleware/role';
import { openSessionSchema } from '../../backend/validators/session';
import {
  sendSuccess,
  sendValidationError,
  sendError,
  sendNotFound,
  sendServerError,
  handleCors,
} from '../../backend/lib/responses';

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
    if (!(await requireRole(authReq, res, ['WAITER']))) return;

    const validation = openSessionSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const { tableId } = validation.data;

    // Check if table exists and is free
    const table = await Table.findById(tableId);
    if (!table) {
      return sendNotFound(res, 'Table not found');
    }

    if (table.status === 'OCCUPIED') {
      return sendError(res, 'Table is already occupied', 400);
    }

    // Check if there's already an open session for this table
    const existingSession = await Session.findOne({
      tableId: table._id,
      status: 'OPEN',
    });

    if (existingSession) {
      return sendError(res, 'Table already has an open session', 400);
    }

    // Create new session
    const newSession = await Session.create({
      tableId: table._id,
      status: 'OPEN',
      openedAt: new Date(),
    });

    // Update table status
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
    return sendServerError(res);
  }
}
