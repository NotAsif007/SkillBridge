import { randomUUID } from 'crypto';
import { config } from '../config/env.js';

const SENSITIVE_KEY = /authorization|cookie|password|secret|token|api[-_]?key/i;

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SENSITIVE_KEY.test(key) ? '[REDACTED]' : sanitize(item)]));
  }
  return value;
}

function formatMeta(meta) {
  if (!meta || Object.keys(meta).length === 0) return '';
  try { return ` ${JSON.stringify(sanitize(meta))}`; }
  catch { return ' {"meta":"[unserializable]"}'; }
}

function log(level, message, meta) {
  console.log(`[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${formatMeta(meta)}`);
}

export const logger = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  http: (message, meta) => log('http', message, meta),
  debug: (message, meta) => config.isDev && log('debug', message, meta),
};

/** Assign a traceable id to every request without altering API response envelopes. */
export function requestContext(req, res, next) {
  const suppliedId = req.get('X-Request-ID');
  req.requestId = suppliedId && /^[A-Za-z0-9_-]{8,100}$/.test(suppliedId) ? suppliedId : randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

/** Log completed requests with correlation, duration and safe actor context. */
export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    if (req.originalUrl.startsWith('/api/v1/health')) return;
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logger.http(`${req.method} ${req.originalUrl} → ${res.statusCode}`, {
      requestId: req.requestId,
      durationMs: Number(durationMs.toFixed(1)),
      userId: req.user?.id,
      role: req.user?.role,
      organizationId: req.user?.organizationId,
    });
  });
  next();
}
