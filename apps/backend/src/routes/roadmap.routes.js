import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmap.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { generateRoadmapSchema, toggleTaskSchema } from '../validators/roadmap.validator.js';

import { aiLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/active', RoadmapController.getActiveRoadmap);
router.get('/me', RoadmapController.getActiveRoadmap);
router.post('/generate', aiLimiter, validate(generateRoadmapSchema), RoadmapController.generateRoadmap);
router.patch('/tasks/:taskId', validate(toggleTaskSchema), RoadmapController.toggleTask);
router.put('/tasks/:taskId/toggle', validate(toggleTaskSchema), RoadmapController.toggleTask);

export default router;