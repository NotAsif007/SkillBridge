import { ResumeService } from '../services/resume.service.js';
import { success, created } from '../utils/responseEnvelope.js';

export class ResumeController {
  /**
   * POST /api/v1/resumes/analyze
   * Parse resume text & compute ATS diagnostic score
   */
  static async analyzeResume(req, res, next) {
    try {
      const evaluation = await ResumeService.analyzeResume(
        req.user.id,
        req.user.organizationId,
        req.body
      );
      return created(res, evaluation, 'Resume analyzed successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/resumes/latest
   * Fetch latest resume analysis
   */
  static async getLatestResume(req, res, next) {
    try {
      const resume = await ResumeService.getLatestResume(req.user.id);
      return success(res, resume, 'Latest resume retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/resumes/history
   * Fetch historical resume evaluations
   */
  static async getResumeHistory(req, res, next) {
    try {
      const history = await ResumeService.getResumeHistory(req.user.id);
      return success(res, history, 'Resume history retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/resumes/:id
   * Delete specific resume record
   */
  static async deleteResume(req, res, next) {
    try {
      const result = await ResumeService.deleteResume(req.user.id, req.params.id);
      return success(res, result, 'Resume deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}