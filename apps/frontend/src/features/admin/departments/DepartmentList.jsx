/**
 * DepartmentList.jsx
 *
 * Admin Department Overview — displays department roster with student counts and readiness metrics.
 *
 * Data source:  GET /api/v1/admin/departments  (via adminApi.getDepartments)
 * API contract: docs/API_CONTRACT.md §13
 * Design spec:  docs/DESIGN.md
 *
 * ─── Response shape (from API_CONTRACT.md §13) ────────────────────────────
 * {
 *   _id:              string
 *   name:             string
 *   code:             string
 *   headOfDepartment: string
 *   studentCount:     number
 * }
 *
 * NOTE: The API contract does NOT define averageReadiness or placementReadyCount
 * as part of the departments endpoint response. These fields were requested in the
 * task but are not documented in API_CONTRACT.md §13. If these fields are added to
 * the backend, update this component accordingly.
 *
 * ─── Shared component status ──────────────────────────────────────────────
 * Badge.jsx → EMPTY  — local inline badges used; TODO comment for swap
 * Card.jsx  → EMPTY  — local card structure used; TODO comment for swap
 * Table.jsx → EMPTY  — local table used;         TODO comment for swap
 *
 * ─── Development fallback data ────────────────────────────────────────────
 * The backend is not yet implemented. MOCK_DEPARTMENTS below matches
 * the API_CONTRACT.md §13 response exactly. It is used ONLY when the API
 * call fails (network error / 404) and only in development mode.
 * Remove or gate it once the backend is live.
 * ──────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

// ─── Design tokens (docs/DESIGN.md) ───────────────────────────────────────────
const T = {
  appBg:       '#0B0F17',
  surface:     '#111827',
  border:      '#1F2937',
  textPrimary: '#F9FAFB',
  textMuted:   '#9CA3AF',
  blue:        '#2563EB',
  blueHover:   '#1D4ED8',
  emerald:     '#059669',
  emeraldBg:   'rgba(5,150,105,0.12)',
  emeraldText: '#34D399',
  teal:        '#0D9488',
  tealBg:      'rgba(13,148,136,0.12)',
  tealText:    '#2DD4BF',
  amber:       '#D97706',
  amberBg:     'rgba(217,119,6,0.12)',
  amberText:   '#FBBF24',
  red:         '#DC2626',
  redBg:       'rgba(220,38,38,0.12)',
  redText:     '#F87171',
  cobalt:      '#1E3A8A',
};

// ─── DEVELOPMENT FALLBACK DATA ──────────────────────────────────────────────────
// Matches docs/API_CONTRACT.md §13 field names exactly.
// Used ONLY in DEV when API call fails (backend not yet implemented).
// REMOVE or gate behind import.meta.env.DEV once backend is live.
const MOCK_DEPARTMENTS = [
  {
    _id: '65e01f29b4e87a2130e9d050',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    headOfDepartment: 'Dr. Sarah Jenkins',
    studentCount: 450,
  },
  {
    _id: '65e01f29b4e87a2130e9d051',
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    headOfDepartment: 'Dr. Michael Thompson',
    studentCount: 380,
  },
  {
    _id: '65e01f29b4e87a2130e9d052',
    name: 'Information Technology',
    code: 'IT',
    headOfDepartment: 'Dr. Priya Sharma',
    studentCount: 418,
  },
  {
    _id: '65e01f29b4e87a2130e9d053',
    name: 'Mechanical Engineering',
    code: 'MECH',
    headOfDepartment: 'Dr. Robert Chen',
    studentCount: 325,
  },
  {
    _id: '65e01f29b4e87a2130e9d054',
    name: 'Civil Engineering',
    code: 'CIVIL',
    headOfDepartment: 'Dr. Anjali Verma',
    studentCount: 290,
  },
];

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
function DepartmentSkeleton() {
  const pulse = { backgroundColor: T.border, borderRadius: '6px' };
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading departments…">
      {/* Grid of skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
          >
            <div className="flex items-start justify-between">
              <div className="animate-pulse w-10 h-10 rounded-lg" style={pulse} />
              <div className="animate-pulse h-6 w-16 rounded" style={pulse} />
            </div>
            <div className="space-y-2">
              <div className="animate-pulse h-5 w-32 rounded" style={pulse} />
              <div className="animate-pulse h-4 w-24 rounded" style={pulse} />
            </div>
            <div className="space-y-2 pt-2" style={{ borderTop: `1px solid ${T.border}` }}>
              <div className="animate-pulse h-3 w-full rounded" style={pulse} />
              <div className="animate-pulse h-3 w-3/4 rounded" style={pulse} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────────
function DepartmentError({ error, onRetry }) {
  return (
    <div
      className="rounded-xl p-8 flex flex-col items-center gap-4 text-center"
      style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
      role="alert"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: T.redBg }}
        aria-hidden="true"
      >
        <AlertCircle size={24} style={{ color: T.redText }} />
      </div>
      <div>
        <p
          className="font-semibold mb-1"
          style={{ color: T.textPrimary, fontSize: '1rem' }}
        >
          Failed to load departments
        </p>
        <p className="text-sm" style={{ color: T.textMuted }}>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {error?.code && (
          <p className="text-xs mt-1 font-mono" style={{ color: T.textMuted }}>
            Error code: {error.code}
          </p>
        )}
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
        style={{ backgroundColor: T.blue, color: '#ffffff' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.blueHover; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.blue; }}
      >
        <RefreshCw size={15} aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function DepartmentEmpty() {
  return (
    <div
      className="rounded-xl p-8 flex flex-col items-center gap-4 text-center"
      style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(37,99,235,0.12)' }}
        aria-hidden="true"
      >
        <Building2 size={24} style={{ color: '#93C5FD' }} />
      </div>
      <div>
        <p className="font-semibold mb-1" style={{ color: T.textPrimary, fontSize: '1rem' }}>
          No departments found
        </p>
        <p className="text-sm" style={{ color: T.textMuted }}>
          Department data will appear here once configured for your institution.
        </p>
      </div>
    </div>
  );
}

// ─── Department Card ───────────────────────────────────────────────────────────
// Displays a single department with its documented fields from API_CONTRACT.md §13.
// TODO: Replace with <Card /> from src/components/ui/Card.jsx when implemented.
function DepartmentCard({ department }) {
  return (
    <article
      className="rounded-xl p-5 flex flex-col gap-4 transition-colors duration-150"
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#374151'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
    >
      {/* Header: Icon + Code Badge */}
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(37,99,235,0.12)' }}
          aria-hidden="true"
        >
          <GraduationCap size={20} style={{ color: '#93C5FD' }} strokeWidth={1.75} />
        </div>
        <span
          className="inline-block text-xs font-bold px-2.5 py-1 rounded"
          style={{
            backgroundColor: 'rgba(37,99,235,0.10)',
            color: '#93C5FD',
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            letterSpacing: '0.02em',
          }}
        >
          {department.code}
        </span>
      </div>

      {/* Department Name */}
      <div>
        <h3
          className="font-semibold leading-snug"
          style={{
            fontSize: '1rem',    /* 16px H3 from DESIGN.md */
            color: T.textPrimary,
            fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif',
          }}
        >
          {department.name}
        </h3>
      </div>

      {/* Student Count */}
      <div className="flex items-center gap-2">
        <Users size={14} style={{ color: T.textMuted }} aria-hidden="true" />
        <p className="text-sm" style={{ color: T.textMuted }}>
          <span className="font-semibold" style={{ color: T.textPrimary }}>
            {department.studentCount?.toLocaleString() ?? 0}
          </span>
          {' '}
          {department.studentCount === 1 ? 'student' : 'students'}
        </p>
      </div>

      {/* Head of Department */}
      {department.headOfDepartment && (
        <div
          className="pt-3 mt-auto"
          style={{ borderTop: `1px solid ${T.border}` }}
        >
          <p
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: T.textMuted, letterSpacing: '0.06em' }}
          >
            Head of Department
          </p>
          <p
            className="text-sm font-medium"
            style={{ color: T.textPrimary }}
          >
            {department.headOfDepartment}
          </p>
        </div>
      )}
    </article>
  );
}

// ─── Summary Stats ─────────────────────────────────────────────────────────────
// Displays aggregate metrics derived from the department list.
function SummaryStats({ departments }) {
  const totalStudents = departments.reduce((sum, d) => sum + (d.studentCount ?? 0), 0);
  const totalDepartments = departments.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Total Departments */}
      <div
        className="rounded-xl p-5 flex items-center gap-4"
        style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
        }}
      >
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(37,99,235,0.12)' }}
          aria-hidden="true"
        >
          <Building2 size={22} style={{ color: '#93C5FD' }} strokeWidth={1.75} />
        </div>
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: T.textMuted, letterSpacing: '0.06em' }}
          >
            Departments
          </p>
          <p
            className="font-extrabold leading-none"
            style={{
              color: T.textPrimary,
              fontSize: '1.75rem',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif',
            }}
          >
            {totalDepartments}
          </p>
        </div>
      </div>

      {/* Total Students */}
      <div
        className="rounded-xl p-5 flex items-center gap-4"
        style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
        }}
      >
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: T.emeraldBg }}
          aria-hidden="true"
        >
          <Users size={22} style={{ color: T.emeraldText }} strokeWidth={1.75} />
        </div>
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: T.textMuted, letterSpacing: '0.06em' }}
          >
            Total Students
          </p>
          <p
            className="font-extrabold leading-none"
            style={{
              color: T.textPrimary,
              fontSize: '1.75rem',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif',
            }}
          >
            {totalStudents.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DepartmentList — main component
// ═══════════════════════════════════════════════════════════════════════════════
export default function DepartmentList() {
  const [state, setState] = useState({
    status: 'idle',   // 'idle' | 'loading' | 'success' | 'error'
    departments: [],
    error: null,
    usingFallback: false,
  });

  const fetchDepartments = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      // client.js interceptor unwraps response.data, so we get { success, data }
      const response = await adminApi.getDepartments();
      const data = response?.data ?? response;
      const departments = Array.isArray(data) ? data : [];
      setState({ status: 'success', departments, error: null, usingFallback: false });
    } catch (err) {
      // Backend not yet implemented — use fallback in development only.
      // Remove this fallback block once backend is live.
      if (import.meta.env.DEV) {
        console.warn(
          '[DepartmentList] API call failed — backend not yet implemented. ' +
          'Using MOCK_DEPARTMENTS from API_CONTRACT.md §13. ' +
          'Remove this fallback once the backend is live.',
          err,
        );
        setState({ status: 'success', departments: MOCK_DEPARTMENTS, error: null, usingFallback: true });
      } else {
        setState({ status: 'error', departments: [], error: err, usingFallback: false });
      }
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const { status, departments, error, usingFallback } = state;
  const isLoading  = status === 'loading';
  const isError    = status === 'error';
  const isSuccess  = status === 'success';
  const isEmpty    = isSuccess && departments.length === 0;

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif' }}
    >
      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1
            className="font-bold"
            style={{
              fontSize: '1.75rem',   /* 28px H1 from DESIGN.md */
              color: T.textPrimary,
              letterSpacing: '-0.02em',
            }}
          >
            Departments
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: T.textMuted }}
          >
            {departments.length > 0
              ? `${departments.length} ${departments.length === 1 ? 'department' : 'departments'} in your institution`
              : 'Department overview for your institution'}
          </p>
        </div>

        {/* Fallback data warning badge — dev only */}
        {usingFallback && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0"
            style={{
              backgroundColor: T.amberBg,
              color: T.amberText,
              border: `1px solid ${T.amber}40`,
            }}
            role="status"
          >
            <AlertTriangle size={14} aria-hidden="true" />
            Using mock data — backend pending
          </div>
        )}
      </header>

      {/* ── Loading ── */}
      {isLoading && <DepartmentSkeleton />}

      {/* ── Error ── */}
      {isError && (
        <DepartmentError error={error} onRetry={fetchDepartments} />
      )}

      {/* ── Success ── */}
      {isSuccess && (
        <>
          {isEmpty ? (
            <DepartmentEmpty />
          ) : (
            <>
              {/* Summary Stats */}
              <SummaryStats departments={departments} />

              {/* Department Grid */}
              {/*
               * TODO: Replace DepartmentCard with <Card /> from
               * src/components/ui/Card.jsx when implemented.
               */}
              <section aria-label="Department list">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map(dept => (
                    <DepartmentCard key={dept._id} department={dept} />
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
