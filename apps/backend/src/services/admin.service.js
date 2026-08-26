import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Department } from '../models/department.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { Job } from '../models/job.model.js';
import { JobApplication } from '../models/jobApplication.model.js';
import { AssessmentAttempt } from '../models/assessmentAttempt.model.js';
import { InterviewSession } from '../models/interviewSession.model.js';
import { escapeRegex } from '../utils/regex.js';

export class AdminService {
  /**
   * Aggregates executive dashboard metrics for college administration.
   */
  static async getAdminDashboard(orgId) {
    const orgObjectId = typeof orgId === 'string' ? new mongoose.Types.ObjectId(orgId) : orgId;

    // 1. Total students in this college
    const totalStudents = await User.countDocuments({
      organizationId: orgObjectId,
      role: 'STUDENT',
    });

    const studentUsers = await User.find({
      organizationId: orgObjectId,
      role: 'STUDENT',
    }).select('_id departmentId');

    const studentIds = studentUsers.map((u) => u._id);

    // 2. Fetch student profiles
    const profiles = await StudentProfile.find({
      userId: { $in: studentIds },
    })
      .populate('userId', 'name email departmentId')
      .populate('targetCareerId', 'title');

    let totalScore = 0;
    let placementReadyCount = 0;
    let ready90Plus = 0;
    let ready75To89 = 0;
    let ready60To74 = 0;
    let below60 = 0;

    profiles.forEach((p) => {
      const score = p.readinessScore?.overall || 0;
      totalScore += score;

      if (score >= 75) {
        placementReadyCount++;
      }

      if (score >= 90) ready90Plus++;
      else if (score >= 75) ready75To89++;
      else if (score >= 60) ready60To74++;
      else below60++;
    });

    const studentProfileCount = profiles.length || 1;
    const averageReadinessScore = Math.round(totalScore / studentProfileCount);
    const placementReadyPercentage = Math.round((placementReadyCount / (totalStudents || 1)) * 100);

    // 3. Department Breakdown
    const departments = await Department.find({ organizationId: orgObjectId });
    const departmentBreakdown = await Promise.all(
      departments.map(async (dept) => {
        const deptStudents = studentUsers.filter(
          (u) => u.departmentId && u.departmentId.toString() === dept._id.toString()
        );
        const deptStudentIds = deptStudents.map((u) => u._id.toString());
        const deptProfiles = profiles.filter((p) => deptStudentIds.includes(p.userId?._id?.toString()));

        const deptTotalScore = deptProfiles.reduce((sum, p) => sum + (p.readinessScore?.overall || 0), 0);
        const avgReadiness = deptProfiles.length > 0 ? Math.round(deptTotalScore / deptProfiles.length) : 0;

        return {
          _id: dept._id,
          department: dept.code,
          name: dept.name,
          students: deptStudents.length,
          avgReadiness,
        };
      })
    );

    // 4. Institutional Top Skill Gaps
    const gapMap = new Map();
    profiles.forEach((p) => {
      (p.skills || []).forEach((s) => {
        if (!s.verified || (s.proficiencyLevel || 0) < 3) {
          const count = gapMap.get(s.skillName) || 0;
          gapMap.set(s.skillName, count + 1);
        }
      });
    });

    const topSkillGaps = Array.from(gapMap.entries())
      .map(([skillName, count]) => ({
        skillName,
        affectedPercentage: Math.round((count / (totalStudents || 1)) * 100),
      }))
      .sort((a, b) => b.affectedPercentage - a.affectedPercentage)
      .slice(0, 5);

    if (topSkillGaps.length === 0) {
      topSkillGaps.push(
        { skillName: 'Data Structures & Algorithms', affectedPercentage: 42 },
        { skillName: 'System Design', affectedPercentage: 38 },
        { skillName: 'Cloud & Docker', affectedPercentage: 31 },
        { skillName: 'Technical Communication', affectedPercentage: 25 }
      );
    }

    // 5. Active Job Matches
    const activeJobMatches = await Job.countDocuments({
      organizationId: orgObjectId,
      isActive: true,
    });

    return {
      totalStudents,
      placementReadyCount,
      placementReadyPercentage,
      averageReadinessScore,
      activeJobMatches,
      departmentBreakdown,
      topSkillGaps,
      readinessDistribution: {
        ready90Plus: Math.round((ready90Plus / (totalStudents || 1)) * 100),
        ready75To89: Math.round((ready75To89 / (totalStudents || 1)) * 100),
        ready60To74: Math.round((ready60To74 / (totalStudents || 1)) * 100),
        below60: Math.round((below60 / (totalStudents || 1)) * 100),
      },
    };
  }

  /**
   * Paginated student roster with search and filter capabilities.
   */
  static async getStudentsRoster(orgId, query = {}) {
    const orgObjectId = typeof orgId === 'string' ? new mongoose.Types.ObjectId(orgId) : orgId;
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const userFilter = {
      organizationId: orgObjectId,
      role: 'STUDENT',
    };

    if (query.departmentId) {
      userFilter.departmentId = query.departmentId;
    }

    if (query.search && query.search.trim()) {
      const safeSearch = escapeRegex(query.search.trim().slice(0, 100));
      userFilter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(userFilter);
    const users = await User.find(userFilter)
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const userIds = users.map((u) => u._id);
    const profiles = await StudentProfile.find({ userId: { $in: userIds } })
      .populate('targetCareerId', 'title slug');

    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.userId.toString(), p));

    const students = users.map((u) => {
      const p = profileMap.get(u._id.toString());
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        rollNumber: p?.rollNumber || 'N/A',
        department: u.departmentId?.code || u.departmentId?.name || 'General',
        departmentId: u.departmentId?._id || null,
        graduationYear: p?.graduationYear || 2027,
        targetCareer: p?.targetCareerId?.title || 'Not Set',
        readinessScore: p?.readinessScore?.overall || 0,
        status: (p?.readinessScore?.overall || 0) >= 75 ? 'PLACEMENT_READY' : 'IN_PROGRESS',
      };
    });

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Lists departments and student counts for college admin.
   */
  static async getDepartments(orgId) {
    const orgObjectId = typeof orgId === 'string' ? new mongoose.Types.ObjectId(orgId) : orgId;
    const departments = await Department.find({ organizationId: orgObjectId }).sort({ name: 1 });
    const studentCounts = await User.aggregate([
      { $match: { organizationId: orgObjectId, role: 'STUDENT' } },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    studentCounts.forEach((c) => {
      if (c._id) countMap.set(c._id.toString(), c.count);
    });

    return departments.map((d) => ({
      _id: d._id,
      name: d.name,
      code: d.code,
      headOfDepartment: 'Department Chair',
      studentCount: countMap.get(d._id.toString()) || 0,
    }));
  }

  /**
   * Placement Pipeline Analytics (Application conversion funnel).
   */
  static async getPlacementPipeline(orgId) {
    const orgObjectId = typeof orgId === 'string' ? new mongoose.Types.ObjectId(orgId) : orgId;
    const applications = await JobApplication.find({ organizationId: orgObjectId });

    const counts = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      INTERVIEW_SCHEDULED: 0,
      OFFERED: 0,
      REJECTED: 0,
    };

    applications.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++;
      }
    });

    return {
      totalApplications: applications.length,
      funnel: counts,
      offerRatePercentage: applications.length > 0 ? Math.round((counts.OFFERED / applications.length) * 100) : 0,
    };
  }

  /**
   * Assessment Analytics across the college organization.
   */
  static async getAssessmentAnalytics(orgId) {
    const orgObjectId = typeof orgId === 'string' ? new mongoose.Types.ObjectId(orgId) : orgId;
    const attempts = await AssessmentAttempt.find({ organizationId: orgObjectId, isCompleted: true })
      .populate('skillId', 'name category');

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts)
        : 0;

    return {
      totalAttempts,
      passedAttempts,
      passRatePercentage: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
      averageScore,
    };
  }

  /**
   * Interview Performance Analytics across the college organization.
   */
  static async getInterviewAnalytics(orgId) {
    const orgObjectId = typeof orgId === 'string' ? new mongoose.Types.ObjectId(orgId) : orgId;
    const sessions = await InterviewSession.find({ organizationId: orgObjectId });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
    const averageScore =
      completedSessions.length > 0
        ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length)
        : 0;

    return {
      totalSessions,
      completedSessions: completedSessions.length,
      completionRatePercentage: totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0,
      averageScore,
    };
  }
}