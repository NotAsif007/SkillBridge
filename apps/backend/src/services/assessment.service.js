import { Assessment } from '../models/assessment.model.js';
import { AssessmentAttempt } from '../models/assessmentAttempt.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { ProfileService } from './profile.service.js';
import { notFound, badRequest, forbidden } from '../utils/errors.js';

export class AssessmentService {
  /**
   * Lists available assessments with optional filters.
   */
  static async listAssessments({ skillId, difficulty } = {}) {
    const query = { isActive: true };

    if (skillId) query.skillId = skillId;
    if (difficulty) query.difficulty = difficulty;

    return Assessment.find(query)
      .populate('skillId', 'name category')
      .select('-questions.correctOptionIndex -questions.explanation')
      .sort({ difficulty: 1, title: 1 });
  }

  /**
   * Starts or resumes an assessment attempt and returns questions without answer leaks.
   */
  static async startAssessment(studentId, assessmentId, orgId = null) {
    const assessment = await Assessment.findById(assessmentId).populate('skillId', 'name category');
    if (!assessment || !assessment.isActive) {
      throw notFound('Assessment not found or inactive');
    }

    if (!assessment.questions || assessment.questions.length === 0) {
      throw badRequest('Assessment does not have questions available yet');
    }

    // Reuse existing active (uncompleted) attempt if recent (within duration + 10 mins grace)
    const durationMs = (assessment.durationMinutes + 10) * 60 * 1000;
    let attempt = await AssessmentAttempt.findOne({
      assessmentId: assessment._id,
      studentId,
      isCompleted: false,
      startedAt: { $gte: new Date(Date.now() - durationMs) },
    });

    if (!attempt) {
      // Create a new in-progress attempt record
      attempt = await AssessmentAttempt.create({
        assessmentId: assessment._id,
        studentId,
        organizationId: orgId,
        skillId: assessment.skillId._id,
        isCompleted: false,
        startedAt: new Date(),
      });
    }

    // Sanitize questions (strip correctOptionIndex and explanation)
    const sanitizedQuestions = assessment.questions.map((q, idx) => ({
      questionIndex: idx,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      points: q.points,
    }));

    return {
      attemptId: attempt._id,
      assessmentId: assessment._id,
      title: assessment.title,
      description: assessment.description,
      skillName: assessment.skillId.name,
      difficulty: assessment.difficulty,
      durationMinutes: assessment.durationMinutes,
      passingScore: assessment.passingScore,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Evaluates student answers, records score, and verifies skill proficiency on pass.
   * Strictly binds attemptId to the route assessmentId and handles concurrency.
   */
  static async submitAssessment(studentId, assessmentId, { attemptId, answers }) {
    const assessment = await Assessment.findById(assessmentId).populate('skillId', 'name category');
    if (!assessment) {
      throw notFound('Assessment not found');
    }

    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt) {
      throw notFound('Assessment attempt not found');
    }

    // Strict validation of attempt ownership and bound assessment
    if (attempt.studentId.toString() !== studentId.toString()) {
      throw forbidden('You are not authorized to submit this assessment attempt');
    }

    if (attempt.assessmentId.toString() !== assessment._id.toString()) {
      throw badRequest('This attempt was not generated for the specified assessment');
    }

    if (attempt.isCompleted) {
      throw badRequest('This assessment attempt has already been submitted');
    }

    let totalScore = 0;
    let maxScore = 0;
    const evaluatedAnswers = [];

    assessment.questions.forEach((q, idx) => {
      const qPoints = q.points || 10;
      maxScore += qPoints;

      const studentAns = (answers || []).find((a) => a.questionIndex === idx);
      const selectedIndex = studentAns ? studentAns.selectedOptionIndex : -1;
      const isCorrect = selectedIndex === q.correctOptionIndex;

      if (isCorrect) {
        totalScore += qPoints;
      }

      evaluatedAnswers.push({
        questionIndex: idx,
        selectedOptionIndex: selectedIndex,
        isCorrect,
        pointsAwarded: isCorrect ? qPoints : 0,
        timeTakenSeconds: studentAns?.timeTakenSeconds || 0,
      });
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= assessment.passingScore;

    // Update attempt
    attempt.score = totalScore;
    attempt.maxScore = maxScore;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.isCompleted = true;
    attempt.completedAt = new Date();
    attempt.answers = evaluatedAnswers;

    await attempt.save();

    // If passed, upgrade skill proficiency level & verify skill in student profile
    let skillUpdate = null;
    if (passed) {
      const targetProficiency =
        assessment.difficulty === 'ADVANCED' ? 5 : assessment.difficulty === 'INTERMEDIATE' ? 4 : 3;

      const profile = await ProfileService.getOrCreateProfile(studentId);
      const existingSkill = profile.skills.find(
        (s) => s.skillId.toString() === assessment.skillId._id.toString()
      );

      if (existingSkill) {
        existingSkill.verified = true;
        if (existingSkill.proficiencyLevel < targetProficiency) {
          existingSkill.proficiencyLevel = targetProficiency;
        }
      } else {
        profile.skills.push({
          skillId: assessment.skillId._id,
          skillName: assessment.skillId.name,
          proficiencyLevel: targetProficiency,
          verified: true,
        });
      }

      await profile.save();

      skillUpdate = {
        skillName: assessment.skillId.name,
        verified: true,
        proficiencyLevel: targetProficiency,
      };
    }

    return {
      attemptId: attempt._id,
      score: totalScore,
      maxScore,
      percentage,
      passed,
      passingScore: assessment.passingScore,
      skillUpdate,
      feedback: passed
        ? `Congratulations! You passed the ${assessment.difficulty.toLowerCase()} assessment for ${assessment.skillId.name}.`
        : `You scored ${percentage}%. Passing threshold is ${assessment.passingScore}%. Keep practicing!`,
    };
  }

  /**
   * Retrieves past assessment attempts for a student.
   */
  static async getStudentAttempts(studentId) {
    return AssessmentAttempt.find({ studentId })
      .populate('assessmentId', 'title difficulty durationMinutes')
      .populate('skillId', 'name category')
      .sort({ createdAt: -1 });
  }
}