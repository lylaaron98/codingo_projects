import { describe, it, expect } from 'vitest';
import { loginSchema, createUserSchema } from '../validators/auth.ts';
import { createMenuItemSchema, updateMenuItemSchema } from '../validators/menu.ts';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.ts';
import { openSessionSchema, paymentSchema } from '../validators/session.ts';

describe('Validators', () => {
  describe('Auth Validators', () => {
    describe('loginSchema', () => {
      it('should validate correct login data', () => {
        const result = loginSchema.safeParse({
          username: 'testuser',
          password: 'password123',
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject empty username', () => {
        const result = loginSchema.safeParse({
          username: '',
          password: 'password123',
        });
        
        expect(result.success).toBe(false);
      });

      it('should reject empty password', () => {
        const result = loginSchema.safeParse({
          username: 'testuser',
          password: '',
        });
        
        expect(result.success).toBe(false);
      });
    });

    describe('createUserSchema', () => {
      it('should validate correct user data', () => {
        const result = createUserSchema.safeParse({
          username: 'newuser',
          password: 'password123',
          role: 'WAITER',
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject invalid role', () => {
        const result = createUserSchema.safeParse({
          username: 'newuser',
          password: 'password123',
          role: 'INVALID_ROLE',
        });
        
        expect(result.success).toBe(false);
      });

      it('should reject short password', () => {
        const result = createUserSchema.safeParse({
          username: 'newuser',
          password: '123',
          role: 'WAITER',
        });
        
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Menu Validators', () => {
    describe('createMenuItemSchema', () => {
      it('should validate correct menu item data', () => {
        const result = createMenuItemSchema.safeParse({
          name: 'Burger',
          price: 12.99,
          category: 'Mains',
          isAvailable: true,
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject negative price', () => {
        const result = createMenuItemSchema.safeParse({
          name: 'Burger',
          price: -5,
          category: 'Mains',
        });
        
        expect(result.success).toBe(false);
      });

      it('should default isAvailable to true', () => {
        const result = createMenuItemSchema.safeParse({
          name: 'Burger',
          price: 12.99,
          category: 'Mains',
        });
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.isAvailable).toBe(true);
        }
      });
    });

    describe('updateMenuItemSchema', () => {
      it('should validate partial updates', () => {
        const result = updateMenuItemSchema.safeParse({
          price: 15.99,
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject negative price in update', () => {
        const result = updateMenuItemSchema.safeParse({
          price: -10,
        });
        
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Order Validators', () => {
    describe('createOrderSchema', () => {
      it('should validate valid order with items', () => {
        const result = createOrderSchema.safeParse({
          items: [
            {
              menuItemId: '507f1f77bcf86cd799439011',
              qty: 2,
              notes: 'No onions',
            },
          ],
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject empty items array', () => {
        const result = createOrderSchema.safeParse({
          items: [],
        });
        
        expect(result.success).toBe(false);
      });

      it('should reject zero quantity', () => {
        const result = createOrderSchema.safeParse({
          items: [
            {
              menuItemId: '507f1f77bcf86cd799439011',
              qty: 0,
            },
          ],
        });
        
        expect(result.success).toBe(false);
      });
    });

    describe('updateOrderStatusSchema', () => {
      it('should validate valid status', () => {
        const result = updateOrderStatusSchema.safeParse({
          status: 'IN_PROGRESS',
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject invalid status', () => {
        const result = updateOrderStatusSchema.safeParse({
          status: 'INVALID_STATUS',
        });
        
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Session Validators', () => {
    describe('openSessionSchema', () => {
      it('should validate valid table ID', () => {
        const result = openSessionSchema.safeParse({
          tableId: '507f1f77bcf86cd799439011',
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject empty table ID', () => {
        const result = openSessionSchema.safeParse({
          tableId: '',
        });
        
        expect(result.success).toBe(false);
      });
    });

    describe('paymentSchema', () => {
      it('should validate CASH payment', () => {
        const result = paymentSchema.safeParse({
          method: 'CASH',
        });
        
        expect(result.success).toBe(true);
      });

      it('should validate CARD payment', () => {
        const result = paymentSchema.safeParse({
          method: 'CARD',
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject invalid payment method', () => {
        const result = paymentSchema.safeParse({
          method: 'BITCOIN',
        });
        
        expect(result.success).toBe(false);
      });
    });
  });
});
