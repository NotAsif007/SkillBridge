import { Router } from 'express';
import { GapEngineController } from '../controllers/gapEngine.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Career analysis is protected
router.use(requireAuth);

router.get('/', GapEngineController.getCareerAnalysis);

export default router;