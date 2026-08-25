import { GapEngineService } from '../services/gapEngine.service.js';
import { success } from '../utils/responseEnvelope.js';

export class GapEngineController {
  /**
   * GET /api/v1/career-analysis
   * Computes deterministic career gap analysis and placement readiness score
   */
  static async getCareerAnalysis(req, res, next) {
    try {
      const { careerId } = req.query;
      const analysis = await GapEngineService.calculateCareerGap(req.user.id, careerId);
      return success(res, analysis, 'Career gap analysis completed successfully');
    } catch (err) {
      next(err);
    }
  }
}