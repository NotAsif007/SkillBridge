import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Skill } from '../src/models/skill.model.js';
import { Assessment } from '../src/models/assessment.model.js';
import { AssessmentAttempt } from '../src/models/assessmentAttempt.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';

let mongod;
let token;
let user;
let reactSkill;
let reactAssessment;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Create test user and token
  const loginRes = await request(app)
    .post('/api/v1/auth/dev-login')
    .send({ email: 'test.student@apex.edu', name: 'Test Student', role: 'STUDENT' });
  token = loginRes.body.data.token;
  user = loginRes.body.data.user;

  // Create Skill
  reactSkill = await Skill.create({
    name: 'React',
    category: 'Frontend',
    description: 'React library',
  });

  // Create Assessment with questions
  reactAssessment = await Assessment.create({
    title: 'React Fundamentals Assessment',
    description: 'Test core React hook mechanics and lifecycle',
    skillId: reactSkill._id,
    difficulty: 'INTERMEDIATE',
    durationMinutes: 20,
    passingScore: 70,
    questions: [
      {
        questionText: 'What does the useEffect hook with [] dependencies do?',
        options: [
          'Runs on every re-render',
          'Runs only once after initial render',
          'Never executes',
          'Runs only on unmount',
        ],
        correctOptionIndex: 1,
        explanation: 'Empty dependency array runs once after initial mount.',
        points: 10,
      },
      {
        questionText: 'Which hook is used for complex local state management?',
        options: ['useContext', 'useReducer', 'useRef', 'useId'],
        correctOptionIndex: 1,
        explanation: 'useReducer is preferred for complex state machines.',
        points: 10,
      },
    ],
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await AssessmentAttempt.deleteMany({});
  await StudentProfile.deleteMany({});
});

describe('GET /api/v1/assessments', () => {
  it('lists all available assessments', async () => {
    const res = await request(app)
      .get('/api/v1/assessments')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('React Fundamentals Assessment');
  });

  it('filters assessments by skillId', async () => {
    const res = await request(app)
      .get(`/api/v1/assessments?skillId=${reactSkill._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

describe('GET /api/v1/assessments/:id (Start Attempt)', () => {
  it('creates an attempt and returns sanitized questions without answer leaks', async () => {
    const res = await request(app)
      .get(`/api/v1/assessments/${reactAssessment._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.attemptId).toBeDefined();
    expect(res.body.data.totalQuestions).toBe(2);

    // Verify answers & explanations are NEVER exposed to client
    res.body.data.questions.forEach((q) => {
      expect(q.correctOptionIndex).toBeUndefined();
      expect(q.explanation).toBeUndefined();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    });

    const attempt = await AssessmentAttempt.findById(res.body.data.attemptId);
    expect(attempt).not.toBeNull();
    expect(attempt.isCompleted).toBe(false);
  });
});

describe('POST /api/v1/assessments/:id/submit', () => {
  it('evaluates answers, calculates passing score, and updates student verified skill', async () => {
    // 1. Start assessment attempt
    const startRes = await request(app)
      .get(`/api/v1/assessments/${reactAssessment._id}`)
      .set('Authorization', `Bearer ${token}`);

    const attemptId = startRes.body.data.attemptId;

    // 2. Submit 100% correct answers
    const submitRes = await request(app)
      .post(`/api/v1/assessments/${reactAssessment._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        attemptId,
        answers: [
          { questionIndex: 0, selectedOptionIndex: 1, timeTakenSeconds: 15 },
          { questionIndex: 1, selectedOptionIndex: 1, timeTakenSeconds: 20 },
        ],
      });

    expect(submitRes.statusCode).toBe(200);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.score).toBe(20);
    expect(submitRes.body.data.percentage).toBe(100);
    expect(submitRes.body.data.passed).toBe(true);
    expect(submitRes.body.data.skillUpdated).not.toBeNull();
    expect(submitRes.body.data.skillUpdated.verified).toBe(true);

    // 3. Verify student profile has verified skill
    const profile = await StudentProfile.findOne({ userId: user._id });
    const verifiedSkill = profile.skills.find(
      (s) => s.skillId.toString() === reactSkill._id.toString()
    );
    expect(verifiedSkill).toBeDefined();
    expect(verifiedSkill.verified).toBe(true);
  });

  it('rejects duplicate submission on already completed attempt', async () => {
    const startRes = await request(app)
      .get(`/api/v1/assessments/${reactAssessment._id}`)
      .set('Authorization', `Bearer ${token}`);

    const attemptId = startRes.body.data.attemptId;

    // Submit once
    await request(app)
      .post(`/api/v1/assessments/${reactAssessment._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        attemptId,
        answers: [{ questionIndex: 0, selectedOptionIndex: 1 }],
      });

    // Attempt second submit
    const secondSubmitRes = await request(app)
      .post(`/api/v1/assessments/${reactAssessment._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        attemptId,
        answers: [{ questionIndex: 0, selectedOptionIndex: 1 }],
      });

    expect(secondSubmitRes.statusCode).toBe(400);
    expect(secondSubmitRes.body.success).toBe(false);
  });
});

describe('GET /api/v1/assessments/attempts/me', () => {
  it('returns student completed assessment history', async () => {
    // Start and submit an attempt
    const startRes = await request(app)
      .get(`/api/v1/assessments/${reactAssessment._id}`)
      .set('Authorization', `Bearer ${token}`);

    await request(app)
      .post(`/api/v1/assessments/${reactAssessment._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        attemptId: startRes.body.data.attemptId,
        answers: [{ questionIndex: 0, selectedOptionIndex: 1 }],
      });

    const historyRes = await request(app)
      .get('/api/v1/assessments/attempts/me')
      .set('Authorization', `Bearer ${token}`);

    expect(historyRes.statusCode).toBe(200);
    expect(historyRes.body.success).toBe(true);
    expect(historyRes.body.data.length).toBe(1);
    expect(historyRes.body.data[0].score).toBeDefined();
  });
});