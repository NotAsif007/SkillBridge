import { CareerService } from '../services/career.service.js';
import { success } from '../utils/responseEnvelope.js';

export class CareerController {
  /**
   * GET /api/v1/careers
   * List all available career tracks
   */
  static async listCareers(req, res, next) {
    try {
      const careers = await CareerService.listCareers();
      return success(res, careers, 'Careers retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/careers/:id
   * Get career details with all required skills and weightings
   */
  static async getCareer(req, res, next) {
    try {
      const career = await CareerService.getCareerWithRequirements(req.params.id);
      return success(res, career, 'Career details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}