import mongoose from 'mongoose';

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Career title is required'],
      unique: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      default: 'Software Engineering',
    },
    description: {
      type: String,
      default: '',
    },
    overview: {
      type: String,
      default: '',
    },
    averageSalaryRange: {
      min: { type: Number, default: 400000 },
      max: { type: Number, default: 1500000 },
      currency: { type: String, default: 'INR' },
    },
    marketDemand: {
      type: String,
      enum: ['HIGH', 'VERY_HIGH', 'MODERATE'],
      default: 'HIGH',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Career = mongoose.model('Career', careerSchema);