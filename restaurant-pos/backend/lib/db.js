import mongoose from 'mongoose';

let cachedConnection = null;

/**
 * Connect to MongoDB with connection caching for serverless functions
 */
export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedConnection && cachedConnection.connection.readyState === 1) {
    return {
      isConnected: true,
      connection: cachedConnection,
    };
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI environment variable');
  }

  try {
    // Create new connection
    const connection = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });

    cachedConnection = connection;

    return {
      isConnected: true,
      connection: cachedConnection,
    };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB (mainly for testing)
 */
export async function disconnectFromDatabase() {
  if (cachedConnection) {
    await cachedConnection.connection.close();
    cachedConnection = null;
  }
}

/**
 * Get connection status
 */
export function getConnectionStatus() {
  if (!cachedConnection) {
    return 'disconnected';
  }

  const state = cachedConnection.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[state] || 'unknown';
}
