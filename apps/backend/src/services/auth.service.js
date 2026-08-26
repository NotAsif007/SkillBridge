import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Organization } from '../models/organization.model.js';
import { Department } from '../models/department.model.js';
import { config } from '../config/env.js';
import { verifyGoogleToken } from '../integrations/google/oauthClient.js';
import { unauthorized, notFound, forbidden, badRequest } from '../utils/errors.js';

export class AuthService {
  /**
   * Issues a signed JWT for a user with audience, issuer, and tokenVersion tracking.
   */
  static signToken(user) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
      organizationId: user.organizationId ? user.organizationId.toString() : null,
      departmentId: user.departmentId ? user.departmentId.toString() : null,
    };

    return jwt.sign(payload, config.jwt.secret, {
      algorithm: 'HS256',
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verifies and decodes a JWT token with strict algorithm, audience, and issuer validation.
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        algorithms: ['HS256'],
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });
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
   * Gated strictly behind allowDevLogin.
   */
  static async devLogin({ email, role = 'STUDENT', name, organizationId, departmentId }) {
    if (config.isProd || !config.allowDevLogin) {
      throw forbidden('Development login is disabled in this environment.');
    }

    // Outside of automated tests, prevent unprivileged users from minting arbitrary superadmin accounts
    if (!config.isTest && role === 'SUPER_ADMIN') {
      throw forbidden('Cannot mint SUPER_ADMIN accounts through dev-login.');
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
   * Invalidates all active tokens for a user upon logout.
   */
  static async logout(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.lastLogoutAt = new Date();
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await user.save();
    }
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