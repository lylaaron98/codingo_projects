import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../backend/lib/db';
import MenuItem from '../../backend/models/MenuItem';
import { requireAuth } from '../../backend/middleware/auth';
import { requireRole } from '../../backend/middleware/role';
import { createMenuItemSchema } from '../../backend/validators/menu';
import {
  sendSuccess,
  sendValidationError,
  sendServerError,
  handleCors,
} from '../../backend/lib/responses';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCors(req, res)) return;
  
  try {
    await connectToDatabase();

    // GET - List all menu items (public)
    if (req.method === 'GET') {
      const items = await MenuItem.find().sort({ category: 1, name: 1 });
      return sendSuccess(res, { items });
    }

    // POST - Create menu item (MANAGER only)
    if (req.method === 'POST') {
      const authReq = await requireAuth(req, res);
      if (!authReq) return;
      if (!(await requireRole(authReq, res, ['MANAGER']))) return;

      const validation = createMenuItemSchema.safeParse(req.body);
      if (!validation.success) {
        return sendValidationError(res, validation.error);
      }

      const newItem = await MenuItem.create(validation.data);
      return sendSuccess(res, { item: newItem }, 201);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Menu items error:', error);
    return sendServerError(res);
  }
}
