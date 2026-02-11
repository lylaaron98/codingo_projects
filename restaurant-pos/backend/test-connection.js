// Quick MongoDB connection test
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, '../.env') });

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    return mongoose.connection.db.admin().listDatabases();
  })
  .then(({ databases }) => {
    console.log('📊 Available databases:', databases.map(d => d.name).join(', '));
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('Connection closed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
