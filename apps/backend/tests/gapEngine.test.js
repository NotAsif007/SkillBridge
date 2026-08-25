import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Skill } from '../src/models/skill.model.js';
import { Career } from '../src/models/career.model.js';
import { CareerRequirement } from '../src/models/careerRequirement.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';
import { Assessment } from '../src/models/assessment.model.js';
import { AssessmentAttempt } from '../src/models/assessmentAttempt.model.js';

let mongod;
let token;
let user;
let jsSkill;
let reactSkill;
let nodeSkill;
let dockerSkill;
let fullStackCareer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Create Skills
  jsSkill = await Skill.create({ name: 'JavaScript', category: 'Programming' });
  reactSkill = await Skill.create({ name: 'React', category: 'Frontend' });
  nodeSkill = await Skill.create({ name: 'Node.js', category: 'Backend' });
  dockerSkill = await Skill.create({ name: 'Docker', category: 'DevOps' });

  // Create Target Career
  fullStackCareer = await Career.create({
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    category: 'Software Engineering',
    isActive: true,
  });

  // Create Weighted Requirements:
  // JS: weight 10, req 4
  // React: weight 9, req 3
  // Node.js: weight 9, req 3
  // Docker: weight 6, req 2
  await CareerRequirement.create([
    { careerId: fullStackCareer._id, skillId: jsSkill._id, importance: 'Critical', requiredProficiency: 4, weight: 10 },
    { careerId: fullStackCareer._id, skillId: reactSkill._id, importance: 'High', requiredProficiency: 3, weight: 9 },
    { careerId: fullStackCareer._id, skillId: nodeSkill._id, importance: 'High', requiredProficiency: 3, weight: 9 },
    { careerId: fullStackCareer._id, skillId: dockerSkill._id, importance: 'Medium', requiredProficiency: 2, weight: 6 },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  // Create student session
  const loginRes = await request(app)
    .post('/api/v1/auth/dev-login')
    .send({ email: 'alex.gap@apex.edu', name: 'Alex Gap', role: 'STUDENT' });

  token = loginRes.body.data.token;
  user = loginRes.body.data.user;
});

afterEach(async () => {
  await StudentProfile.deleteMany({});
  await AssessmentAttempt.deleteMany({});
  await User.deleteMany({});
});

describe('GET /api/v1/career-analysis', () => {
  it('returns 400 if student has not selected a target career and no careerId query is provided', async () => {
    const res = await request(app)
      .get('/api/v1/career-analysis')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('performs deterministic gap analysis: categorizes matched, weak, and missing skills', async () => {
    // Setup student profile with:
    // - JavaScript at level 4 (Matched: 4 >= 4)
    // - React at level 2 (Weak: 2 < 3, gap = 1)
    // - Node.js at level 3 (Matched: 3 >= 3)
    // - Docker missing (Missing: level 0, req = 2)
    await StudentProfile.create({
      userId: user._id,
      targetCareerId: fullStackCareer._id,
      skills: [
        { skillId: jsSkill._id, skillName: 'JavaScript', proficiencyLevel: 4, verified: true },
        { skillId: reactSkill._id, skillName: 'React', proficiencyLevel: 2, verified: false },
        { skillId: nodeSkill._id, skillName: 'Node.js', proficiencyLevel: 3, verified: false },
      ],
    });

    const res = await request(app)
      .get('/api/v1/career-analysis')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.targetCareer.title).toBe('Full Stack Developer');
    expect(data.readinessScore).toBeGreaterThan(0);

    // Matched skills: JavaScript & Node.js
    const matchedNames = data.matchedSkills.map((s) => s.name);
    expect(matchedNames).toContain('JavaScript');
    expect(matchedNames).toContain('Node.js');

    // Weak skills: React (gap = 1)
    expect(data.weakSkills.length).toBe(1);
    expect(data.weakSkills[0].name).toBe('React');
    expect(data.weakSkills[0].gap).toBe(1);

    // Missing skills: Docker
    expect(data.missingSkills.length).toBe(1);
    expect(data.missingSkills[0].name).toBe('Docker');
    expect(data.missingSkills[0].requiredLevel).toBe(2);

    // Priority skills: Docker and React should top the list
    expect(data.prioritySkills).toContain('Docker');
    expect(data.prioritySkills).toContain('React');

    // Database persistence check
    const updatedProfile = await StudentProfile.findOne({ userId: user._id });
    expect(updatedProfile.readinessScore.overall).toBe(data.readinessScore);
    expect(updatedProfile.readinessScore.breakdown.technicalSkills).toBe(data.breakdown.technicalSkills);
  });

  it('incorporates completed assessment scores into readiness breakdown', async () => {
    // Create student profile
    const profile = await StudentProfile.create({
      userId: user._id,
      targetCareerId: fullStackCareer._id,
      skills: [{ skillId: jsSkill._id, skillName: 'JavaScript', proficiencyLevel: 4, verified: true }],
    });

    const assessment = await Assessment.create({
      title: 'JS Test',
      skillId: jsSkill._id,
      questions: [{ questionText: 'Q1', options: ['A', 'B'], correctOptionIndex: 0 }],
    });

    // Create a 90% completed assessment attempt
    await AssessmentAttempt.create({
      assessmentId: assessment._id,
      studentId: user._id,
      skillId: jsSkill._id,
      score: 90,
      maxScore: 100,
      percentage: 90,
      passed: true,
      isCompleted: true,
    });

    const res = await request(app)
      .get('/api/v1/career-analysis')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.breakdown.assessmentPerformance).toBe(90);
  });

  it('allows temporary analysis of an override career without changing primary target career', async () => {
    const mlCareer = await Career.create({
      title: 'ML Engineer',
      slug: 'ml-engineer',
      category: 'Data & AI',
      isActive: true,
    });

    await CareerRequirement.create([
      { careerId: mlCareer._id, skillId: jsSkill._id, importance: 'Low', requiredProficiency: 2, weight: 4 },
    ]);

    await StudentProfile.create({
      userId: user._id,
      targetCareerId: fullStackCareer._id,
    });

    const res = await request(app)
      .get(`/api/v1/career-analysis?careerId=${mlCareer._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.targetCareer.title).toBe('ML Engineer');

    // Verify student primary target career in DB is still Full Stack Developer
    const profile = await StudentProfile.findOne({ userId: user._id });
    expect(profile.targetCareerId.toString()).toBe(fullStackCareer._id.toString());
  });
});