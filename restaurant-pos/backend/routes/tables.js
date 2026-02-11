import express from 'express';
import Table from '../models/Table.js';
import { requireAuth, requireRole } from '../middleware/auth-express.js';
import {
  sendSuccess,
  sendServerError,
} from '../lib/responses-express.js';

const router = express.Router();

// GET /api/tables - Get all tables
router.get('/', requireAuth,requireRole('WAITER', 'CASHIER', 'MANAGER'), async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    return sendSuccess(res, { tables });
  } catch (error) {
    console.error('Get tables error:', error);
    return sendServerError(res, error);
  }
});

export default router;
