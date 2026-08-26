import { Job } from '../models/job.model.js';
import { JobApplication } from '../models/jobApplication.model.js';
import { Resume } from '../models/resume.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { ProfileService } from './profile.service.js';
import { notFound, badRequest, conflict, forbidden } from '../utils/errors.js';
import { escapeRegex } from '../utils/regex.js';

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
   * Lists jobs in organization with personalized match score calculation and safe regex search.
   */
  static async listJobs(studentId, orgId, query = {}) {
    const profile = await ProfileService.getOrCreateProfile(studentId);
    const filter = { organizationId: orgId, isActive: true };

    if (query.jobType) filter.jobType = query.jobType;
    if (query.workplaceType) filter.workplaceType = query.workplaceType;
    if (query.search && query.search.trim()) {
      const safeSearch = escapeRegex(query.search.trim().slice(0, 100));
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { company: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('requiredSkills.skillId', 'name category')
      .sort({ createdAt: -1 });

    const appliedJobIds = new Set(
      (await JobApplication.find({ studentId, organizationId: orgId }).select('jobId')).map((a) => a.jobId.toString())
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
   * Retrieves single job details and match evaluation strictly scoped to organization.
   */
  static async getJobById(jobId, studentId, orgId) {
    const job = await Job.findOne({ _id: jobId, organizationId: orgId, isActive: true })
      .populate('requiredSkills.skillId', 'name category')
      .populate('eligibility.eligibleDepartments', 'name code');

    if (!job) {
      throw notFound('Job not found in your institution or is inactive');
    }

    const profile = await ProfileService.getOrCreateProfile(studentId);
    const { matchPercentage, matchedSkills, missingSkills } = this.calculateJobMatch(
      profile.skills,
      job.requiredSkills
    );

    const existingApplication = await JobApplication.findOne({ jobId, studentId, organizationId: orgId });

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
   * Submits a student job application strictly validated against tenant boundary.
   */
  static async applyJob(studentId, orgId, jobId, { coverLetter = '', resumeId = null } = {}) {
    const job = await Job.findOne({ _id: jobId, organizationId: orgId, isActive: true }).populate('requiredSkills.skillId');
    if (!job) {
      throw notFound('Job not found in your institution or is no longer accepting applications');
    }

    const existing = await JobApplication.findOne({ jobId, studentId, organizationId: orgId });
    if (existing) {
      throw conflict('You have already submitted an application for this position');
    }

    // Validate that resume belongs to the authenticated student
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, studentId });
      if (!resume) {
        throw badRequest('Attached resume does not belong to your account');
      }
    }

    const profile = await ProfileService.getOrCreateProfile(studentId);

    // Eligibility check
    if (job.deadline && new Date(job.deadline) < new Date()) {
      throw badRequest('The application deadline for this position has passed');
    }

    if (job.eligibility?.minCgpa) {
      if (profile.cgpa == null || profile.cgpa < job.eligibility.minCgpa) {
        throw badRequest(
          `Minimum CGPA requirement is ${job.eligibility.minCgpa}, but your profile has ${profile.cgpa ?? 'not been provided'}`
        );
      }
    }

    const eligibleDepartments = job.eligibility?.eligibleDepartments || [];
    if (eligibleDepartments.length > 0) {
      const isEligibleDepartment = profile.departmentId && eligibleDepartments
        .some((departmentId) => departmentId.toString() === profile.departmentId.toString());
      if (!isEligibleDepartment) {
        throw forbidden('Your department is not eligible for this position');
      }
    }

    const graduationYears = job.eligibility?.graduationYears || [];
    if (graduationYears.length > 0 && !graduationYears.includes(profile.graduationYear)) {
      throw forbidden('Your graduation year is not eligible for this position');
    }

    const { matchPercentage } = this.calculateJobMatch(profile.skills, job.requiredSkills);

    const application = await JobApplication.create({
      jobId,
      studentId,
      organizationId: orgId,
      resumeId: resumeId || null,
      coverLetter,
      matchScoreAtApplication: matchPercentage,
      status: 'APPLIED',
    });

    return JobApplication.findById(application._id).populate('jobId');
  }

  /**
   * Retrieves all job applications submitted by student scoped to organization.
   */
  static async getStudentApplications(studentId, orgId) {
    return JobApplication.find({ studentId, organizationId: orgId })
      .populate('jobId', 'title company location jobType salaryRange workplaceType')
      .populate('resumeId', 'fileName atsScore')
      .sort({ appliedAt: -1 });
  }

  /**
   * Updates application status (e.g. from Recruiter/Admin).
   */
  static async updateApplicationStatus(applicationId, orgId, { status, notes = '' }) {
    const application = await JobApplication.findOne({ _id: applicationId, organizationId: orgId });
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
