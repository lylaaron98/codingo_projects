import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { createMenuItemSchema, updateMenuItemSchema } from '../validators/menu.ts';
import { requireAuth, requireRole } from '../middleware/auth-express.js';
import {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
} from '../lib/responses-express.js';

const router = express.Router();

// GET /api/menu/items - Get all menu items
router.get('/items', requireAuth, async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    return sendSuccess(res, { items });
  } catch (error) {
    console.error('Get menu items error:', error);
    return sendServerError(res, error);
  }
});

// POST /api/menu/items - Create menu item (MANAGER only)
router.post('/items', requireAuth, requireRole('MANAGER'), async (req, res) => {
  try {
    const validation = createMenuItemSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const newItem = await MenuItem.create(validation.data);
    return sendSuccess(res, { item: newItem }, 201);
  } catch (error) {
    console.error('Create menu item error:', error);
    return sendServerError(res, error);
  }
});

// PATCH /api/menu/items/:id - Update menu item (MANAGER only)
router.patch('/items/:id', requireAuth, requireRole('MANAGER'), async (req, res) => {
  try {
    const validation = updateMenuItemSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      validation.data,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return sendNotFound(res, 'Menu item not found');
    }

    return sendSuccess(res, { item: updatedItem });
  } catch (error) {
    console.error('Update menu item error:', error);
    return sendServerError(res, error);
  }
});

// DELETE /api/menu/items/:id - Delete menu item (MANAGER only)
router.delete('/items/:id', requireAuth, requireRole('MANAGER'), async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return sendNotFound(res, 'Menu item not found');
    }

    return sendSuccess(res, { message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    return sendServerError(res, error);
  }
});

export default router;
