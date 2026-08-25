import { forbidden, unauthorized } from '../utils/errors.js';

/**
 * Multi-tenant organization boundary enforcement middleware.
 * Enforces that non-SUPER_ADMIN users belong to a valid organization.
 * Never trust organizationId sent in request body/query for auth decisions.
 */
export function requireOrganizationAccess(req, res, next) {
  if (!req.user) {
    return next(unauthorized('Authentication required'));
  }

  // Super admins have cross-tenant bypass for administration
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (!req.user.organizationId) {
    return next(
      forbidden('Access denied: You must be associated with an academic organization.')
    );
  }

  // Always lock tenant scope to the authenticated user's organizationId
  req.tenantOrgId = req.user.organizationId;

  next();
}