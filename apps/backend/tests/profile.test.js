import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Skill } from '../src/models/skill.model.js';
import { Career } from '../src/models/career.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';

let mongod;
let token;
let user;
let jsSkill;
let reactSkill;
let fullStackCareer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Seed sample skills and career
  jsSkill = await Skill.create({
    name: 'JavaScript',
    category: 'Programming',
    description: 'ECMAScript fundamentals',
  });

  reactSkill = await Skill.create({
    name: 'React',
    category: 'Frontend',
    description: 'React library and hooks',
  });

  fullStackCareer = await Career.create({
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    category: 'Software Engineering',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  // Login as student
  const loginRes = await request(app)
    .post('/api/v1/auth/dev-login')
    .send({
      email: 'alex.chen@apex.edu',
      name: 'Alex Chen',
      role: 'STUDENT',
    });

  token = loginRes.body.data.token;
  user = loginRes.body.data.user;
});

afterEach(async () => {
  await StudentProfile.deleteMany({});
  await User.deleteMany({});
});

describe('GET /api/v1/profile', () => {
  it('retrieves or auto-initializes profile for authenticated student', async () => {
    const res = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe(user._id);
    expect(Array.isArray(res.body.data.skills)).toBe(true);
    expect(res.body.data.readinessScore.overall).toBe(0);
  });

  it('returns 401 when token is missing', async () => {
    const res = await request(app).get('/api/v1/profile');
    expect(res.statusCode).toBe(401);
  });
});

describe('PUT /api/v1/profile', () => {
  it('updates academic info and preferences', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        rollNumber: '2023CSE042',
        graduationYear: 2027,
        cgpa: 8.75,
        interests: ['Web Development', 'Distributed Systems'],
        preferredLocations: ['Bangalore', 'Remote'],
        experienceLevel: 'INTERMEDIATE',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rollNumber).toBe('2023CSE042');
    expect(res.body.data.cgpa).toBe(8.75);
    expect(res.body.data.graduationYear).toBe(2027);
    expect(res.body.data.interests).toContain('Web Development');
    expect(res.body.data.experienceLevel).toBe('INTERMEDIATE');
  });

  it('validates graduation year and cgpa ranges', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cgpa: 15, // invalid > 10
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/v1/profile/skills', () => {
  it('adds a new skill to student profile and updates proficiency level', async () => {
    // 1. Add JavaScript at level 3
    const addRes = await request(app)
      .post('/api/v1/profile/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({
        skillId: jsSkill._id.toString(),
        proficiencyLevel: 3,
      });

    expect(addRes.statusCode).toBe(200);
    expect(addRes.body.data.skills.length).toBe(1);
    expect(addRes.body.data.skills[0].skillName).toBe('JavaScript');
    expect(addRes.body.data.skills[0].proficiencyLevel).toBe(3);

    // 2. Update JavaScript to level 5
    const updateRes = await request(app)
      .post('/api/v1/profile/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({
        skillId: jsSkill._id.toString(),
        proficiencyLevel: 5,
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.skills.length).toBe(1);
    expect(updateRes.body.data.skills[0].proficiencyLevel).toBe(5);

    // 3. Add second skill (React)
    const addReactRes = await request(app)
      .post('/api/v1/profile/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({
        skillId: reactSkill._id.toString(),
        proficiencyLevel: 4,
      });

    expect(addReactRes.statusCode).toBe(200);
    expect(addReactRes.body.data.skills.length).toBe(2);
  });

  it('returns 404 if skillId does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/v1/profile/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({
        skillId: fakeId,
        proficiencyLevel: 3,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/v1/profile/target-career', () => {
  it('sets active target career for gap analysis', async () => {
    const res = await request(app)
      .put('/api/v1/profile/target-career')
      .set('Authorization', `Bearer ${token}`)
      .send({
        careerId: fullStackCareer._id.toString(),
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.targetCareerId._id).toBe(fullStackCareer._id.toString());
    expect(res.body.data.targetCareerId.title).toBe('Full Stack Developer');
  });

  it('returns 404 when career does not exist', async () => {
    const fakeCareerId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put('/api/v1/profile/target-career')
      .set('Authorization', `Bearer ${token}`)
      .send({
        careerId: fakeCareerId,
      });

    expect(res.statusCode).toBe(404);
  });
});