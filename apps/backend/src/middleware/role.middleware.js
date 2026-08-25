import { forbidden, unauthorized } from '../utils/errors.js';

/**
 * Role-Based Access Control middleware factory.
 * Usage: requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        forbidden(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
}