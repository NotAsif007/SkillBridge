import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import profileRouter from './profile.routes.js';
import careerRouter from './career.routes.js';
import skillRouter from './skill.routes.js';
import assessmentRouter from './assessment.routes.js';
import gapEngineRouter from './gapEngine.routes.js';
import roadmapRouter from './roadmap.routes.js';

const router = Router();

// Health check — public
router.use('/health', healthRouter);

// Auth routes — /api/v1/auth
router.use('/auth', authRouter);

// Profile routes — /api/v1/profile
router.use('/profile', profileRouter);

// Career routes — /api/v1/careers
router.use('/careers', careerRouter);

// Skill routes — /api/v1/skills
router.use('/skills', skillRouter);

// Assessment routes — /api/v1/assessments
router.use('/assessments', assessmentRouter);

// Career Gap Analysis — /api/v1/career-analysis
router.use('/career-analysis', gapEngineRouter);

// Roadmaps — /api/v1/roadmaps
router.use('/roadmaps', roadmapRouter);

// Phase 9+ routes:
// router.use('/projects',    projectRouter);
// router.use('/resumes',     resumeRouter);
// router.use('/interviews',  interviewRouter);
// router.use('/jobs',        jobRouter);
// router.use('/dashboard',   dashboardRouter);
// router.use('/admin',       adminRouter);

export default router;