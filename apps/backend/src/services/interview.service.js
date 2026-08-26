import { InterviewSession } from '../models/interviewSession.model.js';
import { Career } from '../models/career.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { GeminiService } from '../integrations/gemini/gemini.service.js';
import { GapEngineService } from './gapEngine.service.js';
import { ProfileService } from './profile.service.js';
import { notFound, badRequest, forbidden } from '../utils/errors.js';

export class InterviewService {
  /**
   * Sanitizes session payload so answer keys are never leaked to students for active/unanswered questions.
   */
  static sanitizeSession(sessionDoc) {
    if (!sessionDoc) return null;
    const session = sessionDoc.toObject ? sessionDoc.toObject() : { ...sessionDoc };

    if (session.questions && Array.isArray(session.questions)) {
      session.questions = session.questions.map((q) => {
        // If question has not been answered yet, strip model answers and expected key points
        if (!q.studentAnswer && session.status !== 'COMPLETED') {
          const { suggestedAnswer, ...sanitizedQ } = q;
          return sanitizedQ;
        }
        return q;
      });
    }

    return session;
  }

  /**
   * Starts a new AI Mock Interview Session and generates question 1.
   */
  static async startSession(studentId, orgId, { careerId = null, difficulty = 'MEDIUM', totalQuestions = 3 } = {}) {
    const profile = await ProfileService.getOrCreateProfile(studentId);

    const targetCareerId = careerId || profile.targetCareerId?._id || profile.targetCareerId;
    if (!targetCareerId) {
      throw badRequest('Target career path must be selected before starting an interview session.');
    }

    const career = await Career.findById(targetCareerId);
    if (!career || !career.isActive) {
      throw notFound('Target career not found or inactive');
    }

    // 1. Generate first question via Gemini AI
    const firstQuestionData = await GeminiService.generateInterviewQuestion({
      targetCareer: { title: career.title },
      difficulty,
      questionNumber: 1,
      previousQuestions: [],
      userId: studentId,
      orgId,
    });

    // 2. Create Interview Session
    const session = await InterviewSession.create({
      studentId,
      organizationId: orgId,
      careerId: career._id,
      careerTitle: career.title,
      difficulty,
      totalQuestions,
      currentQuestionIndex: 0,
      status: 'IN_PROGRESS',
      questions: [
        {
          questionNumber: 1,
          questionText: firstQuestionData.questionText,
          skillTested: firstQuestionData.skillTested,
          suggestedAnswer: firstQuestionData.expectedKeyPoints?.join('; ') || '',
        },
      ],
    });

    return this.sanitizeSession(session);
  }

  /**
   * Submits student answer, computes evaluation, and advances session state machine.
   */
  static async submitAnswer(studentId, sessionId, answer) {
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      throw notFound('Interview session not found');
    }

    if (session.studentId.toString() !== studentId.toString()) {
      throw forbidden('You are not authorized to access this session');
    }

    if (session.status !== 'IN_PROGRESS') {
      throw badRequest('This interview session is already completed or closed.');
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      throw badRequest('Invalid question index');
    }

    // 1. Evaluate answer via Gemini AI
    const evaluation = await GeminiService.evaluateInterviewAnswer({
      questionText: currentQuestion.questionText,
      skillTested: currentQuestion.skillTested,
      studentAnswer: answer,
      difficulty: session.difficulty,
      userId: studentId,
      orgId: session.organizationId,
    });

    // 2. Update current question evaluation results
    currentQuestion.studentAnswer = answer;
    currentQuestion.score = evaluation.score || 70;
    currentQuestion.technicalCorrectness = evaluation.technicalCorrectness || 70;
    currentQuestion.problemSolving = evaluation.problemSolving || 70;
    currentQuestion.communication = evaluation.communication || 75;
    currentQuestion.feedback = evaluation.feedback || 'Good attempt.';
    currentQuestion.strengths = evaluation.strengths || [];
    currentQuestion.improvements = evaluation.improvements || [];
    currentQuestion.suggestedAnswer = evaluation.suggestedAnswer || currentQuestion.suggestedAnswer;
    currentQuestion.answeredAt = new Date();

    // 3. Determine if more questions remain
    const nextQuestionNumber = session.currentQuestionIndex + 2;

    if (nextQuestionNumber <= session.totalQuestions) {
      // Generate Next Question
      const previousQuestions = session.questions.map((q) => q.questionText);
      const nextQuestionData = await GeminiService.generateInterviewQuestion({
        targetCareer: { title: session.careerTitle },
        difficulty: session.difficulty,
        questionNumber: nextQuestionNumber,
        previousQuestions,
        userId: studentId,
        orgId: session.organizationId,
      });

      session.questions.push({
        questionNumber: nextQuestionNumber,
        questionText: nextQuestionData.questionText,
        skillTested: nextQuestionData.skillTested,
        suggestedAnswer: nextQuestionData.expectedKeyPoints?.join('; ') || '',
      });

      session.currentQuestionIndex += 1;
    } else {
      // All questions completed -> finalize session
      session.status = 'COMPLETED';

      const totalScore = session.questions.reduce((sum, q) => sum + (q.score || 0), 0);
      session.overallScore = Math.round(totalScore / session.totalQuestions);

      // Update student profile placement readiness score
      const profile = await StudentProfile.findOne({ userId: studentId });
      if (profile) {
        if (!profile.readinessScore) {
          profile.readinessScore = { overall: 0, breakdown: {} };
        }
        if (!profile.readinessScore.breakdown) {
          profile.readinessScore.breakdown = {};
        }
        profile.readinessScore.breakdown.interviewPerformance = session.overallScore;
        profile.markModified('readinessScore');
        await profile.save();

        if (profile.targetCareerId) {
          await GapEngineService.calculateCareerGap(studentId);
        }
      }
    }

    await session.save();
    return this.sanitizeSession(session);
  }

  /**
   * Retrieves single interview session by ID.
   */
  static async getSession(studentId, sessionId) {
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      throw notFound('Interview session not found');
    }

    if (session.studentId.toString() !== studentId.toString()) {
      throw forbidden('You are not authorized to view this session');
    }

    return this.sanitizeSession(session);
  }

  /**
   * Lists past interview sessions for logged-in student.
   */
  static async getHistory(studentId) {
    const sessions = await InterviewSession.find({ studentId }).sort({ createdAt: -1 });
    return sessions.map((s) => this.sanitizeSession(s));
  }
}