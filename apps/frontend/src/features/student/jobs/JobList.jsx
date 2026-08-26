import React, { useState, useEffect, useCallback } from 'react';
import { Search, Briefcase, SlidersHorizontal, FileX, ChevronDown } from 'lucide-react';
import { studentApi } from '../../../api/student';
import api from '../../../api/client';
import JobCard, { MOCK_JOB } from './JobCard';

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  appBg:       '#F5F5F7',
  surface:     '#FFFFFF',
  border:      '#E5E5EA',
  textPrimary: '#1D1D1F',
  textMuted:   '#6E6E73',
  blue:        '#1D1D1F',
  blueHover:   '#000000',
  cobalt:      '#1D1D1F',
  emerald:     '#059669',
  emeraldBg:   'rgba(5,150,105,0.12)',
  emeraldText: '#059669',
  teal:        '#0D9488',
  tealBg:      'rgba(13,148,136,0.12)',
  tealText:    '#0D9488',
  amber:       '#D97706',
  amberBg:     'rgba(217,119,6,0.12)',
  amberText:   '#D97706',
  red:         '#DC2626',
  redBg:       'rgba(220,38,38,0.12)',
  redText:     '#DC2626',
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_JOBS = [
  MOCK_JOB,
  {
    _id: 'job_mock_002',
    title: 'Full Stack Developer',
    company: 'Zepto',
    location: 'Mumbai, India',
    jobType: 'FULL_TIME',
    salaryRange: { min: 1200000, max: 1800000, currency: 'INR' },
    matchScore: 71,
    matchedSkills: ['Node.js', 'React', 'MongoDB'],
    missingSkills: ['Redis', 'Kafka'],
    applicationDeadline: new Date(Date.now() + 15 * 86400000).toISOString(),
    applied: false,
  },
  {
    _id: 'job_mock_003',
    title: 'Backend Intern',
    company: 'CRED',
    location: 'Bengaluru, India (Remote)',
    jobType: 'INTERNSHIP',
    salaryRange: { min: 400000, max: 600000, currency: 'INR' },
    matchScore: 55,
    matchedSkills: ['Python', 'Django'],
    missingSkills: ['Docker', 'AWS', 'PostgreSQL'],
    applicationDeadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    applied: true,
  },
];

const MOCK_APPLICATIONS = [
  {
    _id: 'app_001',
    job: { title: 'Backend Intern', company: 'CRED' },
    appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'APPLIED',
  },
  {
    _id: 'app_002',
    job: { title: 'React Developer', company: 'PhonePe' },
    appliedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    status: 'SHORTLISTED',
  },
  {
    _id: 'app_003',
    job: { title: 'Data Analyst Intern', company: 'Swiggy' },
    appliedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    status: 'REJECTED',
  },
  {
    _id: 'app_004',
    job: { title: 'Systems Engineer', company: 'Infosys' },
    appliedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    status: 'OFFERED',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const APPLICATION_STATUS = {
  APPLIED:     { label: 'Applied',     bg: 'rgba(37,99,235,0.15)',  text: '#60A5FA' },
  SHORTLISTED: { label: 'Shortlisted', bg: 'rgba(5,150,105,0.12)',  text: T.emeraldText },
  REJECTED:    { label: 'Rejected',    bg: 'rgba(220,38,38,0.12)',  text: T.redText },
  OFFERED:     { label: 'Offered',     bg: 'rgba(13,148,136,0.12)', text: T.tealText },
};

const JOB_TYPE_OPTIONS = [
  { value: '',           label: 'All Types' },
  { value: 'FULL_TIME',  label: 'Full Time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'CONTRACT',   label: 'Contract' },
];

const MATCH_SCORE_OPTIONS = [
  { value: '',   label: 'Any Match' },
  { value: '60', label: '60%+' },
  { value: '75', label: '75%+' },
  { value: '90', label: '90%+' },
];

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  const pulse = {
    background: T.border,
    borderRadius: 6,
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <div style={{ ...pulse, height: 20, width: '45%' }} />
              <div style={{ ...pulse, height: 14, width: '25%' }} />
            </div>
            <div style={{ ...pulse, height: 52, width: 72, borderRadius: 8 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ ...pulse, height: 24, width: 120, borderRadius: 20 }} />
            <div style={{ ...pulse, height: 24, width: 90,  borderRadius: 20 }} />
            <div style={{ ...pulse, height: 24, width: 110, borderRadius: 20 }} />
          </div>
          <div style={{ ...pulse, height: 6, width: '100%', borderRadius: 99 }} />
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: '56px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <FileX size={40} color={T.textMuted} />
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: T.textPrimary }}>
        No jobs found
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: T.textMuted, maxWidth: 360 }}>
        No job listings match your current filters. Try adjusting your search criteria or minimum match score.
      </p>
      <button
        onClick={onClear}
        style={{
          marginTop: 8,
          background: T.blue,
          color: '#fff',
          padding: '9px 20px',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        Clear Filters
      </button>
    </div>
  );
}

