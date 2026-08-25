import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    technologies: {
      type: [String],
      required: [true, 'At least one technology is required'],
      validate: [(v) => v.length > 0, 'Technologies array cannot be empty'],
    },
    githubUrl: {
      type: String,
      trim: true,
      default: null,
    },
    liveDemoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    keyFeatures: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'INTERMEDIATE',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model('Project', projectSchema);