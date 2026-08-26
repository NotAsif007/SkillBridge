import { StudentProfile } from '../models/studentProfile.model.js';
import { Career } from '../models/career.model.js';
import { CareerRequirement } from '../models/careerRequirement.model.js';
import { AssessmentAttempt } from '../models/assessmentAttempt.model.js';
import { Organization } from '../models/organization.model.js';
import { ProfileService } from './profile.service.js';
import { notFound, badRequest } from '../utils/errors.js';

export class GapEngineService {
  /**
   * Performs full deterministic gap analysis and placement readiness scoring for a student.
   * @param {string} studentId - The User ID of the student.
   * @param {string|null} overrideCareerId - Optional career ID to analyze against.
   */
  static async calculateCareerGap(studentId, overrideCareerId = null) {
    const profile = await ProfileService.getOrCreateProfile(studentId);

    const careerId = overrideCareerId || profile.targetCareerId?._id || profile.targetCareerId;
    if (!careerId) {
      throw badRequest(
        'No target career selected. Please set a target career in your profile or provide careerId query parameter.'
      );
    }

    const career = await Career.findById(careerId);
    if (!career || !career.isActive) {
      throw notFound('Target career path not found or inactive');
    }

    // Fetch all requirements for the target career
    const requirements = await CareerRequirement.find({ careerId: career._id })
      .populate('skillId', 'name category')
      .sort({ weight: -1 });

    if (requirements.length === 0) {
      throw badRequest('Target career does not have requirement weightings configured.');
    }

    // 1. Analyze Skill Gaps (Matched, Weak, Missing, Priority)
    const {
      matchedSkills,
      weakSkills,
      missingSkills,
      prioritySkills,
      technicalSkillScore,
      totalGapLevels,
    } = this.evaluateSkills(profile.skills, requirements);

    // 2. Compute other component scores (Assessments, Projects, Resume, Interview, Roadmap)
    const assessmentScore = await this.evaluateAssessments(studentId, requirements);

    // Project, Resume, Interview, Roadmap scores (will be linked to respective models in upcoming phases, defaulting to profile baseline)
    const projectScore = profile.readinessScore?.breakdown?.projects || 0;
    const resumeScore = profile.readinessScore?.breakdown?.resume || 0;
    const interviewScore = profile.readinessScore?.breakdown?.interviewPerformance || 0;
    const roadmapScore = profile.readinessScore?.breakdown?.roadmapProgress || 0;

    // 3. Retrieve Organization Placement Weights
    const defaultWeights = {
      technicalSkills: 30,
      assessmentPerformance: 20,
      projects: 15,
      resume: 10,
      interviewPerformance: 15,
      roadmapProgress: 10,
    };
    let weights = defaultWeights;

    if (profile.organizationId) {
      const org = await Organization.findById(profile.organizationId);
      if (org?.settings?.defaultPlacementWeightages) {
        // Merge instead of trusting a possibly partial document. This keeps
        // readiness stable if an organization config predates a new pillar.
        weights = { ...defaultWeights, ...org.settings.defaultPlacementWeightages };
      }
    }

    const normalizedWeights = Object.fromEntries(
      Object.entries(weights).map(([key, value]) => [
        key,
        Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0,
      ])
    );

    // 4. Calculate Authoritative Placement Readiness Score
    const totalWeight =
      normalizedWeights.technicalSkills +
      normalizedWeights.assessmentPerformance +
      normalizedWeights.projects +
      normalizedWeights.resume +
      normalizedWeights.interviewPerformance +
      normalizedWeights.roadmapProgress;

    const weightedSum =
      technicalSkillScore * normalizedWeights.technicalSkills +
      assessmentScore * normalizedWeights.assessmentPerformance +
      projectScore * normalizedWeights.projects +
      resumeScore * normalizedWeights.resume +
      interviewScore * normalizedWeights.interviewPerformance +
      roadmapScore * normalizedWeights.roadmapProgress;

    const overallReadinessScore = Math.min(
      100,
      Math.max(0, Math.round(weightedSum / (totalWeight || 100)))
    );

    const breakdown = {
      technicalSkills: technicalSkillScore,
      assessmentPerformance: assessmentScore,
      projects: projectScore,
      resume: resumeScore,
      interviewPerformance: interviewScore,
      roadmapProgress: roadmapScore,
    };

    // 5. Update StudentProfile in DB if evaluating against primary target career
    if (!overrideCareerId || overrideCareerId.toString() === profile.targetCareerId?._id?.toString()) {
      profile.readinessScore = {
        overall: overallReadinessScore,
        breakdown,
        lastCalculatedAt: new Date(),
      };
      await profile.save();
    }

    // 6. Estimated weeks to readiness (2 weeks per total gap level + base 2 weeks)
    const estimatedWeeksToReady = Math.max(1, totalGapLevels * 2);

    // 7. Qualitative Insights
    let aiInsights = '';
    if (overallReadinessScore >= 80) {
      aiInsights = `Excellent placement readiness for ${career.title}! Continue maintaining interview and project sharpness.`;
    } else if (overallReadinessScore >= 60) {
      aiInsights = `Good progress toward ${career.title}. Focus on closing high-priority skill gaps: ${prioritySkills.slice(0, 3).join(', ')}.`;
    } else {
      aiInsights = `Building foundational competency for ${career.title}. Prioritize learning: ${prioritySkills.slice(0, 3).join(', ')}.`;
    }

    return {
      targetCareer: {
        _id: career._id,
        title: career.title,
        slug: career.slug,
        category: career.category,
      },
      readinessScore: overallReadinessScore,
      breakdown,
      matchedSkills,
      weakSkills,
      missingSkills,
      prioritySkills,
      estimatedWeeksToReady,
      aiInsights,
    };
  }

  /**
   * Deterministically evaluates student skills against career requirements.
   */
  static evaluateSkills(studentSkills, requirements) {
    const studentSkillMap = new Map();
    (studentSkills || []).forEach((s) => {
      const skillId = s.skillId?.toString();
      if (!skillId) return;
      const existing = studentSkillMap.get(skillId);
      // A duplicated profile entry must never lower an already recorded skill.
      if (existing && existing.level > (s.proficiencyLevel || 1)) return;
      studentSkillMap.set(skillId, {
        name: s.skillName,
        level: s.proficiencyLevel || 1,
        verified: s.verified || false,
      });
    });

    const matchedSkills = [];
    const weakSkills = [];
    const missingSkills = [];
    const priorityItems = [];

    let totalWeight = 0;
    let earnedWeight = 0;
    let totalGapLevels = 0;

    requirements.forEach((req) => {
      const skillIdStr = req.skillId?._id?.toString() || req.skillId?.toString();
      const skillName = req.skillId?.name || 'Skill';
      const requiredLevel = req.requiredProficiency || 3;
      const weight = req.weight || 5;

      totalWeight += weight;

      const studentSkill = studentSkillMap.get(skillIdStr);

      if (!studentSkill) {
        // Missing Skill
        missingSkills.push({
          skillId: skillIdStr,
          name: skillName,
          requiredLevel,
          importance: req.importance,
          weight,
        });

        totalGapLevels += requiredLevel;
        priorityItems.push({
          name: skillName,
          priorityScore: weight * (requiredLevel + 1),
        });
      } else if (studentSkill.level >= requiredLevel) {
        // Matched Skill
        matchedSkills.push({
          skillId: skillIdStr,
          name: skillName,
          level: studentSkill.level,
          requiredLevel,
          verified: studentSkill.verified,
        });

        earnedWeight += weight;
      } else {
        // Weak Skill
        const gap = requiredLevel - studentSkill.level;
        weakSkills.push({
          skillId: skillIdStr,
          name: skillName,
          level: studentSkill.level,
          requiredLevel,
          gap,
          verified: studentSkill.verified,
        });

        totalGapLevels += gap;
        earnedWeight += (studentSkill.level / requiredLevel) * weight;

        priorityItems.push({
          name: skillName,
          priorityScore: weight * (gap + 1),
        });
      }
    });

    // Sort priority skills by priority score descending
    priorityItems.sort((a, b) => b.priorityScore - a.priorityScore);
    const prioritySkills = priorityItems.map((p) => p.name);

    const technicalSkillScore =
      totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    return {
      matchedSkills,
      weakSkills,
      missingSkills,
      prioritySkills,
      technicalSkillScore,
      totalGapLevels,
    };
  }

  /**
   * Computes assessment component score based on attempts for required skills.
   */
  static async evaluateAssessments(studentId, requirements) {
    const requiredSkillIds = requirements.map((r) => r.skillId?._id || r.skillId);

    const attempts = await AssessmentAttempt.find({
      studentId,
      skillId: { $in: requiredSkillIds },
      isCompleted: true,
    });

    if (attempts.length === 0) {
      return 0;
    }

    // One score per required skill avoids attempt volume skewing the readiness
    // score. We use the student's latest completed assessment for each skill.
    const latestBySkill = new Map();
    attempts.forEach((attempt) => {
      const skillId = attempt.skillId.toString();
      const previous = latestBySkill.get(skillId);
      const attemptDate = attempt.completedAt || attempt.updatedAt || attempt.createdAt;
      const previousDate = previous && (previous.completedAt || previous.updatedAt || previous.createdAt);
      if (!previous || new Date(attemptDate) > new Date(previousDate)) {
        latestBySkill.set(skillId, attempt);
      }
    });

    const totalPercentage = [...latestBySkill.values()]
      .reduce((total, attempt) => total + Math.min(100, Math.max(0, attempt.percentage || 0)), 0);
    return Math.round(totalPercentage / latestBySkill.size);
  }
}
