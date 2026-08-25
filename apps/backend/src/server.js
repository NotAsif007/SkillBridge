import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import app from './app.js';

const PORT = config.port;

async function start() {
  // Connect to MongoDB first
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`CareerOS API running in [${config.nodeEnv}] mode on port ${PORT}`);
    logger.info(`Health: http://localhost:${PORT}/api/v1/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      const { disconnectDB } = await import('./config/db.js');
      await disconnectDB();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // Unhandled rejection guard
  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
    shutdown('unhandledRejection');
  });
}

start();
