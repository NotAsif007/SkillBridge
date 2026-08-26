import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import app from './app.js';

let server;
let shuttingDown = false;

async function shutdown(signal, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received — starting graceful shutdown`);

  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out; forcing exit');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    if (server) await new Promise((resolve) => server.close(resolve));
    await disconnectDB();
    logger.info('CareerOS server stopped cleanly');
    process.exit(exitCode);
  } catch (err) {
    logger.error('Graceful shutdown failed', { errorName: err.name, message: err.message, stack: err.stack });
    process.exit(1);
  }
}

async function start() {
  try {
    await connectDB();
    server = app.listen(config.port, () => {
      logger.info(`CareerOS API listening on port ${config.port}`, {
        environment: config.nodeEnv,
        healthUrl: `http://localhost:${config.port}/api/v1/health`,
        devLoginEnabled: config.allowDevLogin,
        geminiConfigured: Boolean(config.gemini.apiKey),
      });
    });
    server.on('error', (err) => {
      logger.error('HTTP server failed', { errorName: err.name, message: err.message, stack: err.stack });
      shutdown('serverError', 1);
    });
  } catch (err) {
    logger.error('CareerOS server failed during startup', { errorName: err.name, message: err.message, stack: err.stack });
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason instanceof Error ? reason.message : String(reason), stack: reason?.stack });
  shutdown('unhandledRejection', 1);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { errorName: err.name, message: err.message, stack: err.stack });
  shutdown('uncaughtException', 1);
});

start();
