import { Project } from '../models/project.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { Career } from '../models/career.model.js';
import { GapEngineService } from './gapEngine.service.js';
import { GeminiService } from '../integrations/gemini/gemini.service.js';
import { ProfileService } from './profile.service.js';
import { notFound, forbidden } from '../utils/errors.js';

export class ProjectService {
  /**
   * Lists all portfolio projects added by the student.
   */
  static async getStudentProjects(studentId) {
    return Project.find({ studentId }).sort({ createdAt: -1 });
  }

  /**
   * Adds a new project to the student's portfolio and recalculates readiness.
   */
  static async createProject(studentId, orgId, projectData) {
    const project = await Project.create({
      ...projectData,
      studentId,
      organizationId: orgId,
    });

    await this.recalculateProjectScore(studentId);

    return project;
  }

  /**
   * Updates an existing project and refreshes readiness scores.
   */
  static async updateProject(studentId, projectId, updateData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw notFound('Project not found');
    }

    if (project.studentId.toString() !== studentId.toString()) {
      throw forbidden('You are not authorized to update this project');
    }

    Object.assign(project, updateData);
    await project.save();

    await this.recalculateProjectScore(studentId);

    return project;
  }

  /**
   * Removes a project from student portfolio.
   */
  static async deleteProject(studentId, projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw notFound('Project not found');
    }

    if (project.studentId.toString() !== studentId.toString()) {
      throw forbidden('You are not authorized to delete this project');
    }

    await Project.findByIdAndDelete(projectId);

    await this.recalculateProjectScore(studentId);

    return { message: 'Project deleted successfully' };
  }

  /**
   * Recommends personalized portfolio projects based on student's missing/weak skills.
   */
  static async getProjectRecommendations(studentId) {
    const profile = await ProfileService.getOrCreateProfile(studentId);

    let targetCareerTitle = 'Software Engineering';
    let missingSkills = [];

    if (profile.targetCareerId) {
      const gapAnalysis = await GapEngineService.calculateCareerGap(studentId);
      targetCareerTitle = gapAnalysis.targetCareer.title;
      missingSkills = gapAnalysis.missingSkills;
    }

    return GeminiService.recommendProjects({
      targetCareer: { title: targetCareerTitle },
      missingSkills,
      currentSkillLevel: profile.experienceLevel || 'INTERMEDIATE',
      userId: studentId,
      orgId: profile.organizationId,
    });
  }

  /**
   * Deterministically computes the project score component for placement readiness.
   */
  static async recalculateProjectScore(studentId) {
    const projects = await Project.find({ studentId });

    let rawScore = 0;
    projects.forEach((p) => {
      // Difficulty weight
      const difficultyPoints =
        p.difficulty === 'ADVANCED' ? 50 : p.difficulty === 'INTERMEDIATE' ? 35 : 25;
      rawScore += difficultyPoints;

      // Bonus for verification or public repository links
      if (p.githubUrl) rawScore += 5;
      if (p.liveDemoUrl) rawScore += 5;
      if (p.verified) rawScore += 10;
    });

    const projectScore = Math.min(100, rawScore);

    const profile = await StudentProfile.findOne({ userId: studentId });
    if (profile) {
      if (!profile.readinessScore) {
        profile.readinessScore = { overall: 0, breakdown: {} };
      }
      profile.readinessScore.breakdown.projects = projectScore;
      await profile.save();

      // Recalculate full gap analysis if target career is configured
      if (profile.targetCareerId) {
        await GapEngineService.calculateCareerGap(studentId);
      }
    }

    return projectScore;
  }
}