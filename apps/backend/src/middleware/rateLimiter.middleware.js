import rateLimit from 'express-rate-limit';
import { failure } from '../utils/responseEnvelope.js';

const handler = (req, res) =>
  failure(res, 429, 'RATE_LIMITED', 'Too many requests — please try again later');

/**
 * General API rate limiter: 200 req / 15 min per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * Auth endpoints limiter: 20 req / 15 min per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * AI/Gemini endpoints limiter: 10 req / 60 min per IP
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
