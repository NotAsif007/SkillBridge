import React from 'react';
import { MapPin, Briefcase, CheckCircle, PlusCircle, Clock } from 'lucide-react';

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  appBg:       '#0B0F17',
  surface:     '#111827',
  border:      '#1F2937',
  textPrimary: '#F9FAFB',
  textMuted:   '#9CA3AF',
  blue:        '#2563EB',
  blueHover:   '#1D4ED8',
  cobalt:      '#1E3A8A',
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
  grey:        '#374151',
  greyText:    '#6B7280',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readinessColor(score) {
  if (score >= 80) return { text: T.emeraldText, bg: T.emeraldBg, label: 'Strong Match' };
  if (score >= 60) return { text: T.tealText,    bg: T.tealBg,    label: 'Good Match' };
  return               { text: T.amberText,   bg: T.amberBg,   label: 'Partial Match' };
}

/**
 * Format INR amount (absolute rupees) to compact lakh string.
 * e.g. 1000000 → '10.0L'
 */
function formatLakh(amount) {
  const lakhs = amount / 100000;
  return `${lakhs.toFixed(1)}L`;
}

const JOB_TYPE_LABELS = {
  FULL_TIME:  'Full Time',
  PART_TIME:  'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT:   'Contract',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Chip({ children, chipStyle }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        ...chipStyle,
      }}
    >
      {children}
    </span>
  );
}

function MatchProgressBar({ score, color }) {
  return (
    <div
      style={{
        width: '100%',
        height: 6,
        background: T.border,
        borderRadius: 99,
        overflow: 'hidden',
        marginTop: 12,
      }}
    >
      <div
        style={{
          width: `${Math.min(score, 100)}%`,
          height: '100%',
          background: color,
          borderRadius: 99,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

// ─── JobCard ──────────────────────────────────────────────────────────────────
/**
 * JobCard — pure presentational component.
 *
 * Props:
 *   job      {object}   — full job object from API
 *   onApply  {function} — called with (jobId) when Apply is clicked
 *   applying {boolean}  — true while the apply request is in-flight for this job
 */
export default function JobCard({ job, onApply, applying }) {
  const {
    _id,
    title,
    company,
    location,
    jobType,
    salaryRange,
    matchScore,
    matchedSkills = [],
    missingSkills = [],
    applicationDeadline,
    applied = false,
  } = job;

  const match     = readinessColor(matchScore);
  const typeLabel = JOB_TYPE_LABELS[jobType] || jobType;

  const daysLeft = applicationDeadline
    ? Math.ceil((new Date(applicationDeadline) - Date.now()) / 86400000)
    : null;
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;

  const totalRequired = matchedSkills.length + missingSkills.length;

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Row 1: Title + Company + Match Badge ─────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: T.textPrimary,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 14, color: T.textMuted, fontWeight: 500 }}>
            {company}
          </p>
        </div>

        <div
          style={{
            flexShrink: 0,
            background: match.bg,
            borderRadius: 8,
            padding: '6px 12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: match.text, lineHeight: 1 }}>
            {matchScore}%
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: match.text, marginTop: 2, whiteSpace: 'nowrap' }}>
            {match.label}
          </div>
        </div>
      </div>

      {/* ── Row 2: Chips — Location, Type, Deadline ──────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <Chip chipStyle={{ background: 'rgba(31,41,55,0.8)', color: T.textMuted, border: `1px solid ${T.border}` }}>
          <MapPin size={11} />
          {location}
        </Chip>

        <Chip chipStyle={{ background: 'rgba(30,58,138,0.2)', color: '#93C5FD', border: '1px solid rgba(30,64,175,0.3)' }}>
          <Briefcase size={11} />
          {typeLabel}
        </Chip>

        {applicationDeadline && (
          <Chip
            chipStyle={{
              background: isUrgent ? T.redBg : T.amberBg,
              color: isUrgent ? T.redText : T.amberText,
              border: `1px solid ${isUrgent ? 'rgba(220,38,38,0.3)' : 'rgba(217,119,6,0.3)'}`,
            }}
          >
            <Clock size={11} />
            {isUrgent
              ? daysLeft === 0
                ? 'Last day!'
                : `${daysLeft}d left`
              : `Apply by ${formatDate(applicationDeadline)}`}
          </Chip>
        )}
      </div>

      {/* ── Salary ───────────────────────────────────────────────────────── */}
      {salaryRange && (
        <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: T.textPrimary }}>
          <span style={{ color: T.textMuted, fontWeight: 400, fontSize: 12, marginRight: 4 }}>Salary</span>
          ₹{formatLakh(salaryRange.min)} – ₹{formatLakh(salaryRange.max)}
          <span style={{ color: T.textMuted, fontWeight: 400, fontSize: 12, marginLeft: 4 }}>/ year</span>
        </div>
      )}

      {/* ── Matched Skills ───────────────────────────────────────────────── */}
      {matchedSkills.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: T.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
            }}
          >
            Matched Skills
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {matchedSkills.map((skill) => {
              const key  = typeof skill === 'string' ? skill : (skill._id || skill.name);
              const name = typeof skill === 'string' ? skill : skill.name;
              return (
                <Chip
                  key={key}
                  chipStyle={{
                    background: T.emeraldBg,
                    color: T.emeraldText,
                    border: 'rgba(5,150,105,0.25) 1px solid',
                  }}
                >
                  <CheckCircle size={11} />
                  {name}
                </Chip>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Missing Skills ───────────────────────────────────────────────── */}
      {missingSkills.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: T.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
            }}
          >
            Skills to Add
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {missingSkills.map((skill) => {
              const key  = typeof skill === 'string' ? skill : (skill._id || skill.name);
              const name = typeof skill === 'string' ? skill : skill.name;
              return (
                <Chip
                  key={key}
                  chipStyle={{
                    background: T.amberBg,
                    color: T.amberText,
                    border: 'rgba(217,119,6,0.25) 1px solid',
                  }}
                >
                  <PlusCircle size={11} />
                  {name}
                </Chip>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Match Progress Bar ───────────────────────────────────────────── */}
      <MatchProgressBar score={matchScore} color={match.text} />

      {/* ── Footer: skill count + Apply button ──────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 14,
          paddingTop: 14,
          borderTop: `1px solid ${T.border}`,
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, color: T.textMuted }}>
          {totalRequired > 0
            ? `${matchedSkills.length} of ${totalRequired} required skills matched`
            : 'All required skills matched'}
        </span>

        {applied ? (
          <button
            disabled
            style={{
              background: T.grey,
              color: T.greyText,
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              cursor: 'not-allowed',
              fontWeight: 600,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <CheckCircle size={14} />
            Applied ✓
          </button>
        ) : applying ? (
          <button
            disabled
            style={{
              background: T.cobalt,
              color: '#93C5FD',
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              cursor: 'wait',
              fontWeight: 600,
              fontSize: 13,
              flexShrink: 0,
              opacity: 0.85,
            }}
          >
            Applying…
          </button>
        ) : (
          <button
            onClick={() => onApply && onApply(_id)}
            style={{
              background: T.blue,
              color: '#fff',
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.blueHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = T.blue; }}
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MOCK_JOB — exported for use in JobList dev fallback ─────────────────────
export const MOCK_JOB = {
  _id: 'job_mock_001',
  title: 'Frontend Engineer',
  company: 'Razorpay',
  location: 'Bengaluru, India',
  jobType: 'FULL_TIME',
  salaryRange: { min: 1000000, max: 1400000, currency: 'INR' },
  matchScore: 82,
  matchedSkills: ['React', 'JavaScript', 'TypeScript', 'CSS'],
  missingSkills: ['GraphQL'],
  applicationDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
  applied: false,
};
