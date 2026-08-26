/**
 * AdminDashboard.jsx
 *
 * College Placement Overview — the main admin landing page.
 *
 * Data source:  GET /api/v1/dashboard/admin  (via adminApi.getDashboard)
 * API contract: docs/API_CONTRACT.md §13
 * Design spec:  docs/DESIGN.md
 *
 * ─── Response shape (from API_CONTRACT.md §13) ────────────────────────────
 * {
 *   totalStudents:           number
 *   placementReadyCount:     number
 *   placementReadyPercentage:number
 *   averageReadinessScore:   number
 *   activeJobMatches:        number
 *   departmentBreakdown: [
 *     { department: string, students: number, avgReadiness: number }
 *   ]
 *   topSkillGaps: [
 *     { skillName: string, affectedPercentage: number }
 *   ]
 *   readinessDistribution: {
 *     ready90Plus: number   (% of students)
 *     ready75To89: number
 *     ready60To74: number
 *     below60:     number
 *   }
 * }
 *
 * NOTE — field-name discrepancy:
 *   The task brief used illustrative field names (studentCount, averageReadiness,
 *   skill, percentageLacking, etc.).  The authoritative source is API_CONTRACT.md,
 *   whose exact field names are used here.  If the backend ships different names,
 *   update the destructuring below — no structural changes needed.
 *
 * ─── Shared component status ──────────────────────────────────────────────
 * MetricCard        → src/components/common/MetricCard.jsx   EMPTY
 * ReadinessGauge    → src/components/charts/ReadinessGauge.jsx EMPTY
 * DepartmentBarChart→ src/components/charts/DepartmentBarChart.jsx EMPTY
 *
 * Local equivalents are defined below and clearly marked for extraction.
 * When the shared versions are delivered, swap the import and remove the
 * local definition — no changes to JSX usage needed.
 *
 * ─── Development fallback data ────────────────────────────────────────────
 * The backend is not yet implemented.  MOCK_DASHBOARD_DATA below matches
 * the API_CONTRACT.md §13 response exactly.  It is used ONLY when the API
 * call fails (network error / 404) and only in development mode.
 * Remove or gate it once the backend is live.
 * ──────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  TrendingUp,
  Award,
  BarChart2,
  Briefcase,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  appBg:       '#F5F5F7',
  surface:     '#FFFFFF',
  border:      '#E5E5EA',
  textPrimary: '#1D1D1F',
  textMuted:   '#6E6E73',
  blue:        '#1D1D1F',
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
  cobalt:      '#1D1D1F',
};

// ─── Readiness helpers ─────────────────────────────────────────────────────────
function readinessColor(score) {
  if (score >= 80) return { text: T.emeraldText, bg: T.emeraldBg, label: 'Placement Ready' };
  if (score >= 60) return { text: T.tealText,    bg: T.tealBg,    label: 'Placement Emerging' };
  return               { text: T.amberText,   bg: T.amberBg,   label: 'Building Foundation' };
}

// ─── DEVELOPMENT FALLBACK DATA ──────────────────────────────────────────────────
// Matches docs/API_CONTRACT.md §13 exactly.
// Used only when the API call fails (backend not yet implemented).
// REMOVE or gate behind import.meta.env.DEV once backend is live.
const MOCK_DASHBOARD_DATA = {
  totalStudents: 1248,
  placementReadyCount: 786,
  placementReadyPercentage: 63,
  averageReadinessScore: 71,
  activeJobMatches: 482,
  departmentBreakdown: [
    { department: 'CSE', students: 450, avgReadiness: 76 },
    { department: 'ECE', students: 380, avgReadiness: 68 },
    { department: 'IT',  students: 418, avgReadiness: 72 },
  ],
  topSkillGaps: [
    { skillName: 'DSA',            affectedPercentage: 42 },
    { skillName: 'System Design',  affectedPercentage: 37 },
    { skillName: 'Cloud',          affectedPercentage: 31 },
    { skillName: 'Communication',  affectedPercentage: 28 },
  ],
  readinessDistribution: {
    ready90Plus: 15,
    ready75To89: 48,
    ready60To74: 25,
    below60:     12,
  },
};

// ─── Local KPI Card ────────────────────────────────────────────────────────────
// Extract to src/components/common/MetricCard.jsx when that file is implemented.
// Usage is identical to what MetricCard will expect.
function KpiCard({ icon: Icon, iconColor, iconBg, label, value, sub, trend }) {
  return (
    <article
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}
          aria-hidden="true"
        >
          <Icon size={20} style={{ color: iconColor }} strokeWidth={1.75} />
        </div>
        {trend !== undefined && (
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: trend >= 0 ? T.emeraldBg : T.redBg,
              color: trend >= 0 ? T.emeraldText : T.redText,
            }}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p
          className="text-xs font-medium uppercase tracking-wider mb-1"
          style={{ color: T.textMuted, letterSpacing: '0.06em' }}
        >
          {label}
        </p>
        <p
          className="font-extrabold leading-none"
          style={{
            color: T.textPrimary,
            fontSize: '2.25rem',  /* 36px — Metric Hero from DESIGN.md */
            letterSpacing: '-0.03em',
            fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif',
          }}
        >
          {value}
        </p>
        {sub && (
          <p
            className="text-xs mt-1.5"
            style={{ color: T.textMuted }}
          >
            {sub}
          </p>
        )}
      </div>
    </article>
  );
}

