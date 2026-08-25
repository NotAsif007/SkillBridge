import { Career } from '../models/career.model.js';
import { CareerRequirement } from '../models/careerRequirement.model.js';
import { notFound } from '../utils/errors.js';

export class CareerService {
  /**
   * Lists all active career tracks.
   */
  static async listCareers() {
    return Career.find({ isActive: true }).sort({ category: 1, title: 1 });
  }

  /**
   * Retrieves career details along with all associated skill requirements and weights.
   */
  static async getCareerWithRequirements(careerId) {
    const career = await Career.findById(careerId);
    if (!career || !career.isActive) {
      throw notFound('Career path not found or inactive');
    }

    const requirements = await CareerRequirement.find({ careerId: career._id })
      .populate('skillId', 'name category description')
      .sort({ weight: -1 });

    const formattedRequirements = requirements.map((req) => ({
      _id: req._id,
      skillId: req.skillId?._id || req.skillId,
      skillName: req.skillId?.name || 'Unknown Skill',
      category: req.skillId?.category || 'General',
      importance: req.importance,
      requiredProficiency: req.requiredProficiency,
      weight: req.weight,
    }));

    return {
      ...career.toObject(),
      requirements: formattedRequirements,
    };
  }

  /**
   * Retrieves career by unique slug.
   */
  static async getCareerBySlug(slug) {
    const career = await Career.findOne({ slug, isActive: true });
    if (!career) {
      throw notFound(`Career '${slug}' not found`);
    }
    return this.getCareerWithRequirements(career._id);
  }
}