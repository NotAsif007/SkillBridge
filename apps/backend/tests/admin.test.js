import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Organization } from '../src/models/organization.model.js';
import { Department } from '../src/models/department.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';
import { Job } from '../src/models/job.model.js';
import { JobApplication } from '../src/models/jobApplication.model.js';

let mongod;
let adminToken;
let adminUser;
let studentToken;
let studentUser;
let org;
let cseDept;
let eceDept;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  org = await Organization.create({
    name: 'Apex Institute of Technology',
    slug: 'apex-institute',
    domain: 'apex.edu',
  });

  cseDept = await Department.create({
    organizationId: org._id,
    name: 'Computer Science & Engineering',
    code: 'CSE',
  });

  eceDept = await Department.create({
    organizationId: org._id,
    name: 'Electronics & Communication',
    code: 'ECE',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  const adminLogin = await request(app)
    .post('/api/v1/auth/dev-login')
    .send({
      email: 'dean.admin@apex.edu',
      name: 'College Dean',
      role: 'COLLEGE_ADMIN',
      organizationId: org._id.toString(),
      departmentId: cseDept._id.toString(),
    });

  adminToken = adminLogin.body.data.token;
  adminUser = adminLogin.body.data.user;

  const studentLogin = await request(app)
    .post('/api/v1/auth/dev-login')
    .send({
      email: 'alex.chen@apex.edu',
      name: 'Alex Chen',
      role: 'STUDENT',
      organizationId: org._id.toString(),
      departmentId: cseDept._id.toString(),
    });

  studentToken = studentLogin.body.data.token;
  studentUser = studentLogin.body.data.user;

  // Create student profile
  await StudentProfile.create({
    userId: studentUser._id,
    organizationId: org._id,
    rollNumber: '2023CSE042',
    graduationYear: 2027,
    cgpa: 8.5,
    readinessScore: { overall: 82, breakdown: { technicalSkills: 80 } },
  });

  // Create job and application
  const job = await Job.create({
    organizationId: org._id,
    title: 'Cloud Architect',
    company: 'Apex Cloud Systems',
    description: 'Enterprise cloud infrastructure engineer.',
    createdBy: adminUser._id,
  });

  await JobApplication.create({
    jobId: job._id,
    studentId: studentUser._id,
    organizationId: org._id,
    status: 'OFFERED',
  });
});

afterEach(async () => {
  await JobApplication.deleteMany({});
  await Job.deleteMany({});
  await StudentProfile.deleteMany({});
  await User.deleteMany({});
});

describe('GET /api/v1/dashboard/admin', () => {
  it('retrieves comprehensive college placement analytics for admin', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.totalStudents).toBe(1);
    expect(data.placementReadyCount).toBe(1); // 82 >= 75
    expect(data.placementReadyPercentage).toBe(100);
    expect(data.averageReadinessScore).toBe(82);
    expect(data.activeJobMatches).toBe(1);

    expect(Array.isArray(data.departmentBreakdown)).toBe(true);
    expect(Array.isArray(data.topSkillGaps)).toBe(true);
    expect(data.readinessDistribution).toBeDefined();
  });

  it('forbids students from accessing admin dashboard with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/admin')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/admin/students', () => {
  it('retrieves paginated student roster with search filtering', async () => {
    const res = await request(app)
      .get('/api/v1/admin/students?search=Alex')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);

    const student = res.body.data[0];
    expect(student.name).toBe('Alex Chen');
    expect(student.rollNumber).toBe('2023CSE042');
    expect(student.department).toBe('CSE');
    expect(student.status).toBe('PLACEMENT_READY');

    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });
});

describe('GET /api/v1/admin/departments', () => {
  it('retrieves department list with student count', async () => {
    const res = await request(app)
      .get('/api/v1/admin/departments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);

    const cse = res.body.data.find((d) => d.code === 'CSE');
    expect(cse.studentCount).toBe(1);
  });
});

describe('GET /api/v1/admin/analytics/placements', () => {
  it('retrieves placement conversion pipeline statistics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/placements')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalApplications).toBe(1);
    expect(res.body.data.funnel.OFFERED).toBe(1);
    expect(res.body.data.offerRatePercentage).toBe(100);
  });
});