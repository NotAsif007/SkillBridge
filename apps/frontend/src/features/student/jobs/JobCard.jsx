import React from 'react';
import { MapPin, Briefcase, CheckCircle, PlusCircle, Clock } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

function formatLakh(amount) {
  const lakhs = amount / 100000;
  return `${lakhs.toFixed(1)}L`;
}

const JOB_TYPE_LABELS = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const MOCK_JOB = {
  _id: 'job_mock_001',
  title: 'Junior React Engineer',
  company: 'Swiggy',
  location: 'Bengaluru, India (Hybrid)',
  jobType: 'FULL_TIME',
  salaryRange: { min: 800000, max: 1400000, currency: 'INR' },
  matchScore: 84,
  matchedSkills: ['JavaScript', 'React', 'HTML/CSS'],
  missingSkills: ['TypeScript', 'Jest'],
  applicationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
  applied: false,
};

export default function JobCard({
  job = MOCK_JOB,
  onApply,
  isApplying = false,
  applied = false,
}) {
  const { isDark } = useTheme();
  const T = getTokens(isDark);

  const {
    _id,
    title,
    company,
    location,
    jobType = 'FULL_TIME',
    salaryRange,
    matchScore = 0,
    matchedSkills = [],
    missingSkills = [],
    applicationDeadline,
  } = job;

  const isApplied = applied || job.applied;
  const matchColor = matchScore >= 80 ? T.emerald : matchScore >= 60 ? T.teal : T.yellow;
  const matchBg = matchScore >= 80 ? T.emeraldBg : matchScore >= 60 ? T.tealBg : T.yellowBg;
  const matchText = matchScore >= 80 ? T.emeraldText : matchScore >= 60 ? T.tealText : T.yellowText;

  let salaryString = null;
  if (salaryRange && salaryRange.min != null && salaryRange.max != null) {
    salaryString = `₹${formatLakh(salaryRange.min)} – ₹${formatLakh(salaryRange.max)}`;
  }

  return (
    <div
      className="card-hover"
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 750, color: T.textPrimary, margin: 0 }}>
            {title}
          </h3>
          <p style={{ fontSize: 13, color: T.textMuted, margin: '3px 0 0' }}>
            {company} · {location}
          </p>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 750,
            color: T.indigoText,
            backgroundColor: T.indigoBg,
            border: `1px solid ${T.indigoBorder}`,
            padding: '3px 9px',
            borderRadius: 6,
          }}
        >
          {JOB_TYPE_LABELS[jobType] || jobType}
        </span>
      </div>

      {/* Match Score Indicator */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: matchBg,
          border: `1px solid ${matchColor}35`,
          borderRadius: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: matchText }}>
            Profile Match Score
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: matchText }}>
            {matchScore}%
          </span>
        </div>
        <div style={{ width: '100%', height: 5, backgroundColor: T.border, borderRadius: 9999, overflow: 'hidden', marginTop: 8 }}>
          <div style={{ width: `${matchScore}%`, height: '100%', backgroundColor: matchColor, borderRadius: 9999 }} />
        </div>
      </div>

      {/* Skills breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {matchedSkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Matched:</span>
            {matchedSkills.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 11,
                  fontWeight: 650,
                  color: T.emeraldText,
                  backgroundColor: T.emeraldBg,
                  border: `1px solid ${T.emeraldBorder}`,
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                ✓ {s}
              </span>
            ))}
          </div>
        )}

        {missingSkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Missing:</span>
            {missingSkills.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 11,
                  fontWeight: 650,
                  color: T.yellowText,
                  backgroundColor: T.yellowBg,
                  border: `1px solid ${T.yellowBorder}`,
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                + {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer & Apply Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 12, color: T.textMuted }}>
          {salaryString ? (
            <span>Package: <strong style={{ color: T.textPrimary }}>{salaryString}</strong></span>
          ) : (
            <span>Deadline: {formatDate(applicationDeadline)}</span>
          )}
        </div>

        <button
          onClick={() => onApply && onApply(_id)}
          disabled={isApplied || isApplying}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: isApplied ? T.emeraldBg : T.buttonPrimaryBg,
            color: isApplied ? T.emeraldText : T.buttonPrimaryText,
            fontWeight: 750,
            fontSize: 13,
            cursor: isApplied ? 'default' : 'pointer',
          }}
        >
          {isApplied ? (
            <><CheckCircle size={14} /> Applied</>
          ) : isApplying ? (
            'Submitting…'
          ) : (
            'Apply Now'
          )}
        </button>
      </div>
    </div>
  );
}
