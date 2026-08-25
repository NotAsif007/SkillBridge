import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Organization } from '../src/models/organization.model.js';
import { Skill } from '../src/models/skill.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';
import { Job } from '../src/models/job.model.js';
import { JobApplication } from '../src/models/jobApplication.model.js';

let mongod;
let studentToken;
let studentUser;
let adminToken;
let adminUser;
let org;
let nodeSkill;
let reactSkill;
let sampleJob;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  org = await Organization.create({
    name: 'Apex Institute of Technology',
    slug: 'apex-institute',
    domain: 'apex.edu',
  });

  nodeSkill = await Skill.create({ name: 'Node.js', category: 'Backend' });
  reactSkill = await Skill.create({ name: 'React', category: 'Frontend' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  const studentLogin = await request(app)
    .post('/api/v1/auth/dev-login')
    .send({
      email: 'job.student@apex.edu',
      name: 'Job Student',
      role: 'STUDENT',
      organizationId: org._id.toString(),
    });

  studentToken = studentLogin.body.data.token;
  studentUser = studentLogin.body.data.user;

  const adminLogin = await request(app)
    .post('/api/v1/auth/dev-login')
    .send({
      email: 'job.admin@apex.edu',
      name: 'Job Admin',
      role: 'COLLEGE_ADMIN',
      organizationId: org._id.toString(),
    });

  adminToken = adminLogin.body.data.token;
  adminUser = adminLogin.body.data.user;

  // Student has Node.js Level 4, missing React
  await StudentProfile.create({
    userId: studentUser._id,
    organizationId: org._id,
    skills: [{ skillId: nodeSkill._id, skillName: 'Node.js', proficiencyLevel: 4, verified: true }],
  });

  // Create sample job
  sampleJob = await Job.create({
    organizationId: org._id,
    title: 'Full Stack Engineer',
    company: 'TechCorp Solutions',
    location: 'Bangalore, India',
    jobType: 'FULL_TIME',
    workplaceType: 'HYBRID',
    description: 'Looking for talented engineers skilled in Node.js and React.',
    salaryRange: { min: 800000, max: 1400000, currency: 'INR' },
    requiredSkills: [
      { skillId: nodeSkill._id, minProficiency: 3, weight: 10 },
      { skillId: reactSkill._id, minProficiency: 3, weight: 10 },
    ],
    createdBy: adminUser._id,
  });
});

afterEach(async () => {
  await JobApplication.deleteMany({});
  await Job.deleteMany({});
  await StudentProfile.deleteMany({});
  await User.deleteMany({});
});

describe('POST /api/v1/jobs', () => {
  it('allows college admin to post new job vacancies', async () => {
    const res = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Backend Developer',
        company: 'CloudScale Inc',
        location: 'Hyderabad',
        jobType: 'FULL_TIME',
        workplaceType: 'REMOTE',
        description: 'Design distributed backend microservices in Node.js.',
        requiredSkills: [{ skillId: nodeSkill._id.toString(), minProficiency: 4, weight: 8 }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Backend Developer');
    expect(res.body.data.company).toBe('CloudScale Inc');
  });

  it('forbids students from posting job listings', async () => {
    const res = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Backend Developer',
        company: 'CloudScale Inc',
        description: 'Design distributed backend microservices in Node.js.',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/jobs', () => {
  it('lists jobs with personalized skill match percentages for student', async () => {
    const res = await request(app)
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);

    const job = res.body.data[0];
    expect(job.title).toBe('Full Stack Engineer');
    // Student matches Node.js (10 weight), misses React (10 weight) -> 50%
    expect(job.matchPercentage).toBe(50);
    expect(job.hasApplied).toBe(false);
  });
});

describe('GET /api/v1/jobs/:id', () => {
  it('retrieves detailed job view with matched and missing skill breakdown', async () => {
    const res = await request(app)
      .get(`/api/v1/jobs/${sampleJob._id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.matchScore).toBe(50);
    expect(res.body.data.matchedSkills.length).toBe(1);
    expect(res.body.data.missingSkills.length).toBe(1);
  });
});

describe('POST /api/v1/jobs/:id/apply', () => {
  it('submits student application and stores match score snapshot', async () => {
    const res = await request(app)
      .post(`/api/v1/jobs/${sampleJob._id}/apply`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        coverLetter: 'I am excited to apply for the Full Stack Engineer role at TechCorp.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPLIED');
    expect(res.body.data.matchScoreAtApplication).toBe(50);
  });

  it('rejects duplicate application submissions with 409 CONFLICT', async () => {
    // 1st Application
    await request(app)
      .post(`/api/v1/jobs/${sampleJob._id}/apply`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ coverLetter: 'First submission' });

    // 2nd Application (Duplicate)
    const duplicateRes = await request(app)
      .post(`/api/v1/jobs/${sampleJob._id}/apply`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ coverLetter: 'Duplicate submission' });

    expect(duplicateRes.statusCode).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });
});

describe('GET /api/v1/jobs/applications/me', () => {
  it('lists all jobs applied to by student with populated details', async () => {
    await request(app)
      .post(`/api/v1/jobs/${sampleJob._id}/apply`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ coverLetter: 'Applied to TechCorp' });

    const res = await request(app)
      .get('/api/v1/jobs/applications/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].jobId.title).toBe('Full Stack Engineer');
  });
});