// ─── Applications Table ───────────────────────────────────────────────────────
function ApplicationsTable({ applications, loading }) {
  const pulse = { background: T.border, borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' };

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 32,
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Briefcase size={18} color={T.blue} />
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.textPrimary }}>
          My Applications
        </h2>
      </div>

      {loading ? (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', gap: 16 }}>
              <div style={{ ...pulse, height: 16, flex: 3 }} />
              <div style={{ ...pulse, height: 16, flex: 2 }} />
              <div style={{ ...pulse, height: 16, flex: 2 }} />
              <div style={{ ...pulse, height: 16, flex: 1 }} />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: T.textMuted, fontSize: 14 }}>
          You haven't applied to any jobs yet. Start applying above!
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F5F5F7' }}>
                {['Job Title', 'Company', 'Applied Date', 'Status'].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 20px',
                      textAlign: 'left',
                      color: T.textMuted,
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: `1px solid ${T.border}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => {
                const statusCfg = APPLICATION_STATUS[app.status] || APPLICATION_STATUS.APPLIED;
                return (
                  <tr
                    key={app._id}
                    style={{
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(37,99,235,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)'; }}
                  >
                    <td style={{ padding: '12px 20px', color: T.textPrimary, fontWeight: 500 }}>
                      {app.job?.title || '—'}
                    </td>
                    <td style={{ padding: '12px 20px', color: T.textMuted }}>
                      {app.job?.company || '—'}
                    </td>
                    <td style={{ padding: '12px 20px', color: T.textMuted }}>
                      {formatDate(app.appliedAt)}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          background: statusCfg.bg,
                          color: statusCfg.text,
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {statusCfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── JobList ──────────────────────────────────────────────────────────────────
export default function JobList() {
  const [jobs, setJobs]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [applications, setApplications]     = useState([]);
  const [appsLoading, setAppsLoading]       = useState(true);
  const [applyingId, setApplyingId]         = useState(null); // jobId currently being applied

  // Filter state
  const [search, setSearch]           = useState('');
  const [jobType, setJobType]         = useState('');
  const [minMatchScore, setMinMatchScore] = useState('');

  // ── Fetch jobs ──────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getJobs(params);
      // Normalise: API may return { data: [...] } or plain array
      const list = Array.isArray(res) ? res : (res.data ?? res.jobs ?? []);
      setJobs(list);
    } catch (err) {
      console.warn('Jobs API unavailable, using mock data:', err);
      setJobs(MOCK_JOBS);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch my applications ───────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    try {
      setAppsLoading(true);
      const res = await api.get('/jobs/applications/me');
      const list = Array.isArray(res) ? res : (res.data ?? res.applications ?? []);
      setApplications(list);
    } catch (err) {
      console.warn('Applications API unavailable, using mock data:', err);
      setApplications(MOCK_APPLICATIONS);
    } finally {
      setAppsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [fetchJobs, fetchApplications]);

  // ── Search handler ──────────────────────────────────────────────────────
  const handleSearch = () => {
    const params = {};
    if (search.trim())    params.search       = search.trim();
    if (jobType)          params.jobType      = jobType;
    if (minMatchScore)    params.minMatchScore = Number(minMatchScore);
    fetchJobs(params);
  };

  const handleClearFilters = () => {
    setSearch('');
    setJobType('');
    setMinMatchScore('');
    fetchJobs();
  };

  // ── Apply handler ───────────────────────────────────────────────────────
  const handleApply = useCallback(async (jobId) => {
    if (applyingId) return;
    setApplyingId(jobId);
    try {
      await studentApi.applyJob(jobId);
      // Mark as applied locally
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, applied: true } : j))
      );
      // Refresh applications
      fetchApplications();
    } catch (err) {
      console.error('Apply failed:', err);
    } finally {
      setApplyingId(null);
    }
  }, [applyingId, fetchApplications]);

  // ── Input styles ────────────────────────────────────────────────────────
  const inputStyle = {
    background: T.appBg,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '9px 14px',
    color: T.textPrimary,
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    paddingRight: 36,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: T.appBg, minHeight: '100vh' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        ::placeholder { color: #6B7280; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 40px' }}>

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Briefcase size={26} color={T.blue} />
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                color: T.textPrimary,
                letterSpacing: '-0.02em',
              }}
            >
              Job Opportunities
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: T.textMuted }}>
            {loading
              ? 'Loading available positions…'
              : `${jobs.length} active position${jobs.length !== 1 ? 's' : ''} matched to your profile`}
          </p>
        </div>

        {/* ── Filter Bar ────────────────────────────────────────────────── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          {/* Search input */}
          <div style={{ flex: '2 1 200px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>
              Search
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                color={T.textMuted}
                style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Job title or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                style={{ ...inputStyle, paddingLeft: 36 }}
              />
            </div>
          </div>

          {/* Job type dropdown */}
          <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>
              Job Type
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              style={selectStyle}
            >
              {JOB_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: T.surface }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Min match score dropdown */}
          <div style={{ flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>
              Min Match
            </label>
            <select
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(e.target.value)}
              style={selectStyle}
            >
              {MATCH_SCORE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: T.surface }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search button */}
          <div style={{ flex: '0 0 auto' }}>
            <button
              onClick={handleSearch}
              style={{
                background: T.blue,
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                transition: 'background 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.blueHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = T.blue; }}
            >
              <Search size={15} />
              Search
            </button>
          </div>
        </div>

        {/* ── Jobs List ─────────────────────────────────────────────────── */}
        {loading ? (
          <LoadingSkeleton />
        ) : jobs.length === 0 ? (
          <EmptyState onClear={handleClearFilters} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={handleApply}
                applying={applyingId === job._id}
              />
            ))}
          </div>
        )}

        {/* ── My Applications ───────────────────────────────────────────── */}
        <ApplicationsTable applications={applications} loading={appsLoading} />
      </div>
    </div>
  );
}
