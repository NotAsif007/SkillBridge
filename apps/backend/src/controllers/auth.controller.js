import { AuthService } from '../services/auth.service.js';
import { success, created } from '../utils/responseEnvelope.js';

export class AuthController {
  /**
   * POST /api/v1/auth/google
   * Authenticate with Google ID Token
   */
  static async loginWithGoogle(req, res, next) {
    try {
      const { idToken } = req.body;
      const { user, token } = await AuthService.loginWithGoogle(idToken);

      return success(
        res,
        {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            departmentId: user.departmentId,
            profileImage: user.profileImage,
          },
        },
        'Authenticated successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/dev-login
   * Developer / Test fast login (Disabled in production)
   */
  static async devLogin(req, res, next) {
    try {
      const { user, token } = await AuthService.devLogin(req.body);

      return success(
        res,
        {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            departmentId: user.departmentId,
            profileImage: user.profileImage,
          },
        },
        'Dev session generated successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Retrieve current authenticated user profile
   */
  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);

      return success(
        res,
        {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organizationId || null,
            department: user.departmentId || null,
            profileImage: user.profileImage,
            lastLoginAt: user.lastLoginAt,
          },
        },
        'Current user retrieved'
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Invalidate session and revoke active JWTs
   */
  static async logout(req, res, next) {
    try {
      if (req.user && req.user.id) {
        await AuthService.logout(req.user.id);
      }
      res.clearCookie('token');
      return success(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }
}