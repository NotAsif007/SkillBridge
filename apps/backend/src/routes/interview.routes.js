import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { startSessionSchema, submitAnswerSchema } from '../validators/interview.validator.js';

const router = Router();

// All interview endpoints require authentication
router.use(requireAuth);

router.post('/start', validate(startSessionSchema), InterviewController.startSession);
router.get('/history', InterviewController.getHistory);
router.get('/:sessionId', InterviewController.getSession);
router.post('/:sessionId/answer', validate(submitAnswerSchema), InterviewController.submitAnswer);

export default router;