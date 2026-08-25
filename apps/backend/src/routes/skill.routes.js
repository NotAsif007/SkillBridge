import { Router } from 'express';
import { SkillController } from '../controllers/skill.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Skills catalog is accessible to authenticated users
router.use(requireAuth);

router.get('/', SkillController.listSkills);
router.get('/:id', SkillController.getSkill);

export default router;