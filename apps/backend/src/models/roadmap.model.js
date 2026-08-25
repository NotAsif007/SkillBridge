import mongoose from 'mongoose';

const roadmapTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    resourceLink: {
      type: String,
      default: '',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const roadmapMilestoneSchema = new mongoose.Schema(
  {
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    skillsCovered: {
      type: [String],
      default: [],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    tasks: {
      type: [roadmapTaskSchema],
      default: [],
    },
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    totalWeeks: {
      type: Number,
      default: 8,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    milestones: {
      type: [roadmapMilestoneSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);