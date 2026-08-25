import { Roadmap } from '../models/roadmap.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { Career } from '../models/career.model.js';
import { GapEngineService } from './gapEngine.service.js';
import { GeminiService } from '../integrations/gemini/gemini.service.js';
import { ProfileService } from './profile.service.js';
import { notFound, badRequest } from '../utils/errors.js';

export class RoadmapService {
  /**
   * Retrieves active roadmap for student.
   */
  static async getActiveRoadmap(studentId) {
    const roadmap = await Roadmap.findOne({ studentId, status: 'ACTIVE' })
      .populate('careerId', 'title slug category overview')
      .sort({ createdAt: -1 });

    return roadmap;
  }

  /**
   * Generates a tailored learning roadmap using Gap Engine & Gemini AI.
   */
  static async generateRoadmap(studentId, { careerId = null, durationWeeks = 8 } = {}) {
    const profile = await ProfileService.getOrCreateProfile(studentId);

    const targetCareerId = careerId || profile.targetCareerId?._id || profile.targetCareerId;
    if (!targetCareerId) {
      throw badRequest('Target career path must be selected before generating a roadmap.');
    }

    const career = await Career.findById(targetCareerId);
    if (!career || !career.isActive) {
      throw notFound('Target career path not found or inactive');
    }

    // 1. Calculate gap to know exact missing and weak skills
    const gapAnalysis = await GapEngineService.calculateCareerGap(studentId, career._id);

    // 2. Generate roadmap structure via Gemini AI
    const aiRoadmap = await GeminiService.generateRoadmap({
      targetCareer: { title: career.title },
      missingSkills: gapAnalysis.missingSkills,
      weakSkills: gapAnalysis.weakSkills,
      durationWeeks,
      userId: studentId,
      orgId: profile.organizationId,
    });

    // 3. Archive any prior active roadmaps
    await Roadmap.updateMany(
      { studentId, status: 'ACTIVE' },
      { $set: { status: 'ARCHIVED' } }
    );

    // 4. Create new Active Roadmap
    const newRoadmap = await Roadmap.create({
      studentId,
      organizationId: profile.organizationId,
      careerId: career._id,
      title: `${durationWeeks}-Week Career Readiness Plan for ${career.title}`,
      totalWeeks: durationWeeks,
      progressPercentage: 0,
      status: 'ACTIVE',
      milestones: aiRoadmap.milestones || [],
    });

    // 5. Reset roadmapProgress in student profile
    if (profile.readinessScore?.breakdown) {
      profile.readinessScore.breakdown.roadmapProgress = 0;
      await profile.save();
    }

    return Roadmap.findById(newRoadmap._id).populate('careerId', 'title slug category overview');
  }

  /**
   * Toggles completion status of a roadmap task and updates overall progress.
   */
  static async toggleTask(studentId, taskId, isCompleted) {
    const roadmap = await Roadmap.findOne({ studentId, status: 'ACTIVE' });
    if (!roadmap) {
      throw notFound('No active roadmap found for student');
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