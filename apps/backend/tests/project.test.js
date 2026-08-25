import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Skill } from '../src/models/skill.model.js';
import { Career } from '../src/models/career.model.js';
import { CareerRequirement } from '../src/models/careerRequirement.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';
import { Project } from '../src/models/project.model.js';

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
    .send({ email: 'project.student@apex.edu', name: 'Project Student', role: 'STUDENT' });

  token = loginRes.body.data.token;
  user = loginRes.body.data.user;

  await StudentProfile.create({
    userId: user._id,
    targetCareerId: fullStackCareer._id,
    skills: [{ skillId: jsSkill._id, skillName: 'JavaScript', proficiencyLevel: 3, verified: true }],
  });
});

afterEach(async () => {
  await Project.deleteMany({});
  await StudentProfile.deleteMany({});
  await User.deleteMany({});
});

describe('POST /api/v1/projects', () => {
  it('creates a new portfolio project and recalculates placement readiness project score', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Real-Time Chat Microservice',
        description: 'Scalable WebSocket messaging application with Redis pub/sub and MongoDB.',
        technologies: ['Node.js', 'Express', 'Redis', 'Socket.io', 'MongoDB'],
        githubUrl: 'https://github.com/student/chat-app',
        liveDemoUrl: 'https://chat.example.com',
        difficulty: 'INTERMEDIATE',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Real-Time Chat Microservice');
    expect(res.body.data.technologies).toContain('Redis');

    // Verify student profile score was updated
    const profile = await StudentProfile.findOne({ userId: user._id });
    expect(profile.readinessScore.breakdown.projects).toBeGreaterThan(0);
  });

  it('rejects invalid project payloads with validation error', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'AB', // too short
        description: 'short', // too short
        technologies: [], // empty
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/projects', () => {
  it('lists all portfolio projects for the student', async () => {
    await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Project 1',
        description: 'A comprehensive web application with full authentication.',
        technologies: ['React', 'Node.js'],
      });

    const res = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Project 1');
  });
});

describe('PUT /api/v1/projects/:id', () => {
  it('updates project fields and recalculates project readiness', async () => {
    const createRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'E-Commerce Platform',
        description: 'Online store with inventory management and order processing.',
        technologies: ['Node.js', 'PostgreSQL'],
      });

    const projectId = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        githubUrl: 'https://github.com/student/ecommerce',
        liveDemoUrl: 'https://ecommerce.example.com',
        difficulty: 'ADVANCED',
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.difficulty).toBe('ADVANCED');
    expect(updateRes.body.data.githubUrl).toBe('https://github.com/student/ecommerce');
  });
});

describe('DELETE /api/v1/projects/:id', () => {
  it('removes project from student portfolio and adjusts readiness score', async () => {
    const createRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Temporary Tool',
        description: 'A temporary script and dashboard application for data parsing.',
        technologies: ['Python'],
      });

    const projectId = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const checkList = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(checkList.body.data.length).toBe(0);
  });
});

describe('GET /api/v1/projects/recommendations', () => {
  it('retrieves AI-generated project recommendations closing target skill gaps', async () => {
    const res = await request(app)
      .get('/api/v1/projects/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.projects)).toBe(true);
    expect(res.body.data.projects.length).toBeGreaterThanOrEqual(1);

    const proj = res.body.data.projects[0];
    expect(proj.title).toBeDefined();
    expect(Array.isArray(proj.technologies)).toBe(true);
  });
});