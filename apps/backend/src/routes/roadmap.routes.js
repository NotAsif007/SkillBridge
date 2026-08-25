import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmap.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { generateRoadmapSchema, toggleTaskSchema } from '../validators/roadmap.validator.js';

const router = Router();

// All roadmap operations require authentication
router.use(requireAuth);

router.get('/active', RoadmapController.getActiveRoadmap);
router.post('/generate', validate(generateRoadmapSchema), RoadmapController.generateRoadmap);
router.patch('/tasks/:taskId', validate(toggleTaskSchema), RoadmapController.toggleTask);

export default router;