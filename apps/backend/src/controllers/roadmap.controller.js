import { RoadmapService } from '../services/roadmap.service.js';
import { success } from '../utils/responseEnvelope.js';

export class RoadmapController {
  /**
   * GET /api/v1/roadmaps/active
   * Retrieve active personalized roadmap
   */
  static async getActiveRoadmap(req, res, next) {
    try {
      const roadmap = await RoadmapService.getActiveRoadmap(req.user.id);
      return success(res, roadmap, 'Active roadmap retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/roadmaps/generate
   * Generate new AI-powered roadmap tailored to skill gaps
   */
  static async generateRoadmap(req, res, next) {
    try {
      const roadmap = await RoadmapService.generateRoadmap(req.user.id, req.body);
      return success(res, roadmap, 'Roadmap generated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/roadmaps/tasks/:taskId
   * Toggle task completion status and recalculate roadmap progress
   */
  static async toggleTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const { isCompleted } = req.body;
      const roadmap = await RoadmapService.toggleTask(req.user.id, taskId, isCompleted);
      return success(res, roadmap, 'Task status updated');
    } catch (err) {
      next(err);
    }
  }
}