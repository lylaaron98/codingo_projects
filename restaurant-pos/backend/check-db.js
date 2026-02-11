// Check if database is seeded
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

console.log('Checking database contents...\n');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    
    // Check users
    const users = await db.collection('users').find().toArray();
    console.log(`👤 Users: ${users.length} found`);
    users.forEach(u => console.log(`   - ${u.username} (${u.role})`));
    
    // Check tables
    const tables = await db.collection('tables').countDocuments();
    console.log(`\n🪑 Tables: ${tables} found`);
    
    // Check menu items
    const menuItems = await db.collection('menuitems').countDocuments();
    console.log(`🍔 Menu Items: ${menuItems} found`);
    
    if (users.length === 0) {
      console.log('\n⚠️  Database is EMPTY! You need to seed it first.');
      console.log('Run: POST http://localhost:3000/api/auth/seed');
    } else {
      console.log('\n✅ Database is seeded and ready!');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
