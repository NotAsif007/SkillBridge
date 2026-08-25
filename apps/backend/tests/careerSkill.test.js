import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { Skill } from '../src/models/skill.model.js';
import { Career } from '../src/models/career.model.js';
import { CareerRequirement } from '../src/models/careerRequirement.model.js';

let mongod;
let token;
let jsSkill;
let pythonSkill;
let reactSkill;
let fullStackCareer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Setup auth token
  const loginRes = await request(app)
    .post('/api/v1/auth/dev-login')
    .send({ email: 'test.user@apex.edu', name: 'Tester' });
  token = loginRes.body.data.token;

  // Seed sample skills
  jsSkill = await Skill.create({
    name: 'JavaScript',
    category: 'Programming',
    description: 'ECMAScript and async patterns',
  });

  pythonSkill = await Skill.create({
    name: 'Python',
    category: 'Programming',
    description: 'Python 3 and standard library',
  });

  reactSkill = await Skill.create({
    name: 'React',
    category: 'Frontend',
    description: 'React hooks and state management',
  });

  // Seed career and requirements
  fullStackCareer = await Career.create({
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    category: 'Software Engineering',
    overview: 'Fullstack engineering',
    isActive: true,
  });

  await CareerRequirement.create([
    {
      careerId: fullStackCareer._id,
      skillId: jsSkill._id,
      importance: 'Critical',
      requiredProficiency: 4,
      weight: 10,
    },
    {
      careerId: fullStackCareer._id,
      skillId: reactSkill._id,
      importance: 'High',
      requiredProficiency: 3,
      weight: 8,
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('GET /api/v1/skills', () => {
  it('lists all verified skills', async () => {
    const res = await request(app)
      .get('/api/v1/skills')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(3);
  });

  it('filters skills by category', async () => {
    const res = await request(app)
      .get('/api/v1/skills?category=Frontend')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('React');
  });

  it('searches skills by text pattern', async () => {
    const res = await request(app)
      .get('/api/v1/skills?search=script')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('JavaScript');
  });

  it('returns 401 when token is missing', async () => {
    const res = await request(app).get('/api/v1/skills');
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/v1/careers', () => {
  it('lists all active careers', async () => {
    const res = await request(app)
      .get('/api/v1/careers')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Full Stack Developer');
  });
});

describe('GET /api/v1/careers/:id', () => {
  it('retrieves career details with populated skill requirements and weights', async () => {
    const res = await request(app)
      .get(`/api/v1/careers/${fullStackCareer._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Full Stack Developer');
    expect(res.body.data.requirements.length).toBe(2);
    expect(res.body.data.requirements[0].skillName).toBe('JavaScript');
    expect(res.body.data.requirements[0].weight).toBe(10);
    expect(res.body.data.requirements[0].importance).toBe('Critical');
  });

  it('returns 404 when career ID is not found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/v1/careers/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});