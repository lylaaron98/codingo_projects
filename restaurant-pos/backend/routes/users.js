import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createUserSchema } from '../validators/auth.ts';
import { requireAuth, requireRole } from '../middleware/auth-express.js';
import {
  sendSuccess,
  sendValidationError,
  sendConflict,
  sendServerError,
} from '../lib/responses-express.js';

const router = express.Router();

// GET /api/users - Get all users (MANAGER only)
router.get('/', requireAuth, requireRole('MANAGER'), async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });

    return sendSuccess(res, {
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get users error:', error);
    return sendServerError(res, error);
  }
});

// POST /api/users/create - Create new user (MANAGER only)
router.post('/create', requireAuth, requireRole('MANAGER'), async (req, res) => {
  try {
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const { username, password, role } = validation.data;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return sendConflict(res, 'Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
    });

    return sendSuccess(res, {
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    }, 201);
  } catch (error) {
    console.error('Create user error:', error);
    return sendServerError(res, error);
  }
});

export default router;
