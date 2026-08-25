import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import { googleLoginSchema, devLoginSchema } from '../validators/auth.validator.js';

const router = Router();

// Google OAuth Login
router.post('/google', authLimiter, validate(googleLoginSchema), AuthController.loginWithGoogle);

// Fast Dev/Test Login (Disabled in Production)
router.post('/dev-login', validate(devLoginSchema), AuthController.devLogin);

// Get current authenticated user
router.get('/me', requireAuth, AuthController.getMe);

// Logout
router.post('/logout', requireAuth, AuthController.logout);

export default router;