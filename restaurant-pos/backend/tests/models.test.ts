import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Table from '../models/Table.js';
import MenuItem from '../models/MenuItem.js';
import Session from '../models/Session.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Database Models', () => {
  describe('User Model', () => {
    it('should create a valid user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        username: 'testuser',
        password: hashedPassword,
        role: 'WAITER',
      });

      expect(user._id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.role).toBe('WAITER');
      expect(await bcrypt.compare('password123', user.password)).toBe(true);
    });

    it('should enforce unique username', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await User.create({
        username: 'duplicate',
        password: hashedPassword,
        role: 'WAITER',
      });

      await expect(
        User.create({
          username: 'duplicate',
          password: hashedPassword,
          role: 'KITCHEN',
        })
      ).rejects.toThrow();
    });

    it('should validate role enum', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await expect(
        User.create({
          username: 'invalid',
          password: hashedPassword,
          role: 'INVALID_ROLE' as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('Table Model', () => {
    it('should create a valid table', async () => {
      const table = await Table.create({
        tableNumber: 1,
        status: 'FREE',
      });

      expect(table._id).toBeDefined();
      expect(table.tableNumber).toBe(1);
      expect(table.status).toBe('FREE');
      expect(table.currentSessionId).toBeUndefined();
    });

    it('should enforce unique table number', async () => {
      await Table.create({ tableNumber: 1, status: 'FREE' });
      
      await expect(
        Table.create({ tableNumber: 1, status: 'FREE' })
      ).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      await expect(
        Table.create({
          tableNumber: 1,
          status: 'INVALID_STATUS' as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('MenuItem Model', () => {
    it('should create a valid menu item', async () => {
      const item = await MenuItem.create({
        name: 'Burger',
        price: 12.99,
        category: 'Mains',
        isAvailable: true,
      });

      expect(item._id).toBeDefined();
      expect(item.name).toBe('Burger');
      expect(item.price).toBe(12.99);
      expect(item.category).toBe('Mains');
      expect(item.isAvailable).toBe(true);
    });

    it('should validate positive price', async () => {
      await expect(
        MenuItem.create({
          name: 'Invalid',
          price: -5,
          category: 'Mains',
        })
      ).rejects.toThrow();
    });
  });

  describe('Session Model', () => {
    it('should create a valid session', async () => {
      const table = await Table.create({ tableNumber: 1, status: 'FREE' });
      
      const session = await Session.create({
        tableId: table._id,
        status: 'OPEN',
      });

      expect(session._id).toBeDefined();
      expect(session.tableId.toString()).toBe(table._id.toString());
      expect(session.status).toBe('OPEN');
      expect(session.openedAt).toBeDefined();
      expect(session.closedAt).toBeUndefined();
    });

    it('should validate status enum', async () => {
      const table = await Table.create({ tableNumber: 1, status: 'FREE' });
      
      await expect(
        Session.create({
          tableId: table._id,
          status: 'INVALID_STATUS' as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('Order Model', () => {
    it('should create a valid order with items', async () => {
      const table = await Table.create({ tableNumber: 1, status: 'FREE' });
      const session = await Session.create({
        tableId: table._id,
        status: 'OPEN',
      });
      const menuItem = await MenuItem.create({
        name: 'Burger',
        price: 12.99,
        category: 'Mains',
      });

      const order = await Order.create({
        sessionId: session._id,
        status: 'NEW',
        items: [
          {
            menuItemId: menuItem._id,
            nameSnapshot: menuItem.name,
            priceSnapshot: menuItem.price,
            qty: 2,
            notes: 'No onions',
          },
        ],
      });

      expect(order._id).toBeDefined();
      expect(order.sessionId.toString()).toBe(session._id.toString());
      expect(order.status).toBe('NEW');
      expect(order.items).toHaveLength(1);
      expect(order.items[0].nameSnapshot).toBe('Burger');
      expect(order.items[0].priceSnapshot).toBe(12.99);
      expect(order.items[0].qty).toBe(2);
      expect(order.items[0].notes).toBe('No onions');
    });

    it('should validate order status enum', async () => {
      const table = await Table.create({ tableNumber: 1, status		: 'FREE' });
      const session = await Session.create({
        tableId: table._id,
        status: 'OPEN',
      });
      const menuItem = await MenuItem.create({
        name: 'Burger',
        price: 12.99,
        category: 'Mains',
      });

      await expect(
        Order.create({
          sessionId: session._id,
          status: 'INVALID_STATUS' as any,
          items: [
            {
              menuItemId: menuItem._id,
              nameSnapshot: menuItem.name,
              priceSnapshot: menuItem.price,
              qty: 1,
            },
          ],
        })
      ).rejects.toThrow();
    });
  });

  describe('Payment Model', () => {
    it('should create a valid payment', async () => {
      const table = await Table.create({ tableNumber: 1, status: 'FREE' });
      const session = await Session.create({
        tableId: table._id,
        status: 'OPEN',
      });

      const payment = await Payment.create({
        sessionId: session._id,
        amount: 25.98,
        method: 'CASH',
      });

      expect(payment._id).toBeDefined();
      expect(payment.sessionId.toString()).toBe(session._id.toString());
      expect(payment.amount).toBe(25.98);
      expect(payment.method).toBe('CASH');
      expect(payment.paidAt).toBeDefined();
    });

    it('should validate payment method enum', async () => {
      const table = await Table.create({ tableNumber: 1, status: 'FREE' });
      const session = await Session.create({
        tableId: table._id,
        status: 'OPEN',
      });

      await expect(
        Payment.create({
          sessionId: session._id,
          amount: 25.98,
          method: 'INVALID_METHOD' as any,
        })
      ).rejects.toThrow();
    });

    it('should enforce unique session payment', async () => {
      const table = await Table.create({ tableNumber: 1, status: 'FREE' });
      const session = await Session.create({
        tableId: table._id,
        status: 'OPEN',
      });

      await Payment.create({
        sessionId: session._id,
        amount: 25.98,
        method: 'CASH',
      });

      await expect(
        Payment.create({
          sessionId: session._id,
          amount: 30.00,
          method: 'CARD',
        })
      ).rejects.toThrow();
    });
  });
});