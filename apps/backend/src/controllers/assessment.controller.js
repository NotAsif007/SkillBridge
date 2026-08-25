import { AssessmentService } from '../services/assessment.service.js';
import { success } from '../utils/responseEnvelope.js';

export class AssessmentController {
  /**
   * GET /api/v1/assessments
   * List available skill assessments
   */
  static async listAssessments(req, res, next) {
    try {
      const { skillId, difficulty } = req.query;
      const assessments = await AssessmentService.listAssessments({ skillId, difficulty });
      return success(res, assessments, 'Assessments retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/assessments/:id
   * Start assessment attempt & retrieve sanitized question list
   */
  static async startAssessment(req, res, next) {
    try {
      const session = await AssessmentService.startAssessment(
        req.user.id,
        req.params.id,
        req.user.organizationId
      );
      return success(res, session, 'Assessment attempt started');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/assessments/:id/submit
   * Grade submission and update verified skill proficiency
   */
  static async submitAssessment(req, res, next) {
    try {
      const result = await AssessmentService.submitAssessment(
        req.user.id,
        req.params.id,
        req.body
      );
      return success(res, result, 'Assessment evaluated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/assessments/attempts/me
   * Get student's completed assessment attempt history
   */
  static async getMyAttempts(req, res, next) {
    try {
      const attempts = await AssessmentService.getMyAttempts(req.user.id);
      return success(res, attempts, 'Assessment history retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}