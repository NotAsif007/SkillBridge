import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { GeminiService } from '../src/integrations/gemini/gemini.service.js';
import { AIGeneration } from '../src/models/aiGeneration.model.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await AIGeneration.deleteMany({});
});

describe('GeminiService AI Integration Layer', () => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyOrgId = new mongoose.Types.ObjectId();

  it('generates structured career insights and logs audit record', async () => {
    const result = await GeminiService.generateCareerInsights({
      targetCareer: { title: 'Full Stack Developer' },
      matchedSkills: [{ name: 'JavaScript', level: 4 }],
      weakSkills: [{ name: 'React', level: 2, requiredLevel: 3 }],
      missingSkills: [{ name: 'Docker' }],
      readinessScore: 71,
      userId: dummyUserId,
      orgId: dummyOrgId,
    });

    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(Array.isArray(result.keyStrengths)).toBe(true);
    expect(Array.isArray(result.actionableSteps)).toBe(true);

    const audit = await AIGeneration.findOne({ feature: 'CAREER_GAP' });
    expect(audit).not.toBeNull();
    expect(audit.userId.toString()).toBe(dummyUserId.toString());
  });

  it('generates structured personalized roadmap milestones and tasks', async () => {
    const result = await GeminiService.generateRoadmap({
      targetCareer: { title: 'DevOps Engineer' },
      missingSkills: [{ name: 'Docker' }, { name: 'Kubernetes' }],
      weakSkills: [{ name: 'Linux' }],
      durationWeeks: 4,
      userId: dummyUserId,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result.milestones)).toBe(true);
    expect(result.milestones.length).toBeGreaterThanOrEqual(1);

    const firstMilestone = result.milestones[0];
    expect(firstMilestone.weekNumber).toBe(1);
    expect(firstMilestone.title).toBeDefined();
    expect(Array.isArray(firstMilestone.tasks)).toBe(true);
    expect(firstMilestone.tasks[0].taskId).toBeDefined();
  });

  it('analyzes resume text and generates ATS diagnostic metrics', async () => {
    const resumeText = `Alex Chen - Software Engineer
Skills: JavaScript, Node.js, Express, React, MongoDB
Experience: Built fullstack collaborative workspace tool using WebSockets.`;

    const result = await GeminiService.analyzeResumeText({
      resumeText,
      targetCareer: 'Full Stack Developer',
      userId: dummyUserId,
    });

    expect(result).toBeDefined();
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.extractedSkills)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('generates recommended portfolio projects targeted to missing skills', async () => {
    const result = await GeminiService.recommendProjects({
      targetCareer: { title: 'Backend Developer' },
      missingSkills: [{ name: 'Redis' }, { name: 'Docker' }],
      currentSkillLevel: 'INTERMEDIATE',
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result.projects)).toBe(true);
    expect(result.projects.length).toBeGreaterThanOrEqual(1);

    const proj = result.projects[0];
    expect(proj.title).toBeDefined();
    expect(Array.isArray(proj.technologies)).toBe(true);
    expect(Array.isArray(proj.skillsCovered)).toBe(true);
  });

  it('generates interview questions and evaluates student answers', async () => {
    // 1. Question generation
    const question = await GeminiService.generateInterviewQuestion({
      targetCareer: { title: 'Full Stack Developer' },
      difficulty: 'MEDIUM',
      questionNumber: 1,
    });

    expect(question).toBeDefined();
    expect(question.questionText).toBeDefined();
    expect(question.skillTested).toBeDefined();
    expect(Array.isArray(question.expectedKeyPoints)).toBe(true);

    // 2. Answer evaluation
    const evaluation = await GeminiService.evaluateInterviewAnswer({
      questionText: question.questionText,
      skillTested: question.skillTested,
      studentAnswer:
        'In Node.js, asynchronous operations are dispatched to the thread pool or kernel via libuv, and the event loop processes their completed callbacks across phases.',
      difficulty: 'MEDIUM',
    });

    expect(evaluation).toBeDefined();
    expect(typeof evaluation.score).toBe('number');
    expect(evaluation.score).toBeGreaterThanOrEqual(0);
    expect(evaluation.feedback).toBeDefined();
    expect(evaluation.suggestedAnswer).toBeDefined();
  });
});