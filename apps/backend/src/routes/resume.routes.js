import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { analyzeResumeSchema } from '../validators/resume.validator.js';
import { aiLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/analyze', aiLimiter, validate(analyzeResumeSchema), ResumeController.analyzeResume);
router.post('/upload', aiLimiter, validate(analyzeResumeSchema), ResumeController.analyzeResume);
router.get('/latest', ResumeController.getLatestResume);
router.get('/history', ResumeController.getResumeHistory);
router.delete('/:id', ResumeController.deleteResume);

export default router;