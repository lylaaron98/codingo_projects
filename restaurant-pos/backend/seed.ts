import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectToDatabase } from './lib/db.js';
import User from './models/User.js';
import Table from './models/Table.js';
import MenuItem from './models/MenuItem.js';
import Session from './models/Session.js';
import Order from './models/Order.js';
import Payment from './models/Payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('✓ Connected to MongoDB');

    // Hash default passwords
    const waiterPassword = await bcrypt.hash('waiter123', 10);
    const kitchenPassword = await bcrypt.hash('kitchen123', 10);
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);

    // Create users
    const users = [
      { username: 'waiter', password: waiterPassword, role: 'WAITER' },
      { username: 'kitchen', password: kitchenPassword, role: 'KITCHEN' },
      { username: 'cashier', password: cashierPassword, role: 'CASHIER' },
      { username: 'manager', password: managerPassword, role: 'MANAGER' },
    ];

    console.log('\nClearing existing data...');
    await User.deleteMany({});
    await Table.deleteMany({});
    await MenuItem.deleteMany({});
    await Session.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    console.log('✓ Existing data cleared');

    console.log('\nSeeding users...');
    await User.insertMany(users);
    console.log('✓ Created', users.length, 'users');
    console.log('  - waiter (password: waiter123)');
    console.log('  - kitchen (password: kitchen123)');
    console.log('  - cashier (password: cashier123)');
    console.log('  - manager (password: manager123)');

    console.log('\nSeeding tables...');
    const tables = Array.from({ length: 10 }, (_, i) => ({
      tableNumber: i + 1,
      status: 'FREE',
      currentSessionId: null,
    }));
    await Table.insertMany(tables);
    console.log('✓ Created', tables.length, 'tables');

    console.log('\nSeeding menu items...');
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
    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log('✓ Created', menuItems.length, 'menu items');

    // Get created tables and menu items
    const createdTables = await Table.find({});
    
    console.log('\nSeeding test sessions and orders...');
    
    // Create session for Table 1 with multiple orders
    const session1 = await Session.create({
      tableId: createdTables[0]._id,
      status: 'OPEN',
      openedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    });
    
    // Update table 1 status
    createdTables[0].status = 'OCCUPIED';
    createdTables[0].currentSessionId = session1._id;
    await createdTables[0].save();
    
    // Create orders for session 1
    await Order.create({
      sessionId: session1._id,
      status: 'SERVED',
      items: [
        {
          menuItemId: createdMenuItems[0]._id, // Burger
          nameSnapshot: 'Burger',
          priceSnapshot: 12.99,
          qty: 2,
        },
        {
          menuItemId: createdMenuItems[7]._id, // Fries
          nameSnapshot: 'Fries',
          priceSnapshot: 4.99,
          qty: 2,
        },
        {
          menuItemId: createdMenuItems[11]._id, // Coke
          nameSnapshot: 'Coke',
          priceSnapshot: 2.99,
          qty: 2,
        },
      ],
    });
    
    await Order.create({
      sessionId: session1._id,
      status: 'SERVED',
      items: [
        {
          menuItemId: createdMenuItems[9]._id, // Cake
          nameSnapshot: 'Cake',
          priceSnapshot: 6.99,
          qty: 1,
        },
        {
          menuItemId: createdMenuItems[13]._id, // Coffee
          nameSnapshot: 'Coffee',
          priceSnapshot: 3.49,
          qty: 2,
        },
      ],
    });
    
    // Create session for Table 2
    const session2 = await Session.create({
      tableId: createdTables[1]._id,
      status: 'OPEN',
      openedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    });
    
    // Update table 2 status
    createdTables[1].status = 'OCCUPIED';
    createdTables[1].currentSessionId = session2._id;
    await createdTables[1].save();
    
    // Create order for session 2
    await Order.create({
      sessionId: session2._id,
      status: 'SERVED',
      items: [
        {
          menuItemId: createdMenuItems[1]._id, // Pizza
          nameSnapshot: 'Pizza',
          priceSnapshot: 14.99,
          qty: 1,
        },
        {
          menuItemId: createdMenuItems[4]._id, // Salad
          nameSnapshot: 'Salad',
          priceSnapshot: 8.99,
          qty: 1,
        },
        {
          menuItemId: createdMenuItems[12]._id, // Water
          nameSnapshot: 'Water',
          priceSnapshot: 1.99,
          qty: 2,
        },
      ],
    });
    
    // Create session for Table 3
    const session3 = await Session.create({
      tableId: createdTables[2]._id,
      status: 'OPEN',
      openedAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    });
    
    // Update table 3 status
    createdTables[2].status = 'OCCUPIED';
    createdTables[2].currentSessionId = session3._id;
    await createdTables[2].save();
    
    // Create order for session 3
    await Order.create({
      sessionId: session3._id,
      status: 'READY',
      items: [
        {
          menuItemId: createdMenuItems[3]._id, // Steak
          nameSnapshot: 'Steak',
          priceSnapshot: 24.99,
          qty: 1,
        },
        {
          menuItemId: createdMenuItems[8]._id, // Rice
          nameSnapshot: 'Rice',
          priceSnapshot: 3.99,
          qty: 1,
        },
        {
          menuItemId: createdMenuItems[14]._id, // Tea
          nameSnapshot: 'Tea',
          priceSnapshot: 2.99,
          qty: 1,
        },
      ],
    });
    
    console.log('✓ Created 3 test sessions with orders');
    console.log('  - Table 1: 2 orders (Burger, Fries, Coke, Cake, Coffee) - Total: $46.94');
    console.log('  - Table 2: 1 order (Pizza, Salad, Water x2) - Total: $27.96');
    console.log('  - Table 3: 1 order (Steak, Rice, Tea) - Total: $31.97');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nYou can now login with:');
    console.log('  Waiter:  waiter / waiter123');
    console.log('  Kitchen: kitchen / kitchen123');
    console.log('  Cashier: cashier / cashier123');
    console.log('  Manager: manager / manager123');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
