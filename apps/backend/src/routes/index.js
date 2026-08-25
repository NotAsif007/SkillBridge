import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import profileRouter from './profile.routes.js';

const router = Router();

// Health check — public
router.use('/health', healthRouter);

// Auth routes — /api/v1/auth
router.use('/auth', authRouter);

// Profile routes — /api/v1/profile
router.use('/profile', profileRouter);

// Phase 4+ routes:
// router.use('/careers',     careerRouter);
// router.use('/skills',      skillRouter);
// router.use('/career-analysis', gapEngineRouter);
// router.use('/assessments', assessmentRouter);
// router.use('/roadmaps',    roadmapRouter);
// router.use('/projects',    projectRouter);
// router.use('/resumes',     resumeRouter);
// router.use('/interviews',  interviewRouter);
// router.use('/jobs',        jobRouter);
// router.use('/dashboard',   dashboardRouter);
// router.use('/admin',       adminRouter);

export default router;