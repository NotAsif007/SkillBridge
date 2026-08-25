import { DashboardService } from '../services/dashboard.service.js';
import { success } from '../utils/responseEnvelope.js';

export class DashboardController {
  /**
   * GET /api/v1/dashboard/student
   * Returns aggregated dashboard payload for authenticated student
   */
  static async getStudentDashboard(req, res, next) {
    try {
      const data = await DashboardService.getStudentDashboard(
        req.user.id,
        req.user.organizationId
      );
      return success(res, data, 'Student dashboard retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}