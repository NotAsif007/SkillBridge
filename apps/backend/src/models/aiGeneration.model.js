import mongoose from 'mongoose';

const aiGenerationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    feature: {
      type: String,
      enum: [
        'CAREER_GAP',
        'ROADMAP_GEN',
        'RESUME_ANALYSIS',
        'INTERVIEW_QUESTION',
        'INTERVIEW_EVALUATION',
        'PROJECT_RECOMMENDATION',
      ],
      required: true,
      index: true,
    },
    modelUsed: {
      type: String,
      default: 'gemini-1.5-flash',
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'ERROR', 'FALLBACK'],
      default: 'SUCCESS',
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const AIGeneration = mongoose.model('AIGeneration', aiGenerationSchema);