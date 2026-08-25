import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Skill } from '../src/models/skill.model.js';
import { Career } from '../src/models/career.model.js';
import { CareerRequirement } from '../src/models/careerRequirement.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';
import { Resume } from '../src/models/resume.model.js';

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
    .send({ email: 'resume.student@apex.edu', name: 'Resume Student', role: 'STUDENT' });

  token = loginRes.body.data.token;
  user = loginRes.body.data.user;

  await StudentProfile.create({
    userId: user._id,
    targetCareerId: fullStackCareer._id,
    skills: [{ skillId: jsSkill._id, skillName: 'JavaScript', proficiencyLevel: 3, verified: true }],
  });
});

afterEach(async () => {
  await Resume.deleteMany({});
  await StudentProfile.deleteMany({});
  await User.deleteMany({});
});

describe('POST /api/v1/resumes/analyze', () => {
  it('analyzes resume text, generates ATS diagnostic metrics, and updates placement readiness score', async () => {
    const resumeText = `Alex Chen - Full Stack Software Engineer
Email: alex.chen@apex.edu | GitHub: github.com/alexchen | LinkedIn: linkedin.com/in/alexchen
Summary: Passionate software engineer with experience building scalable Node.js and React web applications.
Technical Skills: JavaScript, TypeScript, Node.js, Express, React, MongoDB, PostgreSQL, Docker, Git.
Projects:
- Real-Time Collaborative Whiteboard: Developed a multi-user canvas using WebSockets and Redis.
- E-Commerce Microservices Engine: Designed order processing system with PostgreSQL and Docker.
Education: Bachelor of Technology in Computer Science, Apex Institute of Technology (2023-2027), CGPA: 8.75.`;

    const res = await request(app)
      .post('/api/v1/resumes/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resumeText,
        fileName: 'alex_chen_resume.pdf',
        targetCareer: 'Full Stack Developer',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.atsScore).toBeGreaterThan(0);
    expect(res.body.data.formattingScore).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.extractedSkills)).toBe(true);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);

    // Verify student profile resume readiness score was updated
    const profile = await StudentProfile.findOne({ userId: user._id });
    expect(profile.readinessScore.breakdown.resume).toBe(res.body.data.atsScore);
  });

  it('rejects resume text that is too short with 422 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/resumes/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resumeText: 'Too short resume',
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/v1/resumes/latest', () => {
  it('retrieves the most recent resume analysis for student', async () => {
    const resumeText = 'Sample resume text with sufficient length for testing ATS parsing algorithms.';

    await request(app)
      .post('/api/v1/resumes/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({ resumeText });

    const res = await request(app)
      .get('/api/v1/resumes/latest')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.atsScore).toBeDefined();
  });

  it('returns null if student has not submitted any resumes', async () => {
    const res = await request(app)
      .get('/api/v1/resumes/latest')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeNull();
  });
});

describe('GET /api/v1/resumes/history', () => {
  it('returns array of past resume evaluations', async () => {
    const resumeText = 'Sample resume text with sufficient length for testing ATS parsing algorithms.';

    await request(app)
      .post('/api/v1/resumes/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({ resumeText });

    const res = await request(app)
      .get('/api/v1/resumes/history')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});