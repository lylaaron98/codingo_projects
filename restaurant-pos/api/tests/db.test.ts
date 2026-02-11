import { describe, it, expect, afterAll } from 'vitest';
import { connectToDatabase, getConnectionStatus } from '../../backend/lib/db';
import mongoose from 'mongoose';

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Database Connection', () => {
  it('should connect to MongoDB', async () => {
    const result = await connectToDatabase();
    expect(result.isConnected).toBe(true);
    expect(result.connection).toBeTruthy();
  });

  it('should return connection status', async () => {
    await connectToDatabase();
    const status = getConnectionStatus();
    expect(status).toBe('connected');
  });

  it('should reuse cached connection', async () => {
    const conn1 = await connectToDatabase();
    const conn2 = await connectToDatabase();
    expect(conn1.connection).toBe(conn2.connection);
  });
});
