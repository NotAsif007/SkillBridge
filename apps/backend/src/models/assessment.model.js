import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['MULTIPLE_CHOICE', 'CODE_SNIPPET', 'TRUE_FALSE'],
      default: 'MULTIPLE_CHOICE',
    },
    options: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length >= 2,
        'Question must have at least 2 options',
      ],
    },
    correctOptionIndex: {
      type: Number,
      required: [true, 'Correct option index is required'],
      min: 0,
    },
    explanation: {
      type: String,
      default: '',
    },
    points: {
      type: Number,
      default: 10,
      min: 1,
    },
  },
  { _id: true }
);

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill ID is required'],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'INTERMEDIATE',
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 5,
      max: 180,
    },
    passingScore: {
      type: Number,
      default: 70, // 70%
      min: 1,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    questions: {
      type: [questionSchema],
      default: [],
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

// Pre-save hook to update totalQuestions automatically
assessmentSchema.pre('save', function (next) {
  if (this.questions) {
    this.totalQuestions = this.questions.length;
  }
  next();
});

export const Assessment = mongoose.model('Assessment', assessmentSchema);