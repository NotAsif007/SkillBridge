/**
 * StudentDrawer.jsx
 *
 * Right-side slide-over drawer showing a single student's detail.
 * Opens from StudentList when a row is clicked.
 *
 * ─── Props ────────────────────────────────────────────────────────────────────
 * @prop {object|null}  student   - Student record from adminApi.getStudents().
 *                                  Shape (all fields from API_CONTRACT.md §13):
 *                                  { id, name, email, rollNumber, department,
 *                                    graduationYear, targetCareer,
 *                                    readinessScore, status }
 *                                  Also accepts optional extended fields when
 *                                  a future detail endpoint is added:
 *                                  { skillBreakdown, roadmap, assessmentHistory }
 * @prop {boolean}      open      - Whether the drawer is visible.
 * @prop {Function}     onClose   - Callback to close the drawer.
 *
 * ─── Data source ──────────────────────────────────────────────────────────────
 * NO new API call is made here.  All data comes from the student object that
 * StudentList already fetched from GET /api/v1/admin/students.
 *
 * Optional sections (skillBreakdown, roadmap, assessmentHistory) are not yet
 * in the roster API contract.  They are displayed as "Backend pending" placeholders
 * until a student-detail endpoint is added.
 *
 * ─── Behaviour ────────────────────────────────────────────────────────────────
 * • Right-side slide-over (transform-based, no JS portal needed).
 * • ESC key closes.
 * • Backdrop click closes.
 * • Mobile: full-width.  Desktop: 440px fixed.
 * • role="dialog", aria-modal, aria-label.
 *
 * ─── Shared components status ─────────────────────────────────────────────────
 * Progress.jsx  → EMPTY  — local ProgressBar used; TODO comment for swap
 * Badge.jsx     → EMPTY  — local inline badges used; TODO comment for swap
 *
 * ─── Integration in StudentList ───────────────────────────────────────────────
 * Uncomment in StudentList.jsx (lines 841-848):
 *
 *   import StudentDrawer from './StudentDrawer';
 *
 *   {selectedStudent && (
 *     <StudentDrawer
 *       student={selectedStudent}
 *       open={Boolean(selectedStudent)}
 *       onClose={() => setSelectedStudent(null)}
 *     />
 *   )}
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useCallback } from 'react';
import {
  X,
  User,
  Mail,
  Hash,
  Building2,
  GraduationCap,
  Briefcase,
  BookOpen,
  ClipboardList,
  FileText,
  Calendar,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

// ─── Design tokens (docs/DESIGN.md) — identical to AdminLayout / AdminDashboard
const T = {
  appBg:       '#0B0F17',
  surface:     '#111827',
  surfaceHigh: '#1A2235',   // slightly elevated surface for inner cards
  border:      '#1F2937',
  borderLight: '#2D3748',
  textPrimary: '#F9FAFB',
  textMuted:   '#9CA3AF',
  textFaint:   '#6B7280',
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
};

const DRAWER_WIDTH = '440px';

// ─── Readiness colour helper (DESIGN.md §4.1) ──────────────────────────────────
function readinessTheme(score) {
  if (score >= 80) return { color: T.emeraldText, bg: T.emeraldBg, bar: T.emerald, label: 'Placement Ready' };
  if (score >= 60) return { color: T.tealText,    bg: T.tealBg,    bar: T.teal,    label: 'Placement Emerging' };
  return               { color: T.amberText,   bg: T.amberBg,   bar: T.amber,   label: 'Building Foundation' };
}

// Status display map (matches API_CONTRACT.md §13 known values)
const STATUS_LABELS = {
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
};

// ─── Local: Readiness Badge ────────────────────────────────────────────────────
// TODO: Replace with <Badge /> from src/components/ui/Badge.jsx when implemented.
function ReadinessBadge({ score }) {
  const { color, bg, label } = readinessTheme(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ backgroundColor: bg, color }}
      title={label}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {score}%
    </span>
  );
}

// ─── Local: Progress Bar ───────────────────────────────────────────────────────
// TODO: Replace with <Progress /> from src/components/ui/Progress.jsx when implemented.
function ProgressBar({ value, color, label }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: T.textMuted }}>
        <span>{label}</span>
        <span style={{ color: T.textPrimary }}>{pct}%</span>
      </div>
      <div
        className="w-full rounded-full"
        style={{ height: '5px', backgroundColor: T.border }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
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

// ─── Local: Section heading ────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title }) {
  return (
    <div
      className="flex items-center gap-2.5 pb-3 mb-4"
      style={{ borderBottom: `1px solid ${T.border}` }}
    >
      {Icon && (
        <Icon
          size={15}
          style={{ color: T.textMuted, flexShrink: 0 }}
          aria-hidden="true"
        />
      )}
      <h3
        className="font-semibold text-sm"
        style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}
      >
        {title}
      </h3>
    </div>
  );
}

// ─── Local: Metadata row ──────────────────────────────────────────────────────
function MetaRow({ icon: Icon, label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">
        <Icon size={14} style={{ color: T.textFaint }} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: T.textMuted }}>{label}</p>
        <p className="text-sm mt-0.5 font-medium" style={{ color: T.textPrimary }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Local: Placeholder section ───────────────────────────────────────────────
function BackendPendingPlaceholder({ rows = 3 }) {
  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
        style={{ backgroundColor: T.amberBg, color: T.amberText, border: `1px solid ${T.amber}30` }}
        role="status"
      >
        <AlertTriangle size={13} aria-hidden="true" />
        Backend endpoint pending — placeholder data shown
      </div>
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg px-3 py-3"
          style={{ backgroundColor: T.surfaceHigh, border: `1px solid ${T.border}` }}
        >
          <div
            className="h-3 rounded animate-pulse mb-2"
            style={{ backgroundColor: T.border, width: `${55 + i * 15}%` }}
          />
          <div
            className="h-2.5 rounded animate-pulse"
            style={{ backgroundColor: T.border, width: `${30 + i * 10}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Local: Quick action button ───────────────────────────────────────────────
function ActionButton({ icon: Icon, label, disabled = true, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        backgroundColor: T.surfaceHigh,
        border: `1px solid ${T.border}`,
        color: T.textPrimary,
      }}
      onMouseEnter={e => {
        if (!disabled) e.currentTarget.style.borderColor = T.borderLight;
      }}
      onMouseLeave={e => {
        if (!disabled) e.currentTarget.style.borderColor = T.border;
      }}
    >
      {Icon && <Icon size={15} aria-hidden="true" style={{ color: T.textMuted }} />}
      <span>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// StudentDrawer — main component
// ═══════════════════════════════════════════════════════════════════════════════
export default function StudentDrawer({ student, open, onClose }) {
  // ── ESC to close ─────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && open) onClose();
    },
    [open, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Prevent body scroll when open ────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ── Nothing to show ───────────────────────────────────────────────────────
  if (!student) {
    return (
      <>
        {/* Backdrop — hidden */}
        <div
          aria-hidden="true"
          style={{ display: 'none' }}
        />
        {/* Panel — hidden */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Student detail"
          aria-hidden="true"
          style={{ display: 'none' }}
        />
      </>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const { color, bg, bar, label: readinessLabel } = readinessTheme(student.readinessScore ?? 0);

  // Optional extended fields — not yet in the roster API contract.
  // Will be populated once a student-detail endpoint is added.
  const skillBreakdown    = student.skillBreakdown    ?? null;
  const roadmap           = student.roadmap           ?? null;
  const assessmentHistory = student.assessmentHistory ?? null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0,0,0,0.55)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* ── Drawer panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Student detail — ${student.name}`}
        className="fixed top-0 right-0 z-50 h-full flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          width: '100%',
          maxWidth: DRAWER_WIDTH,
          backgroundColor: T.surface,
          borderLeft: `1px solid ${T.border}`,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          boxShadow: open ? '-8px 0 32px rgba(0,0,0,0.4)' : 'none',
          fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif',
        }}
      >

        {/* ══ Header bar ═══════════════════════════════════════════════════ */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <p
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: T.textMuted, letterSpacing: '0.08em' }}
          >
            Student Detail
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: T.textMuted }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = T.border;
              e.currentTarget.style.color = T.textPrimary;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = T.textMuted;
            }}
            aria-label="Close student detail"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ══ Scrollable body ══════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto" tabIndex={-1}>

          {/* ── §1 Student Header ── */}
          <section
            className="px-5 pt-5 pb-5"
            style={{ borderBottom: `1px solid ${T.border}` }}
            aria-label="Student identity"
          >
            {/* Avatar + name row */}
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar — initials fallback (no profileImage in roster API) */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-bold"
                style={{ backgroundColor: 'rgba(37,99,235,0.15)', color: '#93C5FD' }}
                aria-hidden="true"
              >
                {student.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>

              <div className="flex-1 min-w-0">
                <h2
                  className="font-semibold truncate"
                  style={{ fontSize: '1rem', color: T.textPrimary, letterSpacing: '-0.01em' }}
                >
                  {student.name}
                </h2>
                <p className="text-xs mt-0.5 truncate" style={{ color: T.textMuted }}>
                  {student.email}
                </p>
                <div className="mt-2">
                  <ReadinessBadge score={student.readinessScore ?? 0} />
                </div>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-1 gap-3">
              <MetaRow icon={Hash}          label="Roll Number"    value={student.rollNumber} />
              <MetaRow icon={Building2}     label="Department"     value={student.department} />
              <MetaRow icon={GraduationCap} label="Graduation Year" value={student.graduationYear?.toString()} />
              <MetaRow icon={Briefcase}     label="Target Career"  value={student.targetCareer} />
              <MetaRow icon={User}          label="Status"         value={STATUS_LABELS[student.status] ?? student.status} />
            </div>
          </section>

          {/* ── §2 Readiness Overview ── */}
          <section
            className="px-5 pt-5 pb-5"
            style={{ borderBottom: `1px solid ${T.border}` }}
            aria-label="Readiness overview"
          >
            <SectionHeading icon={BookOpen} title="Readiness Overview" />

            {/* Hero score */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: T.surfaceHigh, border: `1px solid ${T.border}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: T.textMuted, letterSpacing: '0.06em' }}>
                  Overall Score
                </p>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: bg, color }}
                >
                  {readinessLabel}
                </span>
              </div>

              <p
                className="font-extrabold leading-none mb-3"
                style={{ fontSize: '2.25rem', color, letterSpacing: '-0.03em' }}
                aria-label={`Overall readiness score ${student.readinessScore ?? 0} percent`}
              >
                {student.readinessScore ?? 0}%
              </p>

              {/* Overall readiness bar */}
              <ProgressBar
                value={student.readinessScore ?? 0}
                color={bar}
                label="Placement Readiness"
              />
            </div>

            {/*
             * Readiness breakdown bars.
             * These come from studentProfile.readinessScore.breakdown in the DB schema
             * (DATABASE.md §3.4), but are NOT yet exposed in the roster API response.
             * They will be provided once a student-detail endpoint is added.
             *
             * TODO (Person 1 / backend): Expose readinessScore.breakdown in the
             * student detail API. Swap the placeholder below with real data.
             */}
            {student.readinessBreakdown ? (
              <div className="space-y-3">
                <p className="text-xs font-medium" style={{ color: T.textMuted }}>Score Breakdown</p>
                {[
                  { key: 'technicalSkills',       label: 'Technical Skills' },
                  { key: 'assessmentPerformance', label: 'Assessments' },
                  { key: 'projects',              label: 'Projects' },
                  { key: 'interviewPerformance',  label: 'Interviews' },
                  { key: 'resume',                label: 'Resume' },
                  { key: 'roadmapProgress',       label: 'Roadmap' },
                ].map(({ key, label }) => (
                  <ProgressBar
                    key={key}
                    value={student.readinessBreakdown[key] ?? 0}
                    color={bar}
                    label={label}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs mt-2" style={{ color: T.textFaint }}>
                Detailed breakdown available once student-detail endpoint is live.
              </p>
            )}
          </section>

          {/* ── §3 Skill Breakdown ── */}
          <section
            className="px-5 pt-5 pb-5"
            style={{ borderBottom: `1px solid ${T.border}` }}
            aria-label="Skill breakdown"
          >
            <SectionHeading icon={BookOpen} title="Skill Breakdown" />
            {/*
             * TODO (Person 1 / backend): Add skills array to student detail endpoint.
             * Expected shape per DATABASE.md §3.4 studentProfiles.skills:
             *   { skillName, proficiencyLevel (1–5), verified, lastAssessedAt }
             * Also see DESIGN.md §4.2 for skill card visual spec.
             */}
            {skillBreakdown && skillBreakdown.length > 0 ? (
              <div className="space-y-2">
                {skillBreakdown.map((skill, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg px-3 py-3 flex items-center justify-between gap-3"
                    style={{ backgroundColor: T.surfaceHigh, border: `1px solid ${T.border}` }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: T.textPrimary }}>
                        {skill.skillName}
                      </p>
                      {skill.lastAssessedAt && (
                        <p className="text-xs mt-0.5" style={{ color: T.textFaint }}>
                          Last assessed {new Date(skill.lastAssessedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: skill.proficiencyLevel >= 4
                          ? T.emeraldBg
                          : skill.proficiencyLevel >= 3
                          ? T.tealBg
                          : T.amberBg,
                        color: skill.proficiencyLevel >= 4
                          ? T.emeraldText
                          : skill.proficiencyLevel >= 3
                          ? T.tealText
                          : T.amberText,
                      }}
                    >
                      L{skill.proficiencyLevel ?? 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <BackendPendingPlaceholder rows={3} />
            )}
          </section>

          {/* ── §4 Roadmap Progress ── */}
          <section
            className="px-5 pt-5 pb-5"
            style={{ borderBottom: `1px solid ${T.border}` }}
            aria-label="Roadmap progress"
          >
            <SectionHeading icon={Calendar} title="Roadmap Progress" />
            {/*
             * TODO (Person 1 / backend): Expose roadmap data in student detail endpoint.
             * Expected shape per DATABASE.md §3.10:
             *   { overallProgress, totalMilestones, completedMilestones,
             *     estimatedDurationWeeks, targetCareerId }
             */}
            {roadmap ? (
              <div className="space-y-4">
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: T.surfaceHigh, border: `1px solid ${T.border}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium" style={{ color: T.textPrimary }}>
                      Overall Progress
                    </p>
                    <span className="text-xs" style={{ color: T.textMuted }}>
                      {roadmap.completedMilestones ?? 0} / {roadmap.totalMilestones ?? 0} milestones
                    </span>
                  </div>
                  <ProgressBar
                    value={roadmap.overallProgress ?? 0}
                    color={T.blue}
                    label="Roadmap completion"
                  />
                  {roadmap.estimatedDurationWeeks && (
                    <p className="text-xs mt-3" style={{ color: T.textFaint }}>
                      Estimated duration: {roadmap.estimatedDurationWeeks} weeks
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <BackendPendingPlaceholder rows={2} />
            )}
          </section>

          {/* ── §5 Assessment History ── */}
          <section
            className="px-5 pt-5 pb-5"
            style={{ borderBottom: `1px solid ${T.border}` }}
            aria-label="Assessment history"
          >
            <SectionHeading icon={ClipboardList} title="Assessment History" />
            {/*
             * TODO (Person 1 / backend): Expose assessment attempts in student detail.
             * Expected shape per DATABASE.md §3.9 assessmentAttempts:
             *   { assessmentId, score, percentage, passed, completedAt, skillId }
             */}
            {assessmentHistory && assessmentHistory.length > 0 ? (
              <div className="space-y-2">
                {assessmentHistory.map((attempt, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg px-3 py-3 flex items-center justify-between gap-3"
                    style={{ backgroundColor: T.surfaceHigh, border: `1px solid ${T.border}` }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: T.textPrimary }}>
                        {attempt.title ?? `Assessment ${idx + 1}`}
                      </p>
                      {attempt.completedAt && (
                        <p className="text-xs mt-0.5" style={{ color: T.textFaint }}>
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs font-medium"
                        style={{ color: attempt.passed ? T.emeraldText : T.redText }}
                      >
                        {attempt.percentage ?? attempt.score ?? 0}%
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: attempt.passed ? T.emeraldBg : T.redBg,
                          color:           attempt.passed ? T.emeraldText : T.redText,
                        }}
                      >
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-6" style={{ color: T.textFaint }}>
                No assessment data available.
              </p>
            )}
          </section>

          {/* ── §6 Quick Actions ── */}
          <section
            className="px-5 pt-5 pb-6"
            aria-label="Quick actions"
          >
            <SectionHeading icon={ExternalLink} title="Quick Actions" />
            <div className="space-y-2.5">
              {/*
               * TODO: "View Full Profile" — wire to student profile route once
               * the student detail page is implemented by the student-frontend team.
               * Route will be something like /admin/students/:id
               */}
              <ActionButton
                icon={User}
                label="View Full Profile"
                disabled
              />

              {/*
               * TODO: "Download Resume" — requires a resume download endpoint.
               * Expected: GET /api/v1/students/:id/resume (Person 1 to define).
               * DATABASE.md §3.13 documents the resumes collection.
               */}
              <ActionButton
                icon={FileText}
                label="Download Resume"
                disabled
              />

              {/*
               * TODO: "Schedule Interview" — requires interview scheduling endpoint.
               * Expected: POST /api/v1/admin/interviews or similar (contract TBD).
               * DATABASE.md §3.14 documents the interviews collection.
               */}
              <ActionButton
                icon={Calendar}
                label="Schedule Interview"
                disabled
              />
            </div>
          </section>

        </div>
        {/* end scrollable body */}

      </div>
      {/* end drawer panel */}
    </>
  );
}
