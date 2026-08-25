import { Router } from 'express';
import healthRouter from './health.routes.js';

const router = Router();

// Health check — no auth required
router.use('/health', healthRouter);

// Phase 2+ routes will be added here as they are implemented:
// router.use('/auth',        authRouter);
// router.use('/profile',     profileRouter);
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
