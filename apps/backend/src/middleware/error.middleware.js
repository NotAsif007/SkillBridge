import mongoose from 'mongoose';
import { AppError } from '../utils/errors.js';
import { failure } from '../utils/responseEnvelope.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

/**
 * Normalize third-party library errors into AppError.
 */
function normalize(err) {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return new AppError('Validation failed', 422, 'VALIDATION_ERROR', details);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return new AppError(
      `${field} already exists`,
      409,
      'DUPLICATE_ERROR',
      [{ field, message: `${field} must be unique` }]
    );
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return new AppError(`Invalid id: ${err.value}`, 400, 'INVALID_ID');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  return err;
}

/**
 * Global error handler — must be registered last in app.js.
 */
export function errorHandler(err, req, res, next) {
  const normalized = normalize(err);

  const statusCode = normalized.statusCode || 500;
  const code       = normalized.code       || 'INTERNAL_ERROR';
  const message    = normalized.message    || 'An unexpected error occurred';
  const details    = normalized.details    || [];

  // Log 5xx errors with stack trace
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${statusCode} ${message}`, {
      requestId: req.requestId,
      errorName: err.name,
      stack: config.isDev ? err.stack : undefined,
    });
  }

  // Never expose stack traces in production
  return failure(res, statusCode, code, message, details);
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req, res) {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, { requestId: req.requestId });
  return failure(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`);
}
