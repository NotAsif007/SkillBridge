import { InterviewService } from '../services/interview.service.js';
import { success, created } from '../utils/responseEnvelope.js';

export class InterviewController {
  /**
   * POST /api/v1/interviews/start
   * Start AI mock interview session
   */
  static async startSession(req, res, next) {
    try {
      const session = await InterviewService.startSession(
        req.user.id,
        req.user.organizationId,
        req.body
      );
      return created(res, session, 'Interview session started');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/interviews/:sessionId/answer
   * Submit answer, receive evaluation, and advance question
   */
  static async submitAnswer(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { answer } = req.body;
      const session = await InterviewService.submitAnswer(req.user.id, sessionId, answer);
      return success(res, session, 'Answer evaluated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/interviews/history
   * List past interview sessions
   */
  static async getHistory(req, res, next) {
    try {
      const history = await InterviewService.getHistory(req.user.id);
      return success(res, history, 'Interview history retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/interviews/:sessionId
   * Get specific session details
   */
  static async getSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const session = await InterviewService.getSession(req.user.id, sessionId);
      return success(res, session, 'Interview session retrieved');
    } catch (err) {
      next(err);
    }
  }
}