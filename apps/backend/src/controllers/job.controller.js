import { JobService } from '../services/job.service.js';
import { success, created } from '../utils/responseEnvelope.js';

export class JobController {
  /**
   * GET /api/v1/jobs
   * List jobs with calculated skill match scores
   */
  static async listJobs(req, res, next) {
    try {
      const jobs = await JobService.listJobs(
        req.user.id,
        req.user.organizationId,
        req.query
      );
      return success(res, jobs, 'Jobs retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/jobs/applications/me
   * Retrieve all applications submitted by logged-in student
   */
  static async getStudentApplications(req, res, next) {
    try {
      const applications = await JobService.getStudentApplications(req.user.id);
      return success(res, applications, 'Student applications retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/jobs/:id
   * Get single job details with match breakdown
   */
  static async getJob(req, res, next) {
    try {
      const job = await JobService.getJobById(req.params.id, req.user.id);
      return success(res, job, 'Job details retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/jobs
   * Post new job (Admin / Recruiter)
   */
  static async createJob(req, res, next) {
    try {
      const job = await JobService.createJob(
        req.user.organizationId,
        req.user.id,
        req.body
      );
      return created(res, job, 'Job posted successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/jobs/:id/apply
   * Submit student application for job
   */
  static async applyJob(req, res, next) {
    try {
      const application = await JobService.applyJob(
        req.user.id,
        req.user.organizationId,
        req.params.id,
        req.body
      );
      return created(res, application, 'Application submitted successfully');
    } catch (err) {
      next(err);
    }
  }
}