/**
 * StudentList.jsx
 *
 * Admin Student Roster — paginated, searchable, filterable table.
 *
 * Data sources (docs/API_CONTRACT.md §13):
 *   GET /api/v1/admin/students  → adminApi.getStudents(params)
 *   GET /api/v1/admin/departments → adminApi.getDepartments()
 *
 * ─── Student record shape (exact API_CONTRACT.md fields) ──────────────────
 * {
 *   id:             string
 *   name:           string
 *   email:          string
 *   rollNumber:     string
 *   department:     string   (department code/name as string — NOT an object)
 *   graduationYear: number
 *   targetCareer:   string
 *   readinessScore: number   (0–100)
 *   status:         string   ('IN_PROGRESS' | 'COMPLETED' | …)
 * }
 * NOTE: 'lastActive' is NOT in the API contract — it is not displayed.
 *
 * ─── Pagination shape ─────────────────────────────────────────────────────
 * { page, limit, total, totalPages }
 *
 * ─── Supported query params ───────────────────────────────────────────────
 * page · limit · departmentId · search · minReadiness
 *
 * ─── Shared components status ─────────────────────────────────────────────
 * Badge.jsx   → EMPTY  — local ReadinessBadge used; TODO comment for swap
 * Input.jsx   → EMPTY  — local SearchInput used;    TODO comment for swap
 * Table.jsx   → EMPTY  — local RosterTable used;    TODO comment for swap
 *
 * ─── StudentDrawer integration boundary ──────────────────────────────────
 * Clicking a row sets `selectedStudent` state.
 * The drawer prop boundary is clearly defined at the bottom of this file.
 * When StudentDrawer.jsx is implemented, add:
 *   <StudentDrawer student={selectedStudent} onClose={() => setSelectedStudent(null)} />
 *
 * ─── Development fallback data ────────────────────────────────────────────
 * MOCK_STUDENTS and MOCK_DEPARTMENTS exactly match API_CONTRACT.md §13.
 * Active only in import.meta.env.DEV when the API call fails.
 * Remove once backend is live.
 * ──────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  X,
} from 'lucide-react';
import { adminApi } from '../../../api/admin';
import StudentDrawer from './StudentDrawer';

// ─── Design tokens (docs/DESIGN.md) ───────────────────────────────────────────
const T = {
  appBg:       '#F5F5F7',
  surface:     '#FFFFFF',
  border:      '#E5E5EA',
  borderHover: '#374151',
  textPrimary: '#1D1D1F',
  textMuted:   '#6E6E73',
  blue:        '#1D1D1F',
  blueHover:   '#000000',
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
};

const PAGE_SIZE = 20; // matches API default (contract shows limit: 20)

// ─── Readiness helpers ─────────────────────────────────────────────────────────
function readinessStyle(score) {
  if (score >= 80) return { text: T.emeraldText, bg: T.emeraldBg, label: 'Placement Ready' };
  if (score >= 60) return { text: T.tealText,    bg: T.tealBg,    label: 'Placement Emerging' };
  return               { text: T.amberText,   bg: T.amberBg,   label: 'Building Foundation' };
}

// Status display map
const STATUS_LABELS = {
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
};

// ─── DEVELOPMENT FALLBACK DATA ──────────────────────────────────────────────────
// Matches docs/API_CONTRACT.md §13 field names exactly.
// Used ONLY in DEV when API call fails (backend not yet implemented).
// REMOVE or gate behind import.meta.env.DEV once backend is live.

const MOCK_DEPARTMENTS = [
  { _id: 'dept-cse', name: 'Computer Science & Engineering', code: 'CSE', studentCount: 450 },
  { _id: 'dept-ece', name: 'Electronics & Communication',    code: 'ECE', studentCount: 380 },
  { _id: 'dept-it',  name: 'Information Technology',         code: 'IT',  studentCount: 418 },
];

function buildMockStudents(page = 1, limit = PAGE_SIZE, search = '', dept = '', minReadiness = 0) {
  const all = [
    { id: 's001', name: 'Alex Chen',       email: 'alex.chen@apex.edu',    rollNumber: '2023CSE042', department: 'CSE', graduationYear: 2027, targetCareer: 'Full Stack Developer',  readinessScore: 72, status: 'IN_PROGRESS' },
    { id: 's002', name: 'Priya Sharma',    email: 'priya.s@apex.edu',      rollNumber: '2023CSE019', department: 'CSE', graduationYear: 2027, targetCareer: 'Backend Engineer',       readinessScore: 85, status: 'IN_PROGRESS' },
    { id: 's003', name: 'Ravi Kumar',      email: 'ravi.k@apex.edu',       rollNumber: '2023ECE007', department: 'ECE', graduationYear: 2026, targetCareer: 'Embedded Systems',      readinessScore: 54, status: 'IN_PROGRESS' },
    { id: 's004', name: 'Ananya Patel',    email: 'ananya.p@apex.edu',     rollNumber: '2023IT031',  department: 'IT',  graduationYear: 2027, targetCareer: 'Data Analyst',          readinessScore: 67, status: 'IN_PROGRESS' },
    { id: 's005', name: 'Karan Mehta',     email: 'karan.m@apex.edu',      rollNumber: '2023CSE055', department: 'CSE', graduationYear: 2027, targetCareer: 'DevOps Engineer',       readinessScore: 91, status: 'IN_PROGRESS' },
    { id: 's006', name: 'Sneha Rao',       email: 'sneha.r@apex.edu',      rollNumber: '2023IT014',  department: 'IT',  graduationYear: 2026, targetCareer: 'Frontend Developer',    readinessScore: 78, status: 'IN_PROGRESS' },
    { id: 's007', name: 'Deepak Singh',    email: 'deepak.s@apex.edu',     rollNumber: '2023ECE023', department: 'ECE', graduationYear: 2027, targetCareer: 'ML Engineer',           readinessScore: 43, status: 'IN_PROGRESS' },
    { id: 's008', name: 'Nisha Verma',     email: 'nisha.v@apex.edu',      rollNumber: '2023CSE088', department: 'CSE', graduationYear: 2026, targetCareer: 'Cloud Architect',       readinessScore: 82, status: 'IN_PROGRESS' },
  ];
  let filtered = all;
  if (search) filtered = filtered.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );
  if (dept) {
    const d = MOCK_DEPARTMENTS.find(d => d._id === dept);
    if (d) filtered = filtered.filter(s => s.department === d.code);
  }
  if (minReadiness > 0) filtered = filtered.filter(s => s.readinessScore >= minReadiness);
  const total = filtered.length;
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

// ─── Local: Readiness Badge ────────────────────────────────────────────────────
// TODO: Replace with <Badge /> from src/components/ui/Badge.jsx when implemented.
function ReadinessBadge({ score }) {
  const { text, bg, label } = readinessStyle(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ backgroundColor: bg, color: text }}
      title={label}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block"
        style={{ backgroundColor: text }}
        aria-hidden="true"
      />
      {score}%
    </span>
  );
}

// ─── Local: Search Input ───────────────────────────────────────────────────────
// TODO: Replace with <Input /> from src/components/ui/Input.jsx when implemented.
function SearchInput({ value, onChange, onClear, placeholder }) {
  return (
    <div className="relative flex-1">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: T.textMuted }}
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg text-sm pl-9 pr-8 py-2 outline-none transition-colors"
        style={{
          backgroundColor: T.appBg,
          border: `1px solid ${T.border}`,
          color: T.textPrimary,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = T.blue; }}
        onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
        aria-label="Search students"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5"
          style={{ color: T.textMuted }}
          aria-label="Clear search"
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ─── Local: Select ─────────────────────────────────────────────────────────────
function SelectFilter({ value, onChange, children, label }) {
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg text-sm pl-3 pr-8 py-2 appearance-none outline-none transition-colors w-full"
        style={{
          backgroundColor: T.appBg,
          border: `1px solid ${T.border}`,
          color: value ? T.textPrimary : T.textMuted,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = T.blue; }}
        onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
        aria-label={label}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: T.textMuted }}
        aria-hidden="true"
      />
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  const pulse = { backgroundColor: T.border, borderRadius: '4px' };
  return (
    <tr aria-hidden="true">
      {[140, 90, 60, 110, 60].map((w, i) => (
        <td key={i} className="py-3.5 px-4 first:pl-5">
          <div className="animate-pulse h-4 rounded" style={{ ...pulse, width: `${w}px`, maxWidth: '100%' }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, onClear }) {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(37,99,235,0.10)' }}
            aria-hidden="true"
          >
            <Users size={24} style={{ color: '#177245' }} />
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: T.textPrimary }}>
              {hasFilters ? 'No students match your filters' : 'No students found'}
            </p>
            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
              {hasFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'Students will appear here once they join the platform.'}
            </p>
          </div>
          {hasFilters && (
            <button
              onClick={onClear}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: 'rgba(37,99,235,0.12)', color: '#177245' }}
            >
              Clear filters
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────────
function ErrorState({ error, onRetry }) {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center gap-3 py-14 text-center" role="alert">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: T.redBg }}
            aria-hidden="true"
          >
            <AlertCircle size={24} style={{ color: T.redText }} />
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: T.textPrimary }}>
              Failed to load students
            </p>
            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
              {error?.message || 'An unexpected error occurred.'}
            </p>
            {error?.code && (
              <p className="text-xs mt-0.5 font-mono" style={{ color: T.textMuted }}>
                {error.code}
              </p>
            )}
          </div>
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: T.blue, color: '#fff' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.blueHover; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.blue; }}
          >
            <RefreshCw size={13} aria-hidden="true" />
            Retry
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ pagination, onPageChange, isLoading }) {
  if (!pagination) return null;
  const { page, totalPages, total } = pagination;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3"
      style={{ borderTop: `1px solid ${T.border}` }}
    >
      <p className="text-xs order-2 sm:order-1" style={{ color: T.textMuted }}>
        {total != null
          ? `${((page - 1) * pagination.limit + 1).toLocaleString()}–${Math.min(page * pagination.limit, total).toLocaleString()} of ${total.toLocaleString()} students`
          : `Page ${page} of ${totalPages}`}
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev || isLoading}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: canPrev && !isLoading ? T.surface : 'transparent',
            border: `1px solid ${T.border}`,
            color: T.textMuted,
          }}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} aria-hidden="true" />
        </button>

        {/* Page number pills — show at most 5 around current page */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, i, arr) => {
            if (i > 0 && arr[i - 1] !== p - 1) acc.push('…');
            acc.push(p);
            return acc;
          }, [])
          .map((item, idx) =>
            item === '…' ? (
              <span key={`ellipsis-${idx}`} className="w-8 text-center text-xs" style={{ color: T.textMuted }}>…</span>
            ) : (
              <button
                key={item}
                onClick={() => item !== page && onPageChange(item)}
                disabled={isLoading}
                className="w-8 h-8 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed"
                style={{
                  backgroundColor: item === page ? T.blue : 'transparent',
                  border: `1px solid ${item === page ? T.blue : T.border}`,
                  color: item === page ? '#fff' : T.textMuted,
                }}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            )
          )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext || isLoading}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: canNext && !isLoading ? T.surface : 'transparent',
            border: `1px solid ${T.border}`,
            color: T.textMuted,
          }}
          aria-label="Next page"
        >
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ─── Student Table Row ─────────────────────────────────────────────────────────
function StudentRow({ student, isSelected, onClick, isEven }) {
  // Fields used — all from API_CONTRACT.md §13:
  //   id, name, email, rollNumber, department, graduationYear, targetCareer, readinessScore, status
  return (
    <tr
      onClick={() => onClick(student)}
      className="cursor-pointer transition-colors group"
      style={{
        backgroundColor: isSelected
          ? 'rgba(37,99,235,0.08)'
          : isEven
          ? 'transparent'
          : 'rgba(255,255,255,0.025)',   /* DESIGN.md §4.3 — 5% contrast zebra */
        borderBottom: `1px solid ${T.border}`,
      }}
      onMouseEnter={e => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = isEven
            ? 'transparent'
            : 'rgba(255,255,255,0.025)';
        }
      }}
      aria-selected={isSelected}
    >
      {/* Name + email + roll */}
      <td className="py-3.5 px-4 pl-5">
        <div>
          <p className="text-sm font-medium" style={{ color: T.textPrimary }}>
            {student.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
            {student.rollNumber} · {student.email}
          </p>
        </div>
      </td>

      {/* Department */}
      <td className="py-3.5 px-4 hidden sm:table-cell">
        <span
          className="inline-block text-xs font-medium px-2 py-0.5 rounded"
          style={{
            backgroundColor: 'rgba(37,99,235,0.10)',
            color: '#177245',
          }}
        >
          {student.department}
        </span>
      </td>

      {/* Readiness score */}
      <td className="py-3.5 px-4">
        {/*
         * TODO: Replace ReadinessBadge with <Badge /> from
         * src/components/ui/Badge.jsx once implemented.
         */}
        <ReadinessBadge score={student.readinessScore} />
      </td>

      {/* Target career */}
      <td className="py-3.5 px-4 hidden md:table-cell">
        <p className="text-sm" style={{ color: T.textMuted }}>
          {student.targetCareer || '—'}
        </p>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4 pr-5 hidden lg:table-cell">
        <span className="text-xs" style={{ color: T.textMuted }}>
          {STATUS_LABELS[student.status] ?? student.status ?? '—'}
        </span>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// StudentList — main component
// ═══════════════════════════════════════════════════════════════════════════════
export default function StudentList() {
  // ── Filter / pagination state ─────────────────────────────────────────────
  const [page, setPage]               = useState(1);
  const [searchInput, setSearchInput] = useState('');      // raw input value
  const [appliedSearch, setAppliedSearch] = useState(''); // sent to API
  const [departmentId, setDepartmentId]   = useState('');
  const [minReadiness, setMinReadiness]   = useState('');

  // ── Server data state ─────────────────────────────────────────────────────
  const [listState, setListState] = useState({
    status: 'idle',    // 'idle' | 'loading' | 'success' | 'error'
    students: [],
    pagination: null,
    error: null,
    usingFallback: false,
  });

  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);

  // ── Selected student — drawer integration boundary ────────────────────────
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ── Debounce search — 350ms after user stops typing ───────────────────────
  // Does NOT call the API on every keystroke.
  const debounceTimer = useRef(null);

  function handleSearchChange(value) {
    setSearchInput(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setAppliedSearch(value.trim());
      setPage(1);  // reset to first page on new search
    }, 350);
  }

  function clearSearch() {
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
    clearTimeout(debounceTimer.current);
  }

  // ── Department filter ─────────────────────────────────────────────────────
  function handleDepartmentChange(value) {
    setDepartmentId(value);
    setPage(1);
  }

  // ── Readiness filter ──────────────────────────────────────────────────────
  function handleMinReadinessChange(value) {
    setMinReadiness(value);
    setPage(1);
  }

  // ── Clear all filters ─────────────────────────────────────────────────────
  function clearAllFilters() {
    setSearchInput('');
    setAppliedSearch('');
    setDepartmentId('');
    setMinReadiness('');
    setPage(1);
    clearTimeout(debounceTimer.current);
  }

  const hasActiveFilters = Boolean(appliedSearch || departmentId || minReadiness);

  // ── Fetch departments (once on mount) ─────────────────────────────────────
  // Uses adminApi.getDepartments() — fully contracted in API_CONTRACT.md §13.
  useEffect(() => {
    async function fetchDepts() {
      setDeptLoading(true);
      try {
        const response = await adminApi.getDepartments();
        const data = response?.data ?? response;
        setDepartments(Array.isArray(data) ? data : []);
      } catch {
        if (import.meta.env.DEV) {
          setDepartments(MOCK_DEPARTMENTS);
        }
        // Non-critical — filter just shows empty dept list in prod
      } finally {
        setDeptLoading(false);
      }
    }
    fetchDepts();
  }, []);

  // ── Fetch students ─────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setListState(prev => ({ ...prev, status: 'loading', error: null }));

    // Build params using only documented query parameters
    const params = {
      page,
      limit: PAGE_SIZE,
      ...(appliedSearch  && { search:       appliedSearch }),
      ...(departmentId   && { departmentId  }),
      ...(minReadiness   && { minReadiness: Number(minReadiness) }),
    };

    try {
      // client.js interceptor unwraps response.data — we get { success, data, pagination }
      const response = await adminApi.getStudents(params);
      const students   = response?.data   ?? [];
      const pagination = response?.pagination ?? null;
      setListState({ status: 'success', students, pagination, error: null, usingFallback: false });
    } catch (err) {
      if (import.meta.env.DEV) {
        // Backend not yet implemented — use mock data.
        // REMOVE once backend is live.
        console.warn(
          '[StudentList] API call failed — backend not yet implemented. ' +
          'Using MOCK_STUDENTS from API_CONTRACT.md §13. ' +
          'Remove this fallback once the backend is live.',
          err,
        );
        const mock = buildMockStudents(page, PAGE_SIZE, appliedSearch, departmentId, Number(minReadiness) || 0);
        setListState({ status: 'success', students: mock.data, pagination: mock.pagination, error: null, usingFallback: true });
      } else {
        setListState(prev => ({ ...prev, status: 'error', error: err, usingFallback: false }));
      }
    }
  }, [page, appliedSearch, departmentId, minReadiness]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Cleanup debounce on unmount
  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  // ── Derived state ─────────────────────────────────────────────────────────
  const { status, students, pagination, error, usingFallback } = listState;
  const isLoading  = status === 'loading';
  const isError    = status === 'error';
  const isSuccess  = status === 'success';
  const isEmpty    = isSuccess && students.length === 0;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="space-y-5"
      style={{ fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif' }}
    >
      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1
            className="font-bold"
            style={{ fontSize: '1.75rem', color: T.textPrimary, letterSpacing: '-0.02em' }}
          >
            Students
          </h1>
          <p className="mt-1 text-sm" style={{ color: T.textMuted }}>
            {pagination?.total != null
              ? `${pagination.total.toLocaleString()} students in your institution`
              : 'Student roster for your institution'}
          </p>
        </div>

        {/* Mock data warning */}
        {usingFallback && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0"
            style={{ backgroundColor: T.amberBg, color: T.amberText, border: `1px solid ${T.amber}40` }}
            role="status"
          >
            <AlertTriangle size={14} aria-hidden="true" />
            Using mock data — backend pending
          </div>
        )}
      </header>

      {/* ── Search + Filter Bar ── */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/*
           * TODO: Replace SearchInput with <Input /> from
           * src/components/ui/Input.jsx when implemented.
           */}
          <SearchInput
            value={searchInput}
            onChange={handleSearchChange}
            onClear={clearSearch}
            placeholder="Search by name, email, or roll number…"
          />

          {/* Department filter — uses adminApi.getDepartments() */}
          <SelectFilter
            value={departmentId}
            onChange={handleDepartmentChange}
            label="Filter by department"
          >
            <option value="">All departments</option>
            {deptLoading ? (
              <option disabled>Loading…</option>
            ) : (
              departments.map(d => (
                <option key={d._id} value={d._id}>
                  {d.code} — {d.name}
                </option>
              ))
            )}
          </SelectFilter>

          {/* Min readiness filter */}
          <SelectFilter
            value={minReadiness}
            onChange={handleMinReadinessChange}
            label="Filter by minimum readiness"
          >
            <option value="">Any readiness</option>
            <option value="80">≥ 80% (Placement Ready)</option>
            <option value="60">≥ 60% (Emerging)</option>
            <option value="40">≥ 40%</option>
          </SelectFilter>

          {/* Clear button — only visible when filters active */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex-shrink-0"
              style={{
                border: `1px solid ${T.border}`,
                color: T.textMuted,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
            >
              <X size={13} aria-hidden="true" />
              Clear
            </button>
          )}
        </div>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {appliedSearch && (
              <FilterPill label={`Search: "${appliedSearch}"`} onRemove={clearSearch} />
            )}
            {departmentId && (() => {
              const d = departments.find(d => d._id === departmentId);
              return d
                ? <FilterPill label={`Dept: ${d.code}`} onRemove={() => handleDepartmentChange('')} />
                : null;
            })()}
            {minReadiness && (
              <FilterPill label={`Min readiness: ${minReadiness}%`} onRemove={() => handleMinReadinessChange('')} />
            )}
          </div>
        )}
      </div>

      {/* ── Table Card ── */}
      {/*
       * TODO: Replace table markup with <Table /> from
       * src/components/ui/Table.jsx when implemented.
       */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
      >
        {/* Responsive scroll wrapper — prevents horizontal overflow on mobile */}
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm border-collapse min-w-[540px]"
            aria-label="Student roster"
            aria-busy={isLoading}
          >
            {/* Sticky header — DESIGN.md §4.3 */}
            <thead>
              <tr style={{ backgroundColor: T.surface, borderBottom: `1px solid ${T.border}` }}>
                <th
                  className="text-left py-3 px-4 pl-5 font-medium"
                  style={{ color: T.textMuted, fontSize: '0.7rem', letterSpacing: '0.06em', position: 'sticky', top: 0, backgroundColor: T.surface, zIndex: 1 }}
                >
                  STUDENT
                </th>
                <th
                  className="text-left py-3 px-4 font-medium hidden sm:table-cell"
                  style={{ color: T.textMuted, fontSize: '0.7rem', letterSpacing: '0.06em', position: 'sticky', top: 0, backgroundColor: T.surface, zIndex: 1 }}
                >
                  DEPARTMENT
                </th>
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: T.textMuted, fontSize: '0.7rem', letterSpacing: '0.06em', position: 'sticky', top: 0, backgroundColor: T.surface, zIndex: 1 }}
                >
                  READINESS
                </th>
                <th
                  className="text-left py-3 px-4 font-medium hidden md:table-cell"
                  style={{ color: T.textMuted, fontSize: '0.7rem', letterSpacing: '0.06em', position: 'sticky', top: 0, backgroundColor: T.surface, zIndex: 1 }}
                >
                  TARGET CAREER
                </th>
                <th
                  className="text-left py-3 px-4 pr-5 font-medium hidden lg:table-cell"
                  style={{ color: T.textMuted, fontSize: '0.7rem', letterSpacing: '0.06em', position: 'sticky', top: 0, backgroundColor: T.surface, zIndex: 1 }}
                >
                  STATUS
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Loading — skeleton rows */}
              {isLoading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}

              {/* Error state */}
              {isError && <ErrorState error={error} onRetry={fetchStudents} />}

              {/* Empty state */}
              {isEmpty && <EmptyState hasFilters={hasActiveFilters} onClear={clearAllFilters} />}

              {/* Success — data rows */}
              {isSuccess && !isEmpty && students.map((student, idx) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  isEven={idx % 2 === 0}
                  isSelected={selectedStudent?.id === student.id}
                  onClick={setSelectedStudent}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination — sticky footer */}
        {isSuccess && pagination && pagination.totalPages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* ── StudentDrawer integration ── */}
      {selectedStudent && (
        <StudentDrawer
          student={selectedStudent}
          open={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

// ─── Filter Pill ───────────────────────────────────────────────────────────────
// Small helper kept at module scope to avoid re-definition on every render.
function FilterPill({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
      style={{ backgroundColor: 'rgba(37,99,235,0.12)', color: '#177245', border: '1px solid rgba(37,99,235,0.25)' }}
    >
      {label}
      <button
        onClick={onRemove}
        className="rounded-full"
        style={{ color: '#177245' }}
        aria-label={`Remove filter: ${label}`}
      >
        <X size={11} aria-hidden="true" />
      </button>
    </span>
  );
}
