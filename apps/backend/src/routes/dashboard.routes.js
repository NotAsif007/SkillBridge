import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Dashboard routes require authentication
router.use(requireAuth);

router.get('/student', DashboardController.getStudentDashboard);
router.get('/admin', requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'), AdminController.getAdminDashboard);

export default router;