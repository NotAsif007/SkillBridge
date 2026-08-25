import { AdminService } from '../services/admin.service.js';
import { success, paginated } from '../utils/responseEnvelope.js';

export class AdminController {
  /**
   * GET /api/v1/dashboard/admin
   * Fetch institutional placement readiness summary
   */
  static async getAdminDashboard(req, res, next) {
    try {
      const summary = await AdminService.getAdminDashboard(req.user.organizationId);
      return success(res, summary, 'Admin dashboard metrics retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/students
   * Fetch paginated student roster with filters
   */
  static async getStudents(req, res, next) {
    try {
      const result = await AdminService.getStudentsRoster(
        req.user.organizationId,
        req.query
      );
      return paginated(res, result.students, result.pagination, 'Students retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/departments
   * Fetch department roster and student counts
   */
  static async getDepartments(req, res, next) {
    try {
      const departments = await AdminService.getDepartments(req.user.organizationId);
      return success(res, departments, 'Departments retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/analytics/placements
   * Fetch placement funnel and offer statistics
   */
  static async getPlacementPipeline(req, res, next) {
    try {
      const pipeline = await AdminService.getPlacementPipeline(req.user.organizationId);
      return success(res, pipeline, 'Placement pipeline metrics retrieved');
    } catch (err) {
      next(err);
    }
  }
}