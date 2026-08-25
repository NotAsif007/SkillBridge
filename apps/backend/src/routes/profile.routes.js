import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  updateProfileSchema,
  addSkillSchema,
  setTargetCareerSchema,
} from '../validators/profile.validator.js';

const router = Router();

// All profile endpoints require authentication
router.use(requireAuth);

router.get('/', ProfileController.getProfile);
router.put('/', validate(updateProfileSchema), ProfileController.updateProfile);
router.post('/skills', validate(addSkillSchema), ProfileController.addSkill);
router.put('/target-career', validate(setTargetCareerSchema), ProfileController.setTargetCareer);

export default router;