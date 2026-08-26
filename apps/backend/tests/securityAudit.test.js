import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Organization } from '../src/models/organization.model.js';
import { Department } from '../src/models/department.model.js';
import { Job } from '../src/models/job.model.js';
import { Assessment } from '../src/models/assessment.model.js';
import { Skill } from '../src/models/skill.model.js';
import { Career } from '../src/models/career.model.js';
import { AuthService } from '../src/services/auth.service.js';

describe('Security, Multi-Tenant Isolation & Integrity Regression Suite', () => {
  let mongod;
  let tenantA, tenantB;
  let deptA, deptB;
  let studentA, studentB;
  let tokenA, tokenB;
  let skill1, career1;
  let jobTenantB;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    // 1. Seed two distinct tenants
    tenantA = await Organization.create({
      name: 'College Alpha',
      slug: 'alpha',
      domain: 'alpha.edu',
    });

    tenantB = await Organization.create({
      name: 'College Beta',
      slug: 'beta',
      domain: 'beta.edu',
    });

    // 2. Seed departments in each tenant
    deptA = await Department.create({
      organizationId: tenantA._id,
      name: 'Computer Science A',
      code: 'CS-A',
    });

    deptB = await Department.create({
      organizationId: tenantB._id,
      name: 'Computer Science B',
      code: 'CS-B',
    });

    // 3. Seed students
    studentA = await User.create({
      name: 'Alice Alpha',
      email: 'alice@alpha.edu',
      role: 'STUDENT',
      organizationId: tenantA._id,
      departmentId: deptA._id,
    });

    studentB = await User.create({
      name: 'Bob Beta',
      email: 'bob@beta.edu',
      role: 'STUDENT',
      organizationId: tenantB._id,
      departmentId: deptB._id,
    });

    tokenA = AuthService.signToken(studentA);
    tokenB = AuthService.signToken(studentB);

    // 4. Seed skills & careers
    skill1 = await Skill.create({
      name: 'TypeScript',
      slug: 'typescript',
      category: 'Frontend',
      isVerified: true,
    });

    career1 = await Career.create({
      title: 'Frontend Engineer',
      slug: 'frontend-engineer',
      category: 'Engineering',
      isActive: true,
    });

    await mongoose.model('CareerRequirement').create({
      careerId: career1._id,
      skillId: skill1._id,
      requiredProficiency: 3,
      weight: 5,
      importance: 'High',
    });

    await mongoose.model('StudentProfile').create({
      userId: studentA._id,
      organizationId: tenantA._id,
      targetCareerId: career1._id,
      skills: [{ skillId: skill1._id, skillName: skill1.name, proficiencyLevel: 2 }],
    });

    // 5. Seed job in Tenant B
    jobTenantB = await Job.create({
      organizationId: tenantB._id,
      createdBy: studentB._id,
      title: 'Beta Exclusive Internship',
      company: 'Beta Labs',
      description: 'Exclusive to College Beta students',
      location: 'New York',
      jobType: 'INTERNSHIP',
      requiredSkills: [{ skillId: skill1._id, minProficiency: 3, weight: 5 }],
      isActive: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('C-3: Token Revocation & Logout Enforcement', () => {
    it('revokes access token immediately upon logout so it cannot be reused', async () => {
      // 1. Create dedicated user and token
      const tempUser = await User.create({
        name: 'Temp User',
        email: 'temp@alpha.edu',
        role: 'STUDENT',
        organizationId: tenantA._id,
      });
      const tempToken = AuthService.signToken(tempUser);

      // Verify token works initially
      const meBefore = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${tempToken}`);
      expect(meBefore.status).toBe(200);

      // Call logout
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${tempToken}`);
      expect(logoutRes.status).toBe(200);

      // Attempt to reuse revoked token -> MUST be rejected with 401
      const meAfter = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${tempToken}`);
      expect(meAfter.status).toBe(401);
      expect(meAfter.body.error.message).toMatch(/revoked|expired/i);
    });
  });

  describe('H-1: Cross-Tenant Job Isolation', () => {
    it('prevents Student from Tenant A from viewing Tenant B job details', async () => {
      const res = await request(app)
        .get(`/api/v1/jobs/${jobTenantB._id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
    });

    it('prevents Student from Tenant A from applying to Tenant B job', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${jobTenantB._id}/apply`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ coverLetter: 'Cross tenant attempt' });

      expect(res.status).toBe(404);
    });

    it('allows Student from Tenant B to view and apply to Tenant B job', async () => {
      const viewRes = await request(app)
        .get(`/api/v1/jobs/${jobTenantB._id}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(viewRes.status).toBe(200);

      const applyRes = await request(app)
        .post(`/api/v1/jobs/${jobTenantB._id}/apply`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ coverLetter: 'Legitimate application' });
      expect(applyRes.status).toBe(201);
    });
  });

  describe('H-2: Cross-Tenant Department Assignment Protection', () => {
    it('rejects student attempting to assign a department from another organization', async () => {
      const res = await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ departmentId: deptB._id.toString() });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/department does not exist within your college/i);
    });

    it('accepts student assigning a department belonging to their own organization', async () => {
      const res = await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ departmentId: deptA._id.toString() });

      expect(res.status).toBe(200);
    });
  });

  describe('H-3: Assessment Attempt Binding & Substitution Prevention', () => {
    let assessA, assessB;

    beforeAll(async () => {
      assessA = await Assessment.create({
        skillId: skill1._id,
        title: 'Assessment A',
        difficulty: 'BEGINNER',
        durationMinutes: 15,
        passingScore: 70,
        isActive: true,
        questions: [
          {
            questionText: 'Q1?',
            options: ['Opt A', 'Opt B'],
            correctOptionIndex: 0,
            points: 10,
          },
        ],
      });

      assessB = await Assessment.create({
        skillId: skill1._id,
        title: 'Assessment B',
        difficulty: 'ADVANCED',
        durationMinutes: 15,
        passingScore: 70,
        isActive: true,
        questions: [
          {
            questionText: 'Q2?',
            options: ['Opt 1', 'Opt 2'],
            correctOptionIndex: 1,
            points: 10,
          },
        ],
      });
    });

    it('rejects submitting an attempt generated for Assessment A against Assessment B URL', async () => {
      // 1. Start Assessment A
      const startRes = await request(app)
        .get(`/api/v1/assessments/${assessA._id}`)
        .set('Authorization', `Bearer ${tokenA}`);
      const attemptId = startRes.body.data.attemptId;

      // 2. Submit attempt against Assessment B URL -> MUST fail
      const submitRes = await request(app)
        .post(`/api/v1/assessments/${assessB._id}/submit`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          attemptId,
          answers: [{ questionIndex: 0, selectedOptionIndex: 1 }],
        });

      expect(submitRes.status).toBe(400);
      expect(submitRes.body.error.message).toMatch(/not generated for the specified assessment/i);
    });
  });

  describe('H-5: Interview Question Answer Key Masking', () => {
    it('never reveals suggestedAnswer / model answers for active in-progress interview questions', async () => {
      // Set target career
      await request(app)
        .put('/api/v1/profile/target-career')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ careerId: career1._id.toString() });

      const startRes = await request(app)
        .post('/api/v1/interviews/start')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ difficulty: 'EASY', totalQuestions: 2 });

      expect(startRes.status).toBe(201);
      const session = startRes.body.data;
      expect(session.status).toBe('IN_PROGRESS');

      // The unanswered current question MUST NOT have suggestedAnswer
      const currentQ = session.questions[0];
      expect(currentQ.suggestedAnswer).toBeUndefined();
    });
  });

  describe('M-3: Safe Regex Sanitization', () => {
    it('handles regex metacharacters in search queries safely without errors', async () => {
      const res = await request(app)
        .get('/api/v1/skills?search=.*+?^${}()|[]\\')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('M-4: Roadmap Reversible Task Toggling', () => {
    it('reverts completed roadmap status back to active if a task is subsequently unchecked', async () => {
      const genRes = await request(app)
        .post('/api/v1/roadmaps/generate')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ durationWeeks: 2 });

      if (genRes.status !== 200) {
        console.log('ROADMAP GENERATE ERROR DETAILS:', JSON.stringify(genRes.body, null, 2));
      }
      expect(genRes.status).toBe(200);
      const roadmap = genRes.body.data;

      // Complete all tasks
      const allTasks = roadmap.milestones.flatMap((m) => m.tasks);
      for (const t of allTasks) {
        await request(app)
          .patch(`/api/v1/roadmaps/tasks/${t.taskId}`)
          .set('Authorization', `Bearer ${tokenA}`)
          .send({ isCompleted: true });
      }

      // Check roadmap is now COMPLETED
      const activeRes1 = await request(app)
        .get('/api/v1/roadmaps/active')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(activeRes1.body.data.status).toBe('COMPLETED');
      expect(activeRes1.body.data.progressPercentage).toBe(100);

      // Now uncheck first task
      const firstTask = allTasks[0];
      const uncheckRes = await request(app)
        .patch(`/api/v1/roadmaps/tasks/${firstTask.taskId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ isCompleted: false });

      expect(uncheckRes.status).toBe(200);
      expect(uncheckRes.body.data.status).toBe('ACTIVE');
      expect(uncheckRes.body.data.progressPercentage).toBeLessThan(100);
    });
  });
});