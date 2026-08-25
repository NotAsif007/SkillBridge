import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Skill } from '../src/models/skill.model.js';
import { Career } from '../src/models/career.model.js';
import { CareerRequirement } from '../src/models/careerRequirement.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';
import { InterviewSession } from '../src/models/interviewSession.model.js';

let mongod;
let token;
let user;
let jsSkill;
let fullStackCareer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  jsSkill = await Skill.create({ name: 'JavaScript', category: 'Programming' });

  fullStackCareer = await Career.create({
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    category: 'Software Engineering',
    isActive: true,
  });

  await CareerRequirement.create([
    { careerId: fullStackCareer._id, skillId: jsSkill._id, importance: 'Critical', requiredProficiency: 4, weight: 10 },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  const loginRes = await request(app)
    .post('/api/v1/auth/dev-login')
    .send({ email: 'interview.student@apex.edu', name: 'Interview Student', role: 'STUDENT' });

  token = loginRes.body.data.token;
  user = loginRes.body.data.user;

  await StudentProfile.create({
    userId: user._id,
    targetCareerId: fullStackCareer._id,
    skills: [{ skillId: jsSkill._id, skillName: 'JavaScript', proficiencyLevel: 3, verified: true }],
  });
});

afterEach(async () => {
  await InterviewSession.deleteMany({});
  await StudentProfile.deleteMany({});
  await User.deleteMany({});
});

describe('POST /api/v1/interviews/start', () => {
  it('starts an AI mock interview session with question 1 generated', async () => {
    const res = await request(app)
      .post('/api/v1/interviews/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ difficulty: 'MEDIUM', totalQuestions: 2 });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.currentQuestionIndex).toBe(0);
    expect(res.body.data.questions.length).toBe(1);
    expect(res.body.data.questions[0].questionText).toBeDefined();
    expect(res.body.data.questions[0].skillTested).toBeDefined();
  });
});

describe('POST /api/v1/interviews/:sessionId/answer', () => {
  it('evaluates student response, advances questions, and marks session completed upon final question', async () => {
    // 1. Start a 2-question session
    const startRes = await request(app)
      .post('/api/v1/interviews/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ difficulty: 'MEDIUM', totalQuestions: 2 });

    const sessionId = startRes.body.data._id;

    // 2. Submit answer to question 1
    const ans1Res = await request(app)
      .post(`/api/v1/interviews/${sessionId}/answer`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        answer: 'In JavaScript, asynchronous callbacks in the event loop are processed after the current execution context and microtask queue clear.',
      });

    expect(ans1Res.statusCode).toBe(200);
    expect(ans1Res.body.success).toBe(true);
    expect(ans1Res.body.data.status).toBe('IN_PROGRESS');
    expect(ans1Res.body.data.currentQuestionIndex).toBe(1);
    expect(ans1Res.body.data.questions.length).toBe(2);
    expect(ans1Res.body.data.questions[0].score).toBeGreaterThan(0);
    expect(ans1Res.body.data.questions[0].feedback).toBeDefined();

    // 3. Submit answer to question 2 (final question)
    const ans2Res = await request(app)
      .post(`/api/v1/interviews/${sessionId}/answer`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        answer: 'Idempotency in API endpoints can be achieved with unique requestId headers stored in Redis with atomic SETNX operations.',
      });

    expect(ans2Res.statusCode).toBe(200);
    expect(ans2Res.body.success).toBe(true);
    expect(ans2Res.body.data.status).toBe('COMPLETED');
    expect(ans2Res.body.data.overallScore).toBeGreaterThan(0);

    // 4. Verify student profile interview readiness score synchronization
    const profile = await StudentProfile.findOne({ userId: user._id });
    expect(profile.readinessScore.breakdown.interviewPerformance).toBe(ans2Res.body.data.overallScore);
  });

  it('rejects short answers with 422 VALIDATION_ERROR', async () => {
    const startRes = await request(app)
      .post('/api/v1/interviews/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ totalQuestions: 2 });

    const sessionId = startRes.body.data._id;

    const res = await request(app)
      .post(`/api/v1/interviews/${sessionId}/answer`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answer: 'hi' });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/interviews/:sessionId', () => {
  it('retrieves details of a specific interview session', async () => {
    const startRes = await request(app)
      .post('/api/v1/interviews/start')
      .set('Authorization', `Bearer ${token}`);

    const sessionId = startRes.body.data._id;

    const res = await request(app)
      .get(`/api/v1/interviews/${sessionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(sessionId);
  });
});

describe('GET /api/v1/interviews/history', () => {
  it('lists historical interview sessions for the student', async () => {
    await request(app)
      .post('/api/v1/interviews/start')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/v1/interviews/history')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});