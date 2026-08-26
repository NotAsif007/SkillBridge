import { Resume } from '../models/resume.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { GapEngineService } from './gapEngine.service.js';
import { GeminiService } from '../integrations/gemini/gemini.service.js';
import { ProfileService } from './profile.service.js';
import { notFound, forbidden } from '../utils/errors.js';

export class ResumeService {
  /**
   * Evaluates student resume against ATS & industry placement benchmarks.
   */
  static async analyzeResume(studentId, orgId, { resumeText, fileName = 'resume.txt', targetCareer = null }) {
    const profile = await ProfileService.getOrCreateProfile(studentId);

    const careerTitle =
      targetCareer ||
      profile.targetCareerId?.title ||
      'Software Engineering';

    // 1. Invoke Gemini AI structured resume analysis
    const analysis = await GeminiService.analyzeResumeText({
      resumeText,
      targetCareer: careerTitle,
      userId: studentId,
      orgId,
    });

    // 2. Persist evaluation record
    const resume = await Resume.create({
      studentId,
      organizationId: orgId,
      fileName,
      resumeText,
      atsScore: analysis.score || 70,
      formattingScore: analysis.formattingScore || 75,
      impactScore: analysis.impactScore || 65,
      extractedSkills: analysis.extractedSkills || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      recommendations: analysis.recommendations || [],
      targetCareer: careerTitle,
    });

    // 3. Update student profile readiness score breakdown
    if (profile) {
      if (!profile.readinessScore) {
        profile.readinessScore = { overall: 0, breakdown: {} };
      }
      profile.readinessScore.breakdown.resume = resume.atsScore;
      await profile.save();

      // Refresh full readiness score if career is linked
      if (profile.targetCareerId) {
        await GapEngineService.calculateCareerGap(studentId);
      }
    }

    return resume;
  }

  /**
   * Retrieves the most recent resume evaluation for student.
   */
  static async getLatestResume(studentId) {
    return Resume.findOne({ studentId }).sort({ createdAt: -1 });
  }

  /**
   * Retrieves history of resume evaluations (redacting raw text for privacy/bandwidth).
   */
  static async getResumeHistory(studentId) {
    return Resume.find({ studentId })
      .select('-resumeText')
      .sort({ createdAt: -1 });
  }

  /**
   * Deletes a resume evaluation for data retention/privacy compliance.
   */
  static async deleteResume(studentId, resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, studentId });
    if (!resume) {
      throw notFound('Resume record not found');
    }

    await Resume.deleteOne({ _id: resume._id });
    return { id: resumeId, deleted: true };
  }
}