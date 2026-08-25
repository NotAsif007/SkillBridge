import mongoose from 'mongoose';

const studentSkillSchema = new mongoose.Schema(
  {
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    skillName: {
      type: String,
      required: true,
    },
    proficiencyLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastAssessedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const readinessScoreSchema = new mongoose.Schema(
  {
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    breakdown: {
      technicalSkills: { type: Number, default: 0 },
      assessmentPerformance: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      resume: { type: Number, default: 0 },
      interviewPerformance: { type: Number, default: 0 },
      roadmapProgress: { type: Number, default: 0 },
    },
    lastCalculatedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      default: null,
    },
    graduationYear: {
      type: Number,
      min: 2020,
      max: 2035,
      default: null,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    targetCareerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      default: null,
      index: true,
    },
    skills: {
      type: [studentSkillSchema],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    preferredRoles: {
      type: [String],
      default: [],
    },
    preferredLocations: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
    },
    readinessScore: {
      type: readinessScoreSchema,
      default: () => ({
        overall: 0,
        breakdown: {
          technicalSkills: 0,
          assessmentPerformance: 0,
          projects: 0,
          resume: 0,
          interviewPerformance: 0,
          roadmapProgress: 0,
        },
        lastCalculatedAt: null,
      }),
    },
  },
  {
    timestamps: true,
  }
);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);