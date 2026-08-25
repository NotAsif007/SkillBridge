import morgan from 'morgan';
import { config } from '../config/env.js';

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

function log(level, msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${level.toUpperCase()}] ${msg}`);
}

export const logger = {
  error: (msg) => log('error', msg),
  warn:  (msg) => log('warn', msg),
  info:  (msg) => log('info', msg),
  http:  (msg) => log('http', msg),
  debug: (msg) => config.isDev && log('debug', msg),
};

// Morgan HTTP request logger middleware
export const httpLogger = morgan(
  config.isProd ? 'combined' : 'dev',
  {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/api/v1/health',
  }
);
