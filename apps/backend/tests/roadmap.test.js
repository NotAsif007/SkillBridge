import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Skill } from '../src/models/skill.model.js';
import { Career } from '../src/models/career.model.js';
import { CareerRequirement } from '../src/models/careerRequirement.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';
import { Roadmap } from '../src/models/roadmap.model.js';

let mongod;
let token;
let user;
let jsSkill;
let reactSkill;
let fullStackCareer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Create Skill & Career
  jsSkill = await Skill.create({ name: 'JavaScript', category: 'Programming' });
  reactSkill = await Skill.create({ name: 'React', category: 'Frontend' });

  fullStackCareer = await Career.create({
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    category: 'Software Engineering',
    isActive: true,
  });

  await CareerRequirement.create([
    { careerId: fullStackCareer._id, skillId: jsSkill._id, importance: 'Critical', requiredProficiency: 4, weight: 10 },
    { careerId: fullStackCareer._id, skillId: reactSkill._id, importance: 'High', requiredProficiency: 3, weight: 8 },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  const loginRes = await request(app)
    .post('/api/v1/auth/dev-login')
    .send({ email: 'roadmap.student@apex.edu', name: 'Roadmap Student', role: 'STUDENT' });

  token = loginRes.body.data.token;
  user = loginRes.body.data.user;

  // Link profile to career
  await StudentProfile.create({
    userId: user._id,
    targetCareerId: fullStackCareer._id,
    skills: [{ skillId: jsSkill._id, skillName: 'JavaScript', proficiencyLevel: 3, verified: true }],
  });
});

afterEach(async () => {
  await Roadmap.deleteMany({});
  await StudentProfile.deleteMany({});
  await User.deleteMany({});
});

describe('POST /api/v1/roadmaps/generate', () => {
  it('generates a new AI-powered learning roadmap with milestones and tasks', async () => {
    const res = await request(app)
      .post('/api/v1/roadmaps/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ durationWeeks: 4 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACTIVE');
    expect(res.body.data.progressPercentage).toBe(0);
    expect(Array.isArray(res.body.data.milestones)).toBe(true);
    expect(res.body.data.milestones.length).toBeGreaterThanOrEqual(1);

    const firstMilestone = res.body.data.milestones[0];
    expect(firstMilestone.tasks.length).toBeGreaterThanOrEqual(1);
    expect(firstMilestone.tasks[0].taskId).toBeDefined();
  });

  it('archives previously active roadmaps when generating a fresh plan', async () => {
    // Generate first
    await request(app)
      .post('/api/v1/roadmaps/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ durationWeeks: 4 });

    // Generate second
    const secondRes = await request(app)
      .post('/api/v1/roadmaps/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ durationWeeks: 6 });

    expect(secondRes.statusCode).toBe(200);

    const activeCount = await Roadmap.countDocuments({ studentId: user._id, status: 'ACTIVE' });
    const archivedCount = await Roadmap.countDocuments({ studentId: user._id, status: 'ARCHIVED' });

    expect(activeCount).toBe(1);
    expect(archivedCount).toBe(1);
  });
});

describe('GET /api/v1/roadmaps/active', () => {
  it('retrieves active roadmap for the student', async () => {
    await request(app)
      .post('/api/v1/roadmaps/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ durationWeeks: 4 });

    const res = await request(app)
      .get('/api/v1/roadmaps/active')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('Full Stack Developer');
  });

  it('returns null if student has no active roadmap', async () => {
    const res = await request(app)
      .get('/api/v1/roadmaps/active')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeNull();
  });
});

describe('PATCH /api/v1/roadmaps/tasks/:taskId', () => {
  it('toggles task completion and automatically recalculates roadmap progress', async () => {
    const genRes = await request(app)
      .post('/api/v1/roadmaps/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ durationWeeks: 4 });

    const firstTaskId = genRes.body.data.milestones[0].tasks[0].taskId;

    const patchRes = await request(app)
      .patch(`/api/v1/roadmaps/tasks/${firstTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isCompleted: true });

    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.progressPercentage).toBeGreaterThan(0);

    // Verify task is marked completed in response
    const task = patchRes.body.data.milestones[0].tasks.find((t) => t.taskId === firstTaskId);
    expect(task.isCompleted).toBe(true);
    expect(task.completedAt).not.toBeNull();

    // Verify student profile readiness breakdown was synchronized
    const profile = await StudentProfile.findOne({ userId: user._id });
    expect(profile.readinessScore.breakdown.roadmapProgress).toBe(patchRes.body.data.progressPercentage);
  });

  it('returns 404 if taskId does not exist in roadmap', async () => {
    await request(app)
      .post('/api/v1/roadmaps/generate')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch('/api/v1/roadmaps/tasks/nonexistent_task_999')
      .set('Authorization', `Bearer ${token}`)
      .send({ isCompleted: true });

    expect(res.statusCode).toBe(404);
  });
});