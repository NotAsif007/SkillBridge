import mongoose from 'mongoose';

const jobRequiredSkillSchema = new mongoose.Schema(
  {
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    minProficiency: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },
    weight: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
  },
  { _id: false }
);

const jobEligibilitySchema = new mongoose.Schema(
  {
    minCgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    eligibleDepartments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
      default: [],
    },
    graduationYears: {
      type: [Number],
      default: [],
    },
  },
  { _id: false }
);

const jobSalarySchema = new mongoose.Schema(
  {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'],
      default: 'FULL_TIME',
    },
    workplaceType: {
      type: String,
      enum: ['ON_SITE', 'HYBRID', 'REMOTE'],
      default: 'REMOTE',
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    salaryRange: {
      type: jobSalarySchema,
      default: () => ({ min: 0, max: 0, currency: 'INR' }),
    },
    eligibility: {
      type: jobEligibilitySchema,
      default: () => ({ minCgpa: 0, eligibleDepartments: [], graduationYears: [] }),
    },
    requiredSkills: {
      type: [jobRequiredSkillSchema],
      default: [],
    },
    deadline: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model('Job', jobSchema);