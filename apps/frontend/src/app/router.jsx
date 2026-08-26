import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// ─── Layouts ─────────────────────────────────────────────────────────────────
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout   from '../layouts/AdminLayout';

// ─── Student Feature Pages (Person 2) ─────────────────────────────────────────
import StudentDashboard   from '../features/student/dashboard/StudentDashboard';
import StudentProfile     from '../features/student/profile/StudentProfile';
import CareerList         from '../features/student/careers/CareerList';
import CareerDetail       from '../features/student/careers/CareerDetail';
import CareerAnalysis     from '../features/student/careers/CareerAnalysis';
import AssessmentList     from '../features/student/assessments/AssessmentList';
import AssessmentTake     from '../features/student/assessments/AssessmentTake';
import AssessmentResult   from '../features/student/assessments/AssessmentResult';
import RoadmapView        from '../features/student/roadmap/RoadmapView';
import ProjectList        from '../features/student/projects/ProjectList';
import ResumeUpload       from '../features/student/resume/ResumeUpload';
import ResumeAnalysisView from '../features/student/resume/ResumeAnalysisView';
import InterviewSetup     from '../features/student/interview/InterviewSetup';
import InterviewSession   from '../features/student/interview/InterviewSession';
import InterviewReport    from '../features/student/interview/InterviewReport';
import JobList            from '../features/student/jobs/JobList';

// ─── Admin Feature Pages (Person 3 — do NOT modify) ──────────────────────────
import AdminDashboard    from '../features/admin/dashboard/AdminDashboard';
import StudentList       from '../features/admin/students/StudentList';
import DepartmentList    from '../features/admin/departments/DepartmentList';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <div className="p-8 text-center" style={{ color: '#F9FAFB', background: '#0B0F17', minHeight: '100vh' }}>Login Page</div>,
  },

  // ─── Student Portal (Person 2) — wrapped in StudentLayout ─────────────────
  {
    element: <StudentLayout />,
    children: [
      { path: '/dashboard',        element: <StudentDashboard /> },
      { path: '/profile',          element: <StudentProfile /> },
      { path: '/careers',          element: <CareerList /> },
      { path: '/careers/:id',      element: <CareerDetail /> },
      { path: '/career-analysis',  element: <CareerAnalysis /> },
      { path: '/assessments',      element: <AssessmentList /> },
      { path: '/assessments/:id',  element: <AssessmentTake /> },
      { path: '/assessments/result', element: <AssessmentResult /> },
      { path: '/roadmap',          element: <RoadmapView /> },
      { path: '/projects',         element: <ProjectList /> },
      { path: '/resume',           element: <ResumeUpload /> },
      { path: '/resume/analysis',  element: <ResumeAnalysisView /> },
      { path: '/interview',        element: <InterviewSetup /> },
      { path: '/interview/session', element: <InterviewSession /> },
      { path: '/interview/report', element: <InterviewReport /> },
      { path: '/jobs',             element: <JobList /> },
    ],
  },

  // ─── Admin Portal (Person 3) — wrapped in AdminLayout ────────────────────
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin',             element: <AdminDashboard /> },
      { path: '/admin/students',    element: <StudentList /> },
      { path: '/admin/departments', element: <DepartmentList /> },
      { path: '/admin/skills',      element: <div style={{ padding: '32px 40px', color: '#9CA3AF' }}>Institutional Skill Gaps (coming soon)</div> },
      { path: '/admin/reports',     element: <div style={{ padding: '32px 40px', color: '#9CA3AF' }}>Placement Reports (coming soon)</div> },
    ],
  },
]);
