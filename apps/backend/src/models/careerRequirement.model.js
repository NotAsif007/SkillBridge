import mongoose from 'mongoose';

const careerRequirementSchema = new mongoose.Schema(
  {
    careerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      required: [true, 'Career ID is required'],
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill ID is required'],
      index: true,
    },
    importance: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'High',
    },
    requiredProficiency: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    weight: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique skill requirement per career
careerRequirementSchema.index({ careerId: 1, skillId: 1 }, { unique: true });

export const CareerRequirement = mongoose.model('CareerRequirement', careerRequirementSchema);