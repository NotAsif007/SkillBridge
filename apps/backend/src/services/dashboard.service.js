import { StudentProfile } from '../models/studentProfile.model.js';
import { Roadmap } from '../models/roadmap.model.js';
import { Project } from '../models/project.model.js';
import { InterviewSession } from '../models/interviewSession.model.js';
import { AssessmentAttempt } from '../models/assessmentAttempt.model.js';
import { Job } from '../models/job.model.js';
import { GapEngineService } from './gapEngine.service.js';
import { JobService } from './job.service.js';
import { ProfileService } from './profile.service.js';

export class DashboardService {
  /**
   * Aggregates single-round-trip data for Student Dashboard.
   */
  static async getStudentDashboard(studentId, orgId) {
    const profile = await ProfileService.getOrCreateProfile(studentId);

    // 1. Target career & Gap Analysis
    let targetCareer = null;
    let topSkillGaps = [];
    let readinessScore = profile.readinessScore?.overall || 0;
    let scoreBreakdown = {
      technicalSkills: profile.readinessScore?.breakdown?.technicalSkills || 0,
      assessmentPerformance: profile.readinessScore?.breakdown?.assessmentPerformance || 0,
      projects: profile.readinessScore?.breakdown?.projects || 0,
      resume: profile.readinessScore?.breakdown?.resume || 0,
      interviewPerformance: profile.readinessScore?.breakdown?.interviewPerformance || 0,
      roadmapProgress: profile.readinessScore?.breakdown?.roadmapProgress || 0,
    };

    if (profile.targetCareerId) {
      const gapAnalysis = await GapEngineService.calculateCareerGap(studentId);
      targetCareer = {
        id: gapAnalysis.targetCareer._id.toString(),
        title: gapAnalysis.targetCareer.title,
      };
      readinessScore = gapAnalysis.readinessScore;
      scoreBreakdown = gapAnalysis.breakdown;

      topSkillGaps = gapAnalysis.weakSkills.slice(0, 3).map((s) => ({
        name: s.name,
        gap: s.gap || 1,
      }));

      if (topSkillGaps.length < 3) {
        gapAnalysis.missingSkills.slice(0, 3 - topSkillGaps.length).forEach((s) => {
          topSkillGaps.push({
            name: s.name,
            gap: s.requiredLevel || 3,
          });
        });
      }
    }

    // 2. Active Roadmap Progress
    const activeRoadmap = await Roadmap.findOne({ studentId, status: 'ACTIVE' });
    const roadmapProgress = activeRoadmap ? activeRoadmap.progressPercentage : (scoreBreakdown.roadmapProgress || 0);

    // 3. Projects Count
    const projectsCount = await Project.countDocuments({ studentId });

    // 4. Completed Interview Sessions Count
    const interviewsCompleted = await InterviewSession.countDocuments({
      studentId,
      status: 'COMPLETED',
    });

    // 5. Active Job Matches
    const activeJobs = await Job.find({ organizationId: orgId, isActive: true }).populate('requiredSkills.skillId');
    let matchingJobsCount = 0;
    activeJobs.forEach((job) => {
      const match = JobService.calculateJobMatch(profile.skills, job.requiredSkills);
      if (match.matchPercentage >= 50) {
        matchingJobsCount++;
      }
    });

    // 6. Recent Activities
    const recentAssessments = await AssessmentAttempt.find({ studentId, isCompleted: true })
      .populate('assessmentId', 'title')
      .sort({ completedAt: -1 })
      .limit(3);

    const recentInterviews = await InterviewSession.find({ studentId, status: 'COMPLETED' })
      .sort({ updatedAt: -1 })
      .limit(2);

    const recentActivity = [];

    recentAssessments.forEach((a) => {
      recentActivity.push({
        type: 'ASSESSMENT_COMPLETED',
        title: a.assessmentId?.title || 'Skill Assessment',
        score: a.percentage,
        date: a.completedAt,
      });
    });

    recentInterviews.forEach((i) => {
      recentActivity.push({
        type: 'INTERVIEW_COMPLETED',
        title: `${i.careerTitle} Mock Interview`,
        score: i.overallScore,
        date: i.updatedAt,
      });
    });

    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      readinessScore,
      skillProgress: scoreBreakdown.technicalSkills,
      roadmapProgress,
      projectsCount,
      interviewsCompleted,
      activeJobMatches: matchingJobsCount,
      targetCareer,
      scoreBreakdown,
      topSkillGaps,
      recentActivity: recentActivity.slice(0, 5),
    };
  }
}