// ─── Readiness Badge ───────────────────────────────────────────────────────────
function ReadinessBadge({ score }) {
  const { text, bg, label } = readinessColor(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ backgroundColor: bg, color: text }}
      title={label}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ backgroundColor: text }}
        aria-hidden="true"
      />
      {score}%
    </span>
  );
}

// ─── Local Horizontal Bar ─────────────────────────────────────────────────────
// Used for skill gaps and readiness distribution.
// Extract to a shared component when charts/ is ready.
function HBar({ value, max, color, label, sub, right }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs" style={{ color: T.textMuted }}>
        <span style={{ color: T.textPrimary, fontWeight: 500 }}>{label}</span>
        <span>{right ?? `${value}%`}</span>
      </div>
      {sub && (
        <p className="text-xs" style={{ color: T.textMuted }}>{sub}</p>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: '6px', backgroundColor: T.border }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Section Heading ───────────────────────────────────────────────────────────
function SectionHeading({ title, description }) {
  return (
    <div className="mb-5">
      <h2
        className="font-semibold"
        style={{
          fontSize: '1.25rem',    /* 20px H2 */
          color: T.textPrimary,
          letterSpacing: '-0.01em',
          fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif',
        }}
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function DashboardSkeleton() {
  const pulse = {
    backgroundColor: T.border,
    borderRadius: '6px',
  };
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard…">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
          >
            <div className="animate-pulse w-10 h-10 rounded-lg" style={pulse} />
            <div className="space-y-2">
              <div className="animate-pulse h-3 w-20 rounded" style={pulse} />
              <div className="animate-pulse h-9 w-24 rounded" style={pulse} />
            </div>
          </div>
        ))}
      </div>
      {/* Body rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
          >
            <div className="animate-pulse h-5 w-40 rounded" style={pulse} />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="animate-pulse h-10 w-full rounded" style={pulse} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────────
function DashboardError({ error, onRetry }) {
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
          Failed to load dashboard
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
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#000000'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.blue; }}
      >
        <RefreshCw size={15} aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function DashboardEmpty() {
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
        <Users size={24} style={{ color: '#177245' }} />
      </div>
      <div>
        <p className="font-semibold mb-1" style={{ color: T.textPrimary, fontSize: '1rem' }}>
          No data yet
        </p>
        <p className="text-sm" style={{ color: T.textMuted }}>
          Student data will appear here once your institution's students begin using CareerOS.
        </p>
      </div>
    </div>
  );
}

// ─── Department Breakdown Table ────────────────────────────────────────────────
function DepartmentTable({ departments }) {
  if (!departments?.length) {
    return (
      <p className="text-sm py-4 text-center" style={{ color: T.textMuted }}>
        No department data available.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm border-collapse" aria-label="Department breakdown">
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}` }}>
            {['Department', 'Students', 'Avg. Readiness'].map(col => (
              <th
                key={col}
                className="text-left py-2.5 px-3 font-medium first:pl-0"
                style={{ color: T.textMuted, fontSize: '0.75rem', letterSpacing: '0.04em' }}
              >
                {col.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map((dept, idx) => {
            const { text, bg } = readinessColor(dept.avgReadiness);
            const isEven = idx % 2 === 0;
            return (
              <tr
                key={dept.department}
                style={{
                  borderBottom: `1px solid ${T.border}`,
                  /* Zebra striping — 5% contrast as per DESIGN.md §4.3 */
                  backgroundColor: isEven ? 'transparent' : 'rgba(255,255,255,0.025)',
                }}
              >
                <td className="py-3 px-3 first:pl-0" style={{ color: T.textPrimary, fontWeight: 500 }}>
                  {dept.department}
                </td>
                <td className="py-3 px-3" style={{ color: T.textMuted }}>
                  {dept.students?.toLocaleString() ?? '—'}
                </td>
                <td className="py-3 px-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: bg, color: text }}
                  >
                    {dept.avgReadiness ?? '—'}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Readiness Distribution Visual ────────────────────────────────────────────
// HTML/CSS bar chart — no extra library required.
// Segments: ≥90 (Emerald), 75–89 (Teal), 60–74 (Blue), <60 (Amber)
function ReadinessDistribution({ distribution }) {
  if (!distribution) return null;

  const segments = [
    {
      key: 'ready90Plus',
      label: '≥ 90%',
      sub:   'Placement Ready',
      value: distribution.ready90Plus ?? 0,
      color: T.emerald,
      text:  T.emeraldText,
      bg:    T.emeraldBg,
    },
    {
      key: 'ready75To89',
      label: '75 – 89%',
      sub:   'Placement Ready',
      value: distribution.ready75To89 ?? 0,
      color: T.teal,
      text:  T.tealText,
      bg:    T.tealBg,
    },
    {
      key: 'ready60To74',
      label: '60 – 74%',
      sub:   'Placement Emerging',
      value: distribution.ready60To74 ?? 0,
      color: T.blue,
      text:  '#177245',
      bg:    'rgba(37,99,235,0.12)',
    },
    {
      key: 'below60',
      label: '< 60%',
      sub:   'Building Foundation',
      value: distribution.below60 ?? 0,
      color: T.amber,
      text:  T.amberText,
      bg:    T.amberBg,
    },
  ];

  const total = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <div className="space-y-5">
      {/* Stacked bar */}
      <div
        className="w-full flex rounded-full overflow-hidden"
        style={{ height: '10px', backgroundColor: T.border }}
        role="img"
        aria-label="Readiness distribution bar chart"
      >
        {segments.map(seg => (
          seg.value > 0 && (
            <div
              key={seg.key}
              style={{
                width: `${total > 0 ? (seg.value / total) * 100 : 0}%`,
                backgroundColor: seg.color,
                transition: 'width 0.5s ease',
              }}
              title={`${seg.label}: ${seg.value}%`}
            />
          )
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {segments.map(seg => (
          <div
            key={seg.key}
            className="rounded-lg p-3 flex flex-col gap-1"
            style={{ backgroundColor: seg.bg }}
          >
            <p
              className="text-xs font-semibold"
              style={{ color: seg.text }}
            >
              {seg.label}
            </p>
            <p
              className="font-extrabold"
              style={{ color: T.textPrimary, fontSize: '1.5rem', letterSpacing: '-0.02em' }}
            >
              {seg.value}%
            </p>
            <p className="text-xs" style={{ color: T.textMuted }}>
              {seg.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AdminDashboard — main component
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [state, setState] = useState({
    status: 'idle',   // 'idle' | 'loading' | 'success' | 'error'
    data:   null,
    error:  null,
    usingFallback: false,
  });

  const fetchDashboard = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'loading', error: null }));
    try {
      // client.js interceptor unwraps response.data, so we get { success, data }
      const response = await adminApi.getDashboard();
      const data = response?.data ?? response;
      setState({ status: 'success', data, error: null, usingFallback: false });
    } catch (err) {
      // Backend not yet implemented — use fallback in development only.
      // Remove this fallback block once backend is live.
      if (import.meta.env.DEV) {
        console.warn(
          '[AdminDashboard] API call failed — backend not yet implemented. ' +
          'Using MOCK_DASHBOARD_DATA from API_CONTRACT.md §13. ' +
          'Remove this fallback once the backend is live.',
          err,
        );
        setState({ status: 'success', data: MOCK_DASHBOARD_DATA, error: null, usingFallback: true });
      } else {
        setState({ status: 'error', data: null, error: err, usingFallback: false });
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Readiness score percentage → ring display helper
  const avgScore = state.data?.averageReadinessScore ?? 0;
  const { text: scoreColor, label: scoreLabel } = readinessColor(avgScore);

  // ── KPI cards config (derived from real data)
  const kpiCards = state.data
    ? [
        {
          icon:      Users,
          iconColor: '#177245',
          iconBg:    'rgba(37,99,235,0.12)',
          label:     'Total Students',
          value:     (state.data.totalStudents ?? 0).toLocaleString(),
          sub:       'enrolled in your institution',
        },
        {
          icon:      CheckCircle2,
          iconColor: T.emeraldText,
          iconBg:    T.emeraldBg,
          label:     'Placement Ready',
          value:     (state.data.placementReadyCount ?? 0).toLocaleString(),
          sub:       `${state.data.placementReadyPercentage ?? 0}% of total students`,
        },
        {
          icon:      TrendingUp,
          iconColor: T.tealText,
          iconBg:    T.tealBg,
          label:     'Avg. Readiness Score',
          value:     `${avgScore}%`,
          sub:       scoreLabel,
        },
        {
          icon:      Briefcase,
          iconColor: T.amberText,
          iconBg:    T.amberBg,
          label:     'Active Job Matches',
          value:     (state.data.activeJobMatches ?? 0).toLocaleString(),
          sub:       'across all students',
        },
      ]
    : [];

  // ── Max percentage for skill gap bar chart scaling
  const maxGapPct = state.data?.topSkillGaps?.length
    ? Math.max(...state.data.topSkillGaps.map(g => g.affectedPercentage ?? 0))
    : 100;

  return (
    <div
      className="space-y-8"
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
            Admin Dashboard
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: T.textMuted, maxWidth: '480px' }}
          >
            Placement readiness overview for your institution. All data is scoped to your organisation.
          </p>
        </div>

        {/* Fallback data warning badge — dev only */}
        {state.usingFallback && (
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
      {state.status === 'loading' && <DashboardSkeleton />}

      {/* ── Error ── */}
      {state.status === 'error' && (
        <DashboardError error={state.error} onRetry={fetchDashboard} />
      )}

      {/* ── Success ── */}
      {state.status === 'success' && state.data && (
        <>
          {state.data.totalStudents === 0 ? (
            <DashboardEmpty />
          ) : (
            <>
              {/* ── KPI Cards ── */}
              {/*
               * TODO: Replace KpiCard with <MetricCard /> from
               * src/components/common/MetricCard.jsx once it is implemented.
               * Props interface is designed to match what MetricCard will expect.
               */}
              <section aria-label="Key metrics">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {kpiCards.map(card => (
                    <KpiCard key={card.label} {...card} />
                  ))}
                </div>
              </section>

              {/* ── Body: 2-column grid on lg ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Department Breakdown ── */}
                <section
                  className="rounded-xl p-5"
                  style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
                  aria-label="Department breakdown"
                >
                  <SectionHeading
                    title="Department Breakdown"
                    description="Average readiness score by department"
                  />
                  {/*
                   * TODO: Replace with <DepartmentBarChart /> from
                   * src/components/charts/DepartmentBarChart.jsx once implemented.
                   */}
                  <DepartmentTable departments={state.data.departmentBreakdown} />
                </section>

                {/* ── Top Skill Gaps ── */}
                <section
                  className="rounded-xl p-5"
                  style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
                  aria-label="Top skill gaps"
                >
                  <SectionHeading
                    title="Top Skill Gaps"
                    description="Skills with the highest percentage of students lacking proficiency"
                  />
                  <div className="space-y-4">
                    {state.data.topSkillGaps?.length ? (
                      state.data.topSkillGaps.map((gap, idx) => {
                        // Colour the worst gap in amber, rest in teal
                        const barColor = idx === 0 ? T.amber : T.teal;
                        return (
                          <HBar
                            key={gap.skillName}
                            label={gap.skillName}
                            value={gap.affectedPercentage ?? 0}
                            max={maxGapPct}
                            color={barColor}
                            right={`${gap.affectedPercentage ?? 0}% affected`}
                          />
                        );
                      })
                    ) : (
                      <p className="text-sm py-4 text-center" style={{ color: T.textMuted }}>
                        No skill gap data available.
                      </p>
                    )}
                  </div>
                </section>

                {/* ── Readiness Distribution ── */}
                <section
                  className="rounded-xl p-5 lg:col-span-2"
                  style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
                  aria-label="Readiness distribution"
                >
                  <SectionHeading
                    title="Readiness Distribution"
                    description="Proportion of students at each readiness tier"
                  />
                  {/*
                   * TODO: Replace with shared chart component once
                   * src/components/charts/ is implemented.
                   */}
                  <ReadinessDistribution distribution={state.data.readinessDistribution} />
                </section>

              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
