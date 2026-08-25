import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Placeholder route wrappers for Person 2 (Student) and Person 3 (Admin)
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <div className="p-8 text-center">Login Page</div>,
  },
  // Student Portal Routes (Person 2 Area)
  {
    path: '/dashboard',
    element: <div className="p-8">Student Dashboard (Person 2)</div>,
  },
  {
    path: '/profile',
    element: <div className="p-8">Student Profile (Person 2)</div>,
  },
  {
    path: '/careers',
    element: <div className="p-8">Career Exploration (Person 2)</div>,
  },
  {
    path: '/career-analysis',
    element: <div className="p-8">Career Gap Analysis (Person 2)</div>,
  },
  {
    path: '/assessments',
    element: <div className="p-8">Skill Assessments (Person 2)</div>,
  },
  {
    path: '/roadmap',
    element: <div className="p-8">Personalized Roadmap (Person 2)</div>,
  },
  {
    path: '/projects',
    element: <div className="p-8">Project Portfolio (Person 2)</div>,
  },
  {
    path: '/resume',
    element: <div className="p-8">Resume Analyzer (Person 2)</div>,
  },
  {
    path: '/interview',
    element: <div className="p-8">AI Mock Interview (Person 2)</div>,
  },
  {
    path: '/jobs',
    element: <div className="p-8">Job Opportunities (Person 2)</div>,
  },
  // College Admin Portal Routes (Person 3 Area)
  {
    path: '/admin',
    element: <div className="p-8">College Placement Dashboard (Person 3)</div>,
  },
  {
    path: '/admin/students',
    element: <div className="p-8">Student Roster & Tracking (Person 3)</div>,
  },
  {
    path: '/admin/departments',
    element: <div className="p-8">Department Analytics (Person 3)</div>,
  },
  {
    path: '/admin/skills',
    element: <div className="p-8">Institutional Skill Gaps (Person 3)</div>,
  },
  {
    path: '/admin/reports',
    element: <div className="p-8">Placement Readiness Reports (Person 3)</div>,
  },
]);
