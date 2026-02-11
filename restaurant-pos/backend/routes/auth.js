import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Table from '../models/Table.js';
import MenuItem from '../models/MenuItem.js';
import Session from '../models/Session.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { loginSchema, createUserSchema } from '../validators/auth.ts';
import {
  sendSuccess,
  sendValidationError,
  sendUnauthorized,
  sendServerError,
} from '../lib/responses-express.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const { username, password } = validation.data;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return sendUnauthorized(res, 'Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return sendUnauthorized(res, 'Invalid credentials');
    }

    // Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendServerError(res, error);
  }
});

// POST /api/auth/seed - Seed database with initial data
router.post('/seed', async (req, res) => {
  try {
    // Hash default password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users
    const users = [
      { username: 'waiter', password: hashedPassword, role: 'WAITER' },
      { username: 'kitchen', password: hashedPassword, role: 'KITCHEN' },
      { username: 'cashier', password: hashedPassword, role: 'CASHIER' },
      { username: 'manager', password: hashedPassword, role: 'MANAGER' },
    ];

    // Clear existing data
    await User.deleteMany({});
    await Table.deleteMany({});
    await MenuItem.deleteMany({});
    await Session.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});

    // Insert users
    await User.insertMany(users);

    // Create 10 tables
    const tables = Array.from({ length: 10 }, (_, i) => ({
      tableNumber: i + 1,
      status: 'FREE',
    }));
    await Table.insertMany(tables);

    // Create menu items
    const menuItems = [
      { name: 'Burger', price: 12.99, category: 'Mains', isAvailable: true },
      { name: 'Pizza', price: 14.99, category: 'Mains', isAvailable: true },
      { name: 'Pasta', price: 11.99, category: 'Mains', isAvailable: true },
      { name: 'Steak', price: 24.99, category: 'Mains', isAvailable: true },
      { name: 'Salad', price: 8.99, category: 'Starters', isAvailable: true },
      { name: 'Soup', price: 6.99, category: 'Starters', isAvailable: true },
      { name: 'Wings', price: 9.99, category: 'Starters', isAvailable: true },
      { name: 'Fries', price: 4.99, category: 'Sides', isAvailable: true },
      { name: 'Rice', price: 3.99, category: 'Sides', isAvailable: true },
      { name: 'Cake', price: 6.99, category: 'Desserts', isAvailable: true },
      { name: 'Ice Cream', price: 5.99, category: 'Desserts', isAvailable: true },
      { name: 'Coke', price: 2.99, category: 'Drinks', isAvailable: true },
      { name: 'Water', price: 1.99, category: 'Drinks', isAvailable: true },
      { name: 'Coffee', price: 3.49, category: 'Drinks', isAvailable: true },
      { name: 'Tea', price: 2.99, category: 'Drinks', isAvailable: true },
    ];
    await MenuItem.insertMany(menuItems);

    return sendSuccess(res, {
      message: 'Database seeded successfully',
      data: {
        users: users.length,
        tables: tables.length,
        menuItems: menuItems.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return sendServerError(res, error);
  }
});

export default router;
