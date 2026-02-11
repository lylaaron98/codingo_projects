import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../../backend/lib/db';
import MenuItem from '../../../backend/models/MenuItem';
import { requireAuth } from '../../../backend/middleware/auth';
import { requireRole } from '../../../backend/middleware/role';
import { updateMenuItemSchema } from '../../../backend/validators/menu';
import {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
  handleCors,
} from '../../../backend/lib/responses';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCors(req, res)) return;
  
  try {
    await connectToDatabase();

    const authReq = await requireAuth(req, res);
    if (!authReq) return;
    if (!(await requireRole(authReq, res, ['MANAGER']))) return;

    const { id } = req.query;

    // PATCH - Update menu item
    if (req.method === 'PATCH') {
      const validation = updateMenuItemSchema.safeParse(req.body);
      if (!validation.success) {
        return sendValidationError(res, validation.error);
      }

      const updatedItem = await MenuItem.findByIdAndUpdate(
        id,
        validation.data,
        { new: true, runValidators: true }
      );

      if (!updatedItem) {
        return sendNotFound(res, 'Menu item not found');
      }

      return sendSuccess(res, { item: updatedItem });
    }

    // DELETE - Delete menu item
    if (req.method === 'DELETE') {
      const deletedItem = await MenuItem.findByIdAndDelete(id);

      if (!deletedItem) {
        return sendNotFound(res, 'Menu item not found');
      }

      return sendSuccess(res, { message: 'Menu item deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Menu item error:', error);
    return sendServerError(res);
  }
}
