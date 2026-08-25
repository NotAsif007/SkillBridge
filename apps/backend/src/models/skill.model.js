import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Programming',
        'Frontend',
        'Backend',
        'Database',
        'DevOps',
        'Cloud',
        'AI/ML',
        'Data',
        'Cybersecurity',
        'Soft Skills',
      ],
      required: [true, 'Skill category is required'],
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    proficiencyLevels: [
      {
        level: { type: Number, min: 1, max: 5 },
        description: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Skill = mongoose.model('Skill', skillSchema);