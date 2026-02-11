import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../backend/lib/db';
import User from '../../backend/models/User';
import Table from '../../backend/models/Table';
import MenuItem from '../../backend/models/MenuItem';
import Session from '../../backend/models/Session';
import Order from '../../backend/models/Order';
import Payment from '../../backend/models/Payment';
import { sendSuccess, sendServerError, handleCors } from '../../backend/lib/responses';

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

    // COMMENTED OUT FOR TESTING - Application should work with existing MongoDB data
    /*
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
    */

    return sendSuccess(res, {
      message: 'Seed endpoint disabled - using existing MongoDB data',
      note: 'Application works with data already in database',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return sendServerError(res);
  }
}
