import { Job } from '../models/job.model.js';
import { JobApplication } from '../models/jobApplication.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { ProfileService } from './profile.service.js';
import { notFound, badRequest, conflict } from '../utils/errors.js';

export class JobService {
  /**
   * Evaluates student's skill match percentage against a job's required skills.
   */
  static calculateJobMatch(studentSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) {
      return { matchPercentage: 100, matchedSkills: [], missingSkills: [] };
    }

    const skillMap = new Map();
    (studentSkills || []).forEach((s) => {
      skillMap.set(s.skillId.toString(), s.proficiencyLevel || 1);
    });

    let totalWeight = 0;
    let earnedWeight = 0;
    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach((req) => {
      const skillIdStr = req.skillId?._id?.toString() || req.skillId?.toString();
      const skillName = req.skillId?.name || 'Skill';
      const minProficiency = req.minProficiency || 3;
      const weight = req.weight || 5;

      totalWeight += weight;
      const studentLevel = skillMap.get(skillIdStr);

      if (!studentLevel) {
        missingSkills.push({ skillId: skillIdStr, name: skillName, minProficiency });
      } else if (studentLevel >= minProficiency) {
        earnedWeight += weight;
        matchedSkills.push({ skillId: skillIdStr, name: skillName, studentLevel, minProficiency });
      } else {
        earnedWeight += (studentLevel / minProficiency) * weight;
        missingSkills.push({ skillId: skillIdStr, name: skillName, studentLevel, minProficiency });
      }
    });

    const matchPercentage =
      totalWeight > 0 ? Math.min(100, Math.max(0, Math.round((earnedWeight / totalWeight) * 100))) : 100;

    return { matchPercentage, matchedSkills, missingSkills };
  }

  /**
   * Lists jobs in organization with personalized match score calculation.
   */
  static async listJobs(studentId, orgId, query = {}) {
    const profile = await ProfileService.getOrCreateProfile(studentId);
    const filter = { organizationId: orgId, isActive: true };

    if (query.jobType) filter.jobType = query.jobType;
    if (query.workplaceType) filter.workplaceType = query.workplaceType;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { company: { $regex: query.search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('requiredSkills.skillId', 'name category')
      .sort({ createdAt: -1 });

    const appliedJobIds = new Set(
      (await JobApplication.find({ studentId }).select('jobId')).map((a) => a.jobId.toString())
    );

    const jobsWithMatch = jobs.map((job) => {
      const { matchPercentage, matchedSkills, missingSkills } = this.calculateJobMatch(
        profile.skills,
        job.requiredSkills
      );

      return {
        ...job.toObject(),
        matchPercentage,
        matchedSkillsCount: matchedSkills.length,
        missingSkillsCount: missingSkills.length,
        hasApplied: appliedJobIds.has(job._id.toString()),
      };
    });

    // Optional filter by minMatch percentage
    const minMatch = query.minMatch ? parseInt(query.minMatch, 10) : 0;
    const filteredJobs = jobsWithMatch.filter((j) => j.matchPercentage >= minMatch);

    // Sort by match score descending
    filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return filteredJobs;
  }

  /**
   * Retrieves single job details and match evaluation.
   */
  static async getJobById(jobId, studentId) {
    const job = await Job.findById(jobId)
      .populate('requiredSkills.skillId', 'name category')
      .populate('eligibility.eligibleDepartments', 'name code');

    if (!job || !job.isActive) {
      throw notFound('Job not found or inactive');
    }

    const profile = await ProfileService.getOrCreateProfile(studentId);
    const { matchPercentage, matchedSkills, missingSkills } = this.calculateJobMatch(
      profile.skills,
      job.requiredSkills
    );

    const existingApplication = await JobApplication.findOne({ jobId, studentId });

    return {
      ...job.toObject(),
      matchScore: matchPercentage,
      matchedSkills,
      missingSkills,
      hasApplied: Boolean(existingApplication),
      applicationId: existingApplication?._id || null,
      applicationStatus: existingApplication?.status || null,
    };
  }

  /**
   * Creates a new job posting.
   */
  static async createJob(orgId, userId, jobData) {
    const job = await Job.create({
      ...jobData,
      organizationId: orgId,
      createdBy: userId,
    });

    return Job.findById(job._id).populate('requiredSkills.skillId', 'name category');
  }

  /**
   * Submits a student job application.
   */
  static async applyJob(studentId, orgId, jobId, { coverLetter = '', resumeId = null } = {}) {
    const job = await Job.findById(jobId).populate('requiredSkills.skillId');
    if (!job || !job.isActive) {
      throw notFound('Job not found or is no longer accepting applications');
    }

    const existing = await JobApplication.findOne({ jobId, studentId });
    if (existing) {
      throw conflict('You have already submitted an application for this position');
    }

    const profile = await ProfileService.getOrCreateProfile(studentId);

    // Eligibility check
    if (job.eligibility?.minCgpa && profile.academicDetails?.cgpa) {
      if (profile.academicDetails.cgpa < job.eligibility.minCgpa) {
        throw badRequest(
          `Minimum CGPA requirement is ${job.eligibility.minCgpa}, but your profile has ${profile.academicDetails.cgpa}`
        );
      }
    }

    const { matchPercentage } = this.calculateJobMatch(profile.skills, job.requiredSkills);

    const application = await JobApplication.create({
      jobId,
      studentId,
      organizationId: orgId,
      resumeId,
      coverLetter,
      matchScoreAtApplication: matchPercentage,
      status: 'APPLIED',
    });

    return JobApplication.findById(application._id).populate('jobId');
  }

  /**
   * Retrieves all job applications submitted by student.
   */
  static async getStudentApplications(studentId) {
    return JobApplication.find({ studentId })
      .populate('jobId', 'title company location jobType salaryRange workplaceType')
      .populate('resumeId', 'fileName atsScore')
      .sort({ appliedAt: -1 });
  }

  /**
   * Updates application status (e.g. from Recruiter/Admin).
   */
  static async updateApplicationStatus(applicationId, { status, notes = '' }) {
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      throw notFound('Application not found');
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      notes,
    });

    await application.save();
    return application;
  }
}