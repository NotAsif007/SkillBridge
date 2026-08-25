import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { submitAssessmentSchema } from '../validators/assessment.validator.js';

const router = Router();

// All assessment actions require authentication
router.use(requireAuth);

router.get('/', AssessmentController.listAssessments);
router.get('/attempts/me', AssessmentController.getMyAttempts);
router.get('/:id', AssessmentController.startAssessment);
router.post('/:id/submit', validate(submitAssessmentSchema), AssessmentController.submitAssessment);

export default router;