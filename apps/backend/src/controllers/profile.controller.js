import { ProfileService } from '../services/profile.service.js';
import { success } from '../utils/responseEnvelope.js';

export class ProfileController {
  /**
   * GET /api/v1/profile
   * Fetch authenticated student profile
   */
  static async getProfile(req, res, next) {
    try {
      const profile = await ProfileService.getOrCreateProfile(req.user.id);
      return success(res, profile, 'Profile retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/profile
   * Update student academic info & preferences
   */
  static async updateProfile(req, res, next) {
    try {
      const profile = await ProfileService.updateProfile(req.user.id, req.body);
      return success(res, profile, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/profile/skills
   * Add or update student skill proficiency
   */
  static async addSkill(req, res, next) {
    try {
      const profile = await ProfileService.addOrUpdateSkill(req.user.id, req.body);
      return success(res, profile, 'Skill updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/profile/target-career
   * Set target career for gap analysis
   */
  static async setTargetCareer(req, res, next) {
    try {
      const { careerId } = req.body;
      const profile = await ProfileService.setTargetCareer(req.user.id, careerId);
      return success(res, profile, 'Target career updated successfully');
    } catch (err) {
      next(err);
    }
  }
}