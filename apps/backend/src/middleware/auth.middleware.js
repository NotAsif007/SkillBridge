import { AuthService } from '../services/auth.service.js';
import { User } from '../models/user.model.js';
import { unauthorized, forbidden } from '../utils/errors.js';

/**
 * Authentication middleware.
 * Verifies Authorization header (Bearer <token>) or auth cookie.
 * Attaches verified user object to `req.user`.
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw unauthorized('Authentication required. Please provide a valid Bearer token.');
    }

    const decoded = AuthService.verifyToken(token);

    // Fetch fresh user from database to ensure account is still active and roles haven't changed
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw unauthorized('User account is invalid or deactivated.');
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId ? user.organizationId.toString() : null,
      departmentId: user.departmentId ? user.departmentId.toString() : null,
    };

    next();
  } catch (err) {
    next(err);
  }
}