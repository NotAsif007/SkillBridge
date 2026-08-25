import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowedDomains: [String],
      defaultPlacementWeightages: {
        technicalSkills: { type: Number, default: 30 },
        assessmentPerformance: { type: Number, default: 20 },
        projects: { type: Number, default: 15 },
        resume: { type: Number, default: 10 },
        interviewPerformance: { type: Number, default: 15 },
        roadmapProgress: { type: Number, default: 10 },
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Organization = mongoose.model('Organization', organizationSchema);