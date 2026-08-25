import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';

const router = Router();

// All project endpoints require authentication
router.use(requireAuth);

router.get('/', ProjectController.listProjects);
router.post('/', validate(createProjectSchema), ProjectController.createProject);
router.get('/recommendations', ProjectController.getRecommendations);
router.put('/:id', validate(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

export default router;