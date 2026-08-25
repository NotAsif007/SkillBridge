import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Organization } from '../src/models/organization.model.js';
import { Skill } from '../src/models/skill.model.js';
import { Career } from '../src/models/career.model.js';
import { CareerRequirement } from '../src/models/careerRequirement.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';
import { Project } from '../src/models/project.model.js';
import { Job } from '../src/models/job.model.js';

let mongod;
let token;
let user;
let org;
let jsSkill;
let reactSkill;
let fullStackCareer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  org = await Organization.create({
    name: 'Apex Institute of Technology',
    slug: 'apex-institute',
    domain: 'apex.edu',
  });

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
    .send({
      email: 'dashboard.student@apex.edu',
      name: 'Dashboard Student',
      role: 'STUDENT',
      organizationId: org._id.toString(),
    });

  token = loginRes.body.data.token;
  user = loginRes.body.data.user;

  await StudentProfile.create({
    userId: user._id,
    organizationId: org._id,
    targetCareerId: fullStackCareer._id,
    skills: [{ skillId: jsSkill._id, skillName: 'JavaScript', proficiencyLevel: 3, verified: true }],
  });

  // Create sample project
  await Project.create({
    studentId: user._id,
    organizationId: org._id,
    title: 'Collaborative Workspace',
    description: 'Real-time collaborative canvas with WebSockets.',
    technologies: ['React', 'Node.js'],
  });

  // Create sample job
  await Job.create({
    organizationId: org._id,
    title: 'Full Stack Engineer',
    company: 'Apex Tech Solutions',
    description: 'Hiring full stack developers with JS fundamentals.',
    requiredSkills: [{ skillId: jsSkill._id, minProficiency: 3, weight: 10 }],
  });
});

afterEach(async () => {
  await Job.deleteMany({});
  await Project.deleteMany({});
  await StudentProfile.deleteMany({});
  await User.deleteMany({});
});

describe('GET /api/v1/dashboard/student', () => {
  it('returns complete single-round-trip aggregated student dashboard payload according to API contract', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/student')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(typeof data.readinessScore).toBe('number');
    expect(typeof data.skillProgress).toBe('number');
    expect(typeof data.roadmapProgress).toBe('number');
    expect(data.projectsCount).toBe(1);
    expect(data.activeJobMatches).toBeGreaterThanOrEqual(1);

    expect(data.targetCareer).toBeDefined();
    expect(data.targetCareer.title).toBe('Full Stack Developer');

    expect(data.scoreBreakdown).toBeDefined();
    expect(typeof data.scoreBreakdown.technicalSkills).toBe('number');
    expect(typeof data.scoreBreakdown.assessmentPerformance).toBe('number');
    expect(typeof data.scoreBreakdown.projects).toBe('number');
    expect(typeof data.scoreBreakdown.resume).toBe('number');
    expect(typeof data.scoreBreakdown.interviewPerformance).toBe('number');
    expect(typeof data.scoreBreakdown.roadmapProgress).toBe('number');

    expect(Array.isArray(data.topSkillGaps)).toBe(true);
    expect(Array.isArray(data.recentActivity)).toBe(true);
  });
});

describe('API Contract Aliases Validation', () => {
  it('supports contract aliases for roadmaps, resumes, and interviews', async () => {
    // 1. GET /api/v1/roadmaps/me alias
    const roadmapRes = await request(app)
      .get('/api/v1/roadmaps/me')
      .set('Authorization', `Bearer ${token}`);
    expect(roadmapRes.statusCode).toBe(200);

    // 2. POST /api/v1/resumes/upload alias
    const resumeRes = await request(app)
      .post('/api/v1/resumes/upload')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resumeText: 'Sample student resume with sufficient text length for ATS diagnostics testing.',
      });
    expect(resumeRes.statusCode).toBe(201);

    // 3. POST /api/v1/interviews alias
    const interviewRes = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ difficulty: 'MEDIUM', totalQuestions: 2 });
    expect(interviewRes.statusCode).toBe(201);
  });
});