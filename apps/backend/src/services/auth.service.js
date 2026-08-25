import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Organization } from '../models/organization.model.js';
import { Department } from '../models/department.model.js';
import { config } from '../config/env.js';
import { verifyGoogleToken } from '../integrations/google/oauthClient.js';
import { unauthorized, notFound, forbidden, badRequest } from '../utils/errors.js';

export class AuthService {
  /**
   * Issues a signed JWT for a user.
   */
  static signToken(user) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId ? user.organizationId.toString() : null,
      departmentId: user.departmentId ? user.departmentId.toString() : null,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verifies and decodes a JWT token.
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw unauthorized('Session expired. Please log in again.');
      }
      throw unauthorized('Invalid authentication token.');
    }
  }

  /**
   * Logs in or registers a user with a verified Google ID token.
   */
  static async loginWithGoogle(idToken) {
    const googlePayload = await verifyGoogleToken(idToken);

    let user = await User.findOne({ email: googlePayload.email });

    if (!user) {
      // Auto-register first-time student
      user = await User.create({
        name: googlePayload.name,
        email: googlePayload.email,
        googleId: googlePayload.googleId,
        profileImage: googlePayload.picture,
        role: 'STUDENT',
        isActive: true,
        lastLoginAt: new Date(),
      });
    } else {
      if (!user.isActive) {
        throw forbidden('Your account has been deactivated. Please contact support.');
      }

      // Update login timestamp & googleId if not linked yet
      user.lastLoginAt = new Date();
      if (!user.googleId) user.googleId = googlePayload.googleId;
      if (googlePayload.picture && !user.profileImage) user.profileImage = googlePayload.picture;
      await user.save();
    }

    const token = this.signToken(user);
    return { user, token };
  }

  /**
   * Fast development / testing login without Google OAuth flow.
   * Only allowed in non-production environments.
   */
  static async devLogin({ email, role = 'STUDENT', name, organizationId, departmentId }) {
    if (config.isProd) {
      throw forbidden('Dev login is not permitted in production mode');
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        role,
        organizationId: organizationId || null,
        departmentId: departmentId || null,
        isActive: true,
        lastLoginAt: new Date(),
      });
    } else {
      if (!user.isActive) {
        throw forbidden('Account is deactivated');
      }
      if (role && user.role !== role) {
        user.role = role;
      }
      if (organizationId) user.organizationId = organizationId;
      if (departmentId) user.departmentId = departmentId;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const token = this.signToken(user);
    return { user, token };
  }

  /**
   * Retrieves full profile of the authenticated user.
   */
  static async getCurrentUser(userId) {
    const user = await User.findById(userId)
      .populate('organizationId', 'name slug domain logoUrl')
      .populate('departmentId', 'name code');

    if (!user || !user.isActive) {
      throw notFound('User not found or inactive');
    }

    return user;
  }
}