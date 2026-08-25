import { Router } from 'express';
import { CareerController } from '../controllers/career.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Career exploration is accessible to authenticated users
router.use(requireAuth);

router.get('/', CareerController.listCareers);
router.get('/:id', CareerController.getCareer);

export default router;