import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// ─── Layouts & Guards (Eagerly Loaded) ───────────────────────────────────────
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';
import { RequireAuth, RequireRole } from '../components/common/RouteGuards';
import LoginPage from '../pages/LoginPage';

// ─── Lightweight Loading Fallback ───────────────────────────────────────────
function PageFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6E6E73', fontSize: 13, fontWeight: 500 }}>
        <Loader2 size={18} className="animate-spin" style={{ color: '#059669' }} />
        <span>Loading workspace…</span>
      </div>
    </div>
  );
}

const withSuspense = (Component) => (
  <Suspense fallback={<PageFallback />}>
    <Component />
  </Suspense>
);

// ─── Lazy Loaded Feature Pages (Instant Code-Splitting) ─────────────────────
const StudentDashboard = lazy(() => import('../features/student/dashboard/StudentDashboard'));
const StudentProfile = lazy(() => import('../features/student/profile/StudentProfile'));
const CareerList = lazy(() => import('../features/student/careers/CareerList'));
const CareerDetail = lazy(() => import('../features/student/careers/CareerDetail'));
const CareerAnalysis = lazy(() => import('../features/student/careers/CareerAnalysis'));
const AssessmentList = lazy(() => import('../features/student/assessments/AssessmentList'));
const AssessmentTake = lazy(() => import('../features/student/assessments/AssessmentTake'));
const AssessmentResult = lazy(() => import('../features/student/assessments/AssessmentResult'));
const RoadmapView = lazy(() => import('../features/student/roadmap/RoadmapView'));
const ProjectList = lazy(() => import('../features/student/projects/ProjectList'));
const ResumeUpload = lazy(() => import('../features/student/resume/ResumeUpload'));
const ResumeAnalysisView = lazy(() => import('../features/student/resume/ResumeAnalysisView'));
const InterviewSetup = lazy(() => import('../features/student/interview/InterviewSetup'));
const InterviewSession = lazy(() => import('../features/student/interview/InterviewSession'));
const InterviewReport = lazy(() => import('../features/student/interview/InterviewReport'));
const JobList = lazy(() => import('../features/student/jobs/JobList'));

const AdminDashboard = lazy(() => import('../features/admin/dashboard/AdminDashboard'));
const StudentList = lazy(() => import('../features/admin/students/StudentList'));
const DepartmentList = lazy(() => import('../features/admin/departments/DepartmentList'));
const PlacementAnalytics = lazy(() => import('../features/admin/analytics/PlacementAnalytics'));
const AssessmentAnalytics = lazy(() => import('../features/admin/assessments/AssessmentAnalytics'));
const InterviewAnalytics = lazy(() => import('../features/admin/interviews/InterviewAnalytics'));
const JobManagement = lazy(() => import('../features/admin/jobs/JobManagement'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ─── Student Portal — Protected by RequireAuth & RequireRole ──────────────
  {
    element: (
      <RequireAuth>
        <RequireRole allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
          <StudentLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { path: '/dashboard', element: withSuspense(StudentDashboard) },
      { path: '/profile', element: withSuspense(StudentProfile) },
      { path: '/careers', element: withSuspense(CareerList) },
      { path: '/careers/:id', element: withSuspense(CareerDetail) },
      { path: '/career-analysis', element: withSuspense(CareerAnalysis) },
      { path: '/assessments', element: withSuspense(AssessmentList) },
      { path: '/assessments/:id', element: withSuspense(AssessmentTake) },
      { path: '/assessments/result', element: withSuspense(AssessmentResult) },
      { path: '/roadmap', element: withSuspense(RoadmapView) },
      { path: '/projects', element: withSuspense(ProjectList) },
      { path: '/resume', element: withSuspense(ResumeUpload) },
      { path: '/resume/analysis', element: withSuspense(ResumeAnalysisView) },
      { path: '/interview', element: withSuspense(InterviewSetup) },
      { path: '/interview/session', element: withSuspense(InterviewSession) },
      { path: '/interview/report', element: withSuspense(InterviewReport) },
      { path: '/jobs', element: withSuspense(JobList) },
    ],
  },

  // ─── Admin Portal — Protected by RequireAuth & RequireRole ────────────────
  {
    element: (
      <RequireAuth>
        <RequireRole allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN']}>
          <AdminLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { path: '/admin', element: withSuspense(AdminDashboard) },
      { path: '/admin/students', element: withSuspense(StudentList) },
      { path: '/admin/departments', element: withSuspense(DepartmentList) },
      { path: '/admin/analytics', element: withSuspense(PlacementAnalytics) },
      { path: '/admin/assessments', element: withSuspense(AssessmentAnalytics) },
      { path: '/admin/interviews', element: withSuspense(InterviewAnalytics) },
      { path: '/admin/jobs', element: withSuspense(JobManagement) },
    ],
  },
]);