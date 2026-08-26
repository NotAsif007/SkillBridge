import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All administrative endpoints require authentication and admin role
router.use(requireAuth);
router.use(requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'));

router.get('/students', AdminController.getStudents);
router.get('/departments', AdminController.getDepartments);
router.get('/analytics', AdminController.getPlacementPipeline);
router.get('/analytics/placements', AdminController.getPlacementPipeline);
router.get('/assessments/analytics', AdminController.getAssessmentAnalytics);
router.get('/interviews/analytics', AdminController.getInterviewAnalytics);

export default router;