/**
 * AppError — operational errors that should be sent to the client.
 * All other errors (programmer errors) are caught by the global handler and returned as 500.
 */
export class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code       = code;
    this.details    = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Convenience factories
export const badRequest  = (msg, code = 'BAD_REQUEST',    details = []) => new AppError(msg, 400, code, details);
export const unauthorized= (msg = 'Authentication required') => new AppError(msg, 401, 'UNAUTHORIZED');
export const forbidden   = (msg = 'Access denied')           => new AppError(msg, 403, 'FORBIDDEN');
export const notFound    = (msg = 'Resource not found')      => new AppError(msg, 404, 'NOT_FOUND');
export const conflict    = (msg, code = 'CONFLICT')          => new AppError(msg, 409, code);
export const tooMany     = (msg = 'Too many requests')       => new AppError(msg, 429, 'RATE_LIMITED');
export const internal    = (msg = 'Internal server error')   => new AppError(msg, 500, 'INTERNAL_ERROR');
