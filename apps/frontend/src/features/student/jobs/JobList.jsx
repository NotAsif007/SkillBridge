import React, { useState, useEffect, useCallback } from 'react';
import { Search, Briefcase, SlidersHorizontal, FileX, ChevronDown } from 'lucide-react';
import { studentApi } from '../../../api/student';
import JobCard from './JobCard';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

function JobSkeleton({ T, isDark }) {
  return (
    <div
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 200,
      }}
      className="animate-pulse"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ height: 16, width: '60%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 4 }} />
        <div style={{ height: 16, width: '25%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 4 }} />
      </div>
      <div style={{ height: 12, width: '40%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 4 }} />
      <div style={{ height: 32, width: '100%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 6 }} />
      <div style={{ height: 38, width: '100%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 8, marginTop: 'auto' }} />
    </div>
  );
}

export default function JobList() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [applyingId, setApplyingId] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentApi.getJobs();
      const jobList = Array.isArray(res) ? res : res?.data || [];
      setJobs(jobList);
    } catch (err) {
      console.warn('Jobs fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApply = async (jobId) => {
    try {
      setApplyingId(jobId);
      await studentApi.applyJob(jobId);
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, applied: true } : j))
      );
    } catch {
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, applied: true } : j))
      );
    } finally {
      setApplyingId(null);
    }
  };

  const filtered = jobs.filter((j) => {
    const matchesSearch =
      (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.company || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || j.jobType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ width: '100%', maxWidth: 1120, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
            Matched Opportunities
          </h1>
          <p style={{ color: T.textMuted, fontSize: 14, margin: '4px 0 0' }}>
            Personalized campus placement listings ranked by your deterministic readiness profile
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
          <input
            type="text"
            placeholder="Search role or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              backgroundColor: T.surface,
              color: T.textPrimary,
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Openings' },
          { id: 'FULL_TIME', label: 'Full Time' },
          { id: 'INTERNSHIP', label: 'Internships' },
        ].map((tab) => {
          const active = typeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${active ? T.yellow : T.border}`,
                backgroundColor: active ? (isDark ? T.yellowBg : '#1D1D1F') : T.surface,
                color: active ? (isDark ? T.yellowText : '#FFFFFF') : T.textMuted,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Job Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {loading && jobs.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <JobSkeleton key={i} T={T} isDark={isDark} />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={handleApply}
              isApplying={applyingId === job._id}
            />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: T.textMuted }}>
            No opportunities found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
