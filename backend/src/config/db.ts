import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    return;
  }

  const uri = ENV.MONGODB_URI;

  try {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('✅ MongoDB connected successfully to database');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ MongoDB disconnected. Retrying...');
    });

    await mongoose.connect(uri, {
      dbName: ENV.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to prevent macOS IPv6 monitor timeouts
    });
  } catch (error) {
    console.warn('⚠️ MongoDB initial connection failed:', error instanceof Error ? error.message : error);
    if (ENV.NODE_ENV === 'production') {
      throw error;
    }
    console.log('ℹ️ Running in resilient mode. Database operations will attempt to reconnect.');
  }
}

export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
