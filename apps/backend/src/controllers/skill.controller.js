import { SkillService } from '../services/skill.service.js';
import { success } from '../utils/responseEnvelope.js';

export class SkillController {
  /**
   * GET /api/v1/skills
   * Query skills with optional category or text search
   */
  static async listSkills(req, res, next) {
    try {
      const { category, search } = req.query;
      const skills = await SkillService.listSkills({ category, search });
      return success(res, skills, 'Skills retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/skills/:id
   * Get single skill
   */
  static async getSkill(req, res, next) {
    try {
      const skill = await SkillService.getSkillById(req.params.id);
      return success(res, skill, 'Skill retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}