# CareerOS Database Specification & Schemas (MongoDB / Mongoose)

## 1. Overview
CareerOS utilizes MongoDB with Mongoose ODM in a multi-tenant, organization-scoped architecture. All organization-specific data is strictly indexed and partitioned by `organizationId`.

---

## 2. Entity-Relationship Summary

```text
Organization (1) ────< Department (N)
     │                     │
     ├────< User (N) ──────┴────< StudentProfile (1)
     │        │                       │
     │        ├──< AssessmentAttempt  ├──< Roadmap (1) ──< RoadmapItem (N)
     │        ├──< Interview (N)      ├──< Project (N)
     │        ├──< Resume (N)         └──< JobApplication (N)
     │        └──< Notification (N)
     │
     └──< Job (N) ────< JobApplication (N)

Platform Global:
  Career (1) ────< CareerRequirement (N) ────> Skill (1)
  Assessment (1) ──< AssessmentQuestion (N) ──> Skill (1)
  AIGeneration (N) (Audit & Safety Logs)
```

---

## 3. Collections & Schema Definitions

### 3.1. `organizations`
Represents an academic institution (e.g., college or university).
```javascript
{
  _id: ObjectId,
  name: String, // e.g. "Apex Institute of Technology"
  slug: String, // unique, e.g. "apex-tech"
  domain: String, // e.g. "apex.edu"
  logoUrl: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  isActive: { type: Boolean, default: true },
  settings: {
    allowedDomains: [String],
    defaultPlacementWeightages: {
      technicalSkills: { type: Number, default: 30 },
      assessmentPerformance: { type: Number, default: 20 },
      projects: { type: Number, default: 15 },
      resume: { type: Number, default: 10 },
      interviewPerformance: { type: Number, default: 15 },
      roadmapProgress: { type: Number, default: 10 }
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2. `departments`
Academic department within an organization.
```javascript
{
  _id: ObjectId,
  organizationId: { type: ObjectId, ref: 'Organization', required: true, index: true },
  name: String, // e.g. "Computer Science & Engineering"
  code: String, // e.g. "CSE"
  headOfDepartment: String,
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.3. `users`
Base identity document for authentication and authorization.
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['STUDENT', 'COLLEGE_ADMIN', 'SUPER_ADMIN'], default: 'STUDENT', required: true },
  organizationId: { type: ObjectId, ref: 'Organization', index: true },
  departmentId: { type: ObjectId, ref: 'Department', index: true },
  profileImage: String,
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.4. `studentProfiles`
Extended student academic and career tracking document.
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, unique: true, index: true },
  organizationId: { type: ObjectId, ref: 'Organization', required: true, index: true },
  departmentId: { type: ObjectId, ref: 'Department', index: true },
  rollNumber: String,
  graduationYear: Number,
  cgpa: Number,
  targetCareerId: { type: ObjectId, ref: 'Career', index: true },
  skills: [
    {
      skillId: { type: ObjectId, ref: 'Skill', required: true },
      skillName: String,
      proficiencyLevel: { type: Number, min: 1, max: 5, default: 1 }, // 1: Beginner, 5: Expert
      verified: { type: Boolean, default: false },
      lastAssessedAt: Date
    }
  ],
  interests: [String],
  preferredRoles: [String],
  preferredLocations: [String],
  experienceLevel: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
  readinessScore: {
    overall: { type: Number, default: 0 },
    breakdown: {
      technicalSkills: { type: Number, default: 0 },
      assessmentPerformance: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      resume: { type: Number, default: 0 },
      interviewPerformance: { type: Number, default: 0 },
      roadmapProgress: { type: Number, default: 0 }
    },
    lastCalculatedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.5. `skills`
Master repository of standardized industry skills.
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true, unique: true, index: true },
  category: { 
    type: String, 
    enum: ['Programming', 'Frontend', 'Backend', 'Database', 'DevOps', 'Cloud', 'AI/ML', 'Data', 'Cybersecurity', 'Soft Skills'], 
    required: true,
    index: true 
  },
  description: String,
  proficiencyLevels: [
    {
      level: Number,
      description: String
    }
  ],
  isVerified: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.6. `careers`
Target industry job roles.
```javascript
{
  _id: ObjectId,
  title: { type: String, required: true, unique: true, index: true }, // e.g. "Full Stack Developer"
  slug: { type: String, required: true, unique: true },
  category: String,
  description: String,
  overview: String,
  averageSalaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' }
  },
  marketDemand: { type: String, enum: ['HIGH', 'VERY_HIGH', 'MODERATE'], default: 'HIGH' },
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.7. `careerRequirements`
Specific skill requirements and weighted importance for a career.
```javascript
{
  _id: ObjectId,
  careerId: { type: ObjectId, ref: 'Career', required: true, index: true },
  skillId: { type: ObjectId, ref: 'Skill', required: true, index: true },
  importance: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'High' },
  requiredProficiency: { type: Number, min: 1, max: 5, default: 3 },
  weight: { type: Number, min: 1, max: 10, default: 5 },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.8. `assessments`
Standardized skill evaluation tests.
```javascript
{
  _id: ObjectId,
  title: { type: String, required: true },
  description: String,
  skillId: { type: ObjectId, ref: 'Skill', required: true, index: true },
  difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'INTERMEDIATE' },
  durationMinutes: { type: Number, default: 30 },
  passingScore: { type: Number, default: 70 },
  totalQuestions: Number,
  questions: [
    {
      questionText: { type: String, required: true },
      type: { type: String, enum: ['MULTIPLE_CHOICE', 'CODE_SNIPPET', 'TRUE_FALSE'], default: 'MULTIPLE_CHOICE' },
      options: [String],
      correctOptionIndex: Number,
      explanation: String,
      points: { type: Number, default: 10 }
    }
  ],
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.9. `assessmentAttempts`
Historical student assessment submissions and evaluations.
```javascript
{
  _id: ObjectId,
  assessmentId: { type: ObjectId, ref: 'Assessment', required: true, index: true },
  studentId: { type: ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: ObjectId, ref: 'Organization', required: true, index: true },
  skillId: { type: ObjectId, ref: 'Skill', required: true },
  score: Number,
  maxScore: Number,
  percentage: Number,
  passed: Boolean,
  answers: [
    {
      questionIndex: Number,
      selectedOptionIndex: Number,
      isCorrect: Boolean,
      timeTakenSeconds: Number
    }
  ],
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.10. `roadmaps`
Personalized career learning paths.
```javascript
{
  _id: ObjectId,
  studentId: { type: ObjectId, ref: 'User', required: true, unique: true, index: true },
  targetCareerId: { type: ObjectId, ref: 'Career', required: true },
  organizationId: { type: ObjectId, ref: 'Organization', required: true },
  overallProgress: { type: Number, default: 0 }, // 0 to 100%
  totalMilestones: { type: Number, default: 0 },
  completedMilestones: { type: Number, default: 0 },
  estimatedDurationWeeks: Number,
  generatedByAI: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.11. `roadmapItems`
Individual milestones and learning tasks within a student roadmap.
```javascript
{
  _id: ObjectId,
  roadmapId: { type: ObjectId, ref: 'Roadmap', required: true, index: true },
  studentId: { type: ObjectId, ref: 'User', required: true, index: true },
  weekNumber: Number,
  title: { type: String, required: true },
  description: String,
  skillsCovered: [{ type: ObjectId, ref: 'Skill' }],
  tasks: [
    {
      taskId: String,
      title: String,
      resourceLink: String,
      isCompleted: { type: Boolean, default: false },
      completedAt: Date
    }
  ],
  isCompleted: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.12. `projects`
Portfolio projects built by students.
```javascript
{
  _id: ObjectId,
  studentId: { type: ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: ObjectId, ref: 'Organization', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [String],
  skills: [{ type: ObjectId, ref: 'Skill' }],
  githubUrl: String,
  liveUrl: String,
  role: String,
  durationWeeks: Number,
  evaluationScore: Number, // 0 to 100
  aiFeedback: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.13. `resumes`
Uploaded resume metadata and Gemini AI parse results.
```javascript
{
  _id: ObjectId,
  studentId: { type: ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: ObjectId, ref: 'Organization', required: true, index: true },
  fileName: String,
  fileUrl: String,
  mimeType: String,
  fileSize: Number,
  status: { type: String, enum: ['PENDING', 'PARSED', 'ANALYZED', 'FAILED'], default: 'PENDING' },
  score: { type: Number, default: 0 }, // 0 to 100
  analysis: {
    extractedSkills: [String],
    strengths: [String],
    weaknesses: [String],
    formattingScore: Number,
    impactScore: Number,
    recommendations: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.14. `interviews`
AI Mock Interview sessions.
```javascript
{
  _id: ObjectId,
  studentId: { type: ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: ObjectId, ref: 'Organization', required: true, index: true },
  targetCareerId: { type: ObjectId, ref: 'Career', required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'], default: 'IN_PROGRESS' },
  overallScore: { type: Number, default: 0 },
  feedback: {
    technicalCorrectness: Number,
    problemSolving: Number,
    communication: Number,
    confidence: Number,
    summary: String,
    strengths: [String],
    improvements: [String]
  },
  totalQuestions: { type: Number, default: 5 },
  currentQuestionIndex: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.15. `interviewQuestions` & `interviewAnswers`
Individual QA turns inside an interview session.
```javascript
// interviewQuestions
{
  _id: ObjectId,
  interviewId: { type: ObjectId, ref: 'Interview', required: true, index: true },
  questionIndex: Number,
  skillTested: String,
  questionText: String,
  expectedKeyPoints: [String],
  createdAt: Date
}

// interviewAnswers
{
  _id: ObjectId,
  interviewId: { type: ObjectId, ref: 'Interview', required: true, index: true },
  questionId: { type: ObjectId, ref: 'InterviewQuestion', required: true },
  studentAnswer: String,
  evaluation: {
    score: Number, // 0 to 100
    technicalScore: Number,
    clarityScore: Number,
    feedback: String,
    suggestedAnswer: String
  },
  createdAt: Date
}
```

### 3.16. `jobs`
Campus placement and external job listings.
```javascript
{
  _id: ObjectId,
  organizationId: { type: ObjectId, ref: 'Organization', index: true }, // null for global platform jobs
  title: { type: String, required: true, index: true },
  company: { type: String, required: true },
  location: String,
  jobType: { type: String, enum: ['FULL_TIME', 'INTERNSHIP', 'CONTRACT'], default: 'FULL_TIME' },
  description: String,
  requiredSkills: [{ skillId: { type: ObjectId, ref: 'Skill' }, minProficiency: Number }],
  preferredSkills: [{ skillId: { type: ObjectId, ref: 'Skill' } }],
  experience: String,
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' }
  },
  applicationUrl: String,
  deadline: Date,
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.17. `jobApplications`
Student job applications and progress tracking.
```javascript
{
  _id: ObjectId,
  jobId: { type: ObjectId, ref: 'Job', required: true, index: true },
  studentId: { type: ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: ObjectId, ref: 'Organization', required: true, index: true },
  status: { 
    type: String, 
    enum: ['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'REJECTED'], 
    default: 'APPLIED' 
  },
  matchScore: Number,
  notes: String,
  appliedAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

### 3.18. `notifications`
User alert and messaging system.
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: ObjectId, ref: 'Organization', index: true },
  type: { 
    type: String, 
    enum: ['ROADMAP_REMINDER', 'ASSESSMENT_RESULT', 'INTERVIEW_RESULT', 'JOB_MATCH', 'ANNOUNCEMENT'], 
    required: true 
  },
  title: String,
  message: String,
  link: String,
  isRead: { type: Boolean, default: false },
  createdAt: Date
}
```

### 3.19. `aiGenerations`
Audit logs and token/rate limit tracking for Gemini AI outputs.
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', index: true },
  organizationId: { type: ObjectId, ref: 'Organization', index: true },
  feature: { 
    type: String, 
    enum: ['CAREER_GAP', 'ROADMAP_GEN', 'RESUME_ANALYSIS', 'INTERVIEW_QUESTION', 'INTERVIEW_EVALUATION', 'PROJECT_RECOMMENDATION'], 
    required: true 
  },
  promptTokens: Number,
  completionTokens: Number,
  latencyMs: Number,
  status: { type: String, enum: ['SUCCESS', 'ERROR'], default: 'SUCCESS' },
  errorMessage: String,
  createdAt: { type: Date, default: Date.now }
}
```
