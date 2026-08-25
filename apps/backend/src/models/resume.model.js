import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
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
    fileName: {
      type: String,
      default: 'resume.txt',
    },
    fileUrl: {
      type: String,
      default: null,
    },
    resumeText: {
      type: String,
      required: [true, 'Resume text is required'],
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    formattingScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    impactScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    extractedSkills: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    targetCareer: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model('Resume', resumeSchema);