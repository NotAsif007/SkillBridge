import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;
let memoryServer = null;

export async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    if (!config.isProd) {
      logger.warn(`Primary MongoDB connection failed (${err.message}). Starting development in-memory MongoDB fallback...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        isConnected = true;
        logger.info(`In-Memory MongoDB fallback running & connected at: ${memUri}`);

        // Auto-seed demo dataset for instant testing
        const { seedDatabase } = await import('../../scripts/seed.js');
        await seedDatabase();
        logger.info('In-memory database seeded with complete demo dataset.');
        return;
      } catch (memErr) {
        logger.error(`In-memory database fallback failed: ${memErr.message}`);
      }
    }

    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected');
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

mongoose.connection.on('disconnected', () => {
  if (isConnected) {
    isConnected = false;
    logger.warn('MongoDB disconnected unexpectedly');
  }
});