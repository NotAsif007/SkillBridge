import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config/env.js';
import { unauthorized, internal } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

const client = new OAuth2Client(config.google.clientId);

/**
 * Verifies a Google ID token from frontend Google Identity Services login.
 * @param {string} idToken - The JWT token returned by Google OAuth.
 * @returns {Promise<{ googleId: string, email: string, name: string, picture: string }>}
 */
export async function verifyGoogleToken(idToken) {
  if (!idToken) {
    throw unauthorized('Google ID token is required');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.google.clientId || undefined,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw unauthorized('Invalid Google token payload');
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || null,
      emailVerified: payload.email_verified || false,
    };
  } catch (err) {
    logger.warn(`Google token verification failed: ${err.message}`);
    throw unauthorized('Invalid or expired Google token');
  }
}