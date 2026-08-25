import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createJobSchema, applyJobSchema } from '../validators/job.validator.js';

const router = Router();

// All job operations require authentication
router.use(requireAuth);

router.get('/applications/me', JobController.getStudentApplications);
router.get('/', JobController.listJobs);
router.post('/', requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'), validate(createJobSchema), JobController.createJob);
router.get('/:id', JobController.getJob);
router.post('/:id/apply', validate(applyJobSchema), JobController.applyJob);

export default router;