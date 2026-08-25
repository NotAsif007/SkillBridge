import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    skillTested: {
      type: String,
      required: true,
    },
    studentAnswer: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    technicalCorrectness: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    problemSolving: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    communication: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    feedback: {
      type: String,
      default: null,
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    suggestedAnswer: {
      type: String,
      default: null,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    careerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      required: [true, 'Career ID is required'],
      index: true,
    },
    careerTitle: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    totalQuestions: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    questions: {
      type: [interviewQuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);