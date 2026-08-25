import { ProjectService } from '../services/project.service.js';
import { success, created } from '../utils/responseEnvelope.js';

export class ProjectController {
  /**
   * GET /api/v1/projects
   * List student portfolio projects
   */
  static async listProjects(req, res, next) {
    try {
      const projects = await ProjectService.getStudentProjects(req.user.id);
      return success(res, projects, 'Projects retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/projects
   * Create new project in portfolio
   */
  static async createProject(req, res, next) {
    try {
      const project = await ProjectService.createProject(
        req.user.id,
        req.user.organizationId,
        req.body
      );
      return created(res, project, 'Project created successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/projects/:id
   * Update existing project
   */
  static async updateProject(req, res, next) {
    try {
      const project = await ProjectService.updateProject(req.user.id, req.params.id, req.body);
      return success(res, project, 'Project updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/projects/:id
   * Remove project
   */
  static async deleteProject(req, res, next) {
    try {
      const result = await ProjectService.deleteProject(req.user.id, req.params.id);
      return success(res, result, 'Project deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/projects/recommendations
   * Get AI portfolio recommendations tailored to skill gaps
   */
  static async getRecommendations(req, res, next) {
    try {
      const recommendations = await ProjectService.getProjectRecommendations(req.user.id);
      return success(res, recommendations, 'Project recommendations retrieved');
    } catch (err) {
      next(err);
    }
  }
}