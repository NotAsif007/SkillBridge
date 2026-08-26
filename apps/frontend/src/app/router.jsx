import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// ─── Layouts & Guards ────────────────────────────────────────────────────────
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout   from '../layouts/AdminLayout';
import { RequireAuth, RequireRole } from '../components/common/RouteGuards';

// ─── Pages ───────────────────────────────────────────────────────────────────
import LoginPage from '../pages/LoginPage';

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

// ─── Admin Feature Pages (Person 3) ──────────────────────────────────────────
import AdminDashboard        from '../features/admin/dashboard/AdminDashboard';
import StudentList           from '../features/admin/students/StudentList';
import DepartmentList        from '../features/admin/departments/DepartmentList';
import PlacementAnalytics    from '../features/admin/analytics/PlacementAnalytics';
import AssessmentAnalytics   from '../features/admin/assessments/AssessmentAnalytics';
import InterviewAnalytics    from '../features/admin/interviews/InterviewAnalytics';
import JobManagement         from '../features/admin/jobs/JobManagement';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ─── Student Portal (Person 2) — Protected by RequireAuth & RequireRole ──
  {
    element: (
      <RequireAuth>
        <RequireRole allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
          <StudentLayout />
        </RequireRole>
      </RequireAuth>
    ),
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

  // ─── Admin Portal (Person 3) — Protected by RequireAuth & RequireRole ────
  {
    element: (
      <RequireAuth>
        <RequireRole allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN']}>
          <AdminLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { path: '/admin',             element: <AdminDashboard /> },
      { path: '/admin/students',    element: <StudentList /> },
      { path: '/admin/departments', element: <DepartmentList /> },
      { path: '/admin/analytics',   element: <PlacementAnalytics /> },
      { path: '/admin/assessments', element: <AssessmentAnalytics /> },
      { path: '/admin/interviews',  element: <InterviewAnalytics /> },
      { path: '/admin/jobs',        element: <JobManagement /> },
    ],
  },
]);