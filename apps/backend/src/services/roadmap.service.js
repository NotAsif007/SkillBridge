import { Roadmap } from '../models/roadmap.model.js';
import { Career } from '../models/career.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { GeminiService } from '../integrations/gemini/gemini.service.js';
import { GapEngineService } from './gapEngine.service.js';
import { ProfileService } from './profile.service.js';
import { notFound, badRequest } from '../utils/errors.js';

export class RoadmapService {
  /**
   * Retrieves currently active or completed roadmap for student.
   */
  static async getActiveRoadmap(studentId) {
    return Roadmap.findOne({ studentId, status: { $in: ['ACTIVE', 'COMPLETED'] } })
      .populate('careerId', 'title slug category overview averageSalaryRange')
      .sort({ createdAt: -1 });
  }

  /**
   * Generates a personalized career milestone roadmap via Gemini AI.
   */
  static async generateRoadmap(studentId, orgId, { careerId = null, durationWeeks = 8 } = {}) {
    const profile = await ProfileService.getOrCreateProfile(studentId);

    const targetCareerId = careerId || profile.targetCareerId?._id || profile.targetCareerId;
    if (!targetCareerId) {
      throw badRequest('Target career path must be selected before generating a roadmap.');
    }

    const career = await Career.findById(targetCareerId);
    if (!career || !career.isActive) {
      throw notFound('Target career path not found or inactive');
    }

    // 1. Calculate gap analysis to feed into AI prompt
    const gapAnalysis = await GapEngineService.calculateCareerGap(studentId, targetCareerId);

    // 2. Invoke Gemini AI to generate weekly milestone plan
    const aiRoadmap = await GeminiService.generateRoadmap({
      targetCareer: career.title,
      missingSkills: gapAnalysis.missingSkills,
      weakSkills: gapAnalysis.weakSkills,
      durationWeeks,
      userId: studentId,
      orgId,
    });

    // 3. Atomically archive existing active roadmaps
    await Roadmap.updateMany(
      { studentId, status: 'ACTIVE' },
      { $set: { status: 'ARCHIVED' } }
    );

    // Ensure all milestones and tasks strictly adhere to schema
    const sanitizedMilestones = (aiRoadmap.milestones || []).map((m, mIdx) => ({
      weekNumber: m.weekNumber || mIdx + 1,
      title: m.title || `Week ${mIdx + 1}`,
      description: m.description || '',
      skillsCovered: m.skillsCovered || [],
      isCompleted: false,
      tasks: (m.tasks || []).map((t, tIdx) => ({
        taskId: t.taskId || `w${m.weekNumber || mIdx + 1}_t${tIdx + 1}`,
        title: t.title || 'Complete milestone practice task',
        resourceLink: t.resourceLink || '',
        isCompleted: false,
      })),
    }));

    // 4. Persist new roadmap
    const newRoadmap = await Roadmap.create({
      studentId,
      organizationId: orgId,
      careerId: career._id,
      title: `${durationWeeks}-Week Career Readiness Plan for ${career.title}`,
      totalWeeks: durationWeeks,
      status: 'ACTIVE',
      progressPercentage: 0,
      milestones: sanitizedMilestones,
    });

    // 5. Reset roadmapProgress in student profile
    if (profile.readinessScore?.breakdown) {
      profile.readinessScore.breakdown.roadmapProgress = 0;
      await profile.save();
    }

    return Roadmap.findById(newRoadmap._id).populate('careerId', 'title slug category overview');
  }

  /**
   * Toggles completion status of a roadmap task and updates overall progress reversibly.
   */
  static async toggleTask(studentId, taskId, isCompleted) {
    const roadmap = await Roadmap.findOne({
      studentId,
      status: { $in: ['ACTIVE', 'COMPLETED'] },
    }).sort({ createdAt: -1 });

    if (!roadmap) {
      throw notFound('No active or completed roadmap found for student');
    }

    let taskFound = false;
    let totalTasks = 0;
    let completedTasks = 0;

    for (const milestone of roadmap.milestones) {
      for (const task of milestone.tasks) {
        totalTasks++;

        if (task.taskId === taskId) {
          task.isCompleted = isCompleted;
          task.completedAt = isCompleted ? new Date() : null;
          taskFound = true;
        }

        if (task.isCompleted) {
          completedTasks++;
        }
      }

      // Check if all tasks in this milestone are finished
      milestone.isCompleted =
        milestone.tasks.length > 0 && milestone.tasks.every((t) => t.isCompleted);
    }

    if (!taskFound) {
      throw notFound(`Task '${taskId}' not found in active roadmap`);
    }

    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    roadmap.progressPercentage = progressPercentage;
    if (progressPercentage === 100) {
      roadmap.status = 'COMPLETED';
    } else {
      roadmap.status = 'ACTIVE';
    }

    await roadmap.save();

    // Update student profile roadmap progress and recalculate placement readiness
    const profile = await StudentProfile.findOne({ userId: studentId });
    if (profile) {
      if (!profile.readinessScore) {
        profile.readinessScore = { overall: 0, breakdown: {} };
      }
      profile.readinessScore.breakdown.roadmapProgress = progressPercentage;
      await profile.save();

      // Recalculate gap engine score with fresh roadmap progress
      await GapEngineService.calculateCareerGap(studentId);
    }

    return roadmap;
  }
}