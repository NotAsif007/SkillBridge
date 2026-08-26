import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { startSessionSchema, submitAnswerSchema } from '../validators/interview.validator.js';
import { aiLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/start', aiLimiter, validate(startSessionSchema), InterviewController.startSession);
router.post('/', aiLimiter, validate(startSessionSchema), InterviewController.startSession);
router.get('/history', InterviewController.getHistory);
router.get('/:sessionId', InterviewController.getSession);
router.post('/:sessionId/answer', aiLimiter, validate(submitAnswerSchema), InterviewController.submitAnswer);

export default router;