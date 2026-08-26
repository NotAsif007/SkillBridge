import mongoose from 'mongoose';
import { success } from '../utils/responseEnvelope.js';

/**
 * GET /api/v1/health
 * Quick liveness + readiness check.
 * Returns DB connection state for infrastructure monitoring.
 */
export function healthCheck(req, res) {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';

  return success(res, {
    status:    'ok',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
    services: {
      database: dbStatus,
    },
    uptime: Math.floor(process.uptime()),
  }, 'SkillBridge API is healthy');
}
