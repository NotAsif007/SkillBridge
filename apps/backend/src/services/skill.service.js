import { Skill } from '../models/skill.model.js';
import { notFound } from '../utils/errors.js';

export class SkillService {
  /**
   * Lists standardized skills with optional category filter and text search.
   */
  static async listSkills({ category, search } = {}) {
    const query = { isVerified: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    return Skill.find(query).sort({ category: 1, name: 1 });
  }

  /**
   * Retrieves a single skill by ID.
   */
  static async getSkillById(skillId) {
    const skill = await Skill.findById(skillId);
    if (!skill) {
      throw notFound('Skill not found');
    }
    return skill;
  }

  /**
   * Retrieves multiple skills by array of IDs.
   */
  static async getSkillsByIds(skillIds) {
    return Skill.find({ _id: { $in: skillIds } });
  }
}