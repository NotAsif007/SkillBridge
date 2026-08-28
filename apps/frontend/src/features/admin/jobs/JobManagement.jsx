import React, { useState, useEffect } from 'react';
import { studentApi } from '../../../api/student';
import {
  MapPin,
  DollarSign,
  Plus,
  Users,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        const res = await studentApi.getJobs();
        if (res.success && res.data) {
          setJobs(res.data);
        }
      } catch (err) {
        console.warn('Jobs fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const surface     = isDark ? '#151720' : '#FFFFFF';
  const border      = isDark ? '#1E2130' : '#E5E5EA';
  const textPrimary = isDark ? '#F3F4F6' : '#1D1D1F';
  const textMuted   = isDark ? '#9CA3AF' : '#6E6E73';
  const btnBg       = isDark ? '#F59E0B' : '#1D1D1F';
  const btnColor    = isDark ? '#0F1015' : '#FFFFFF';
  const btnHover    = isDark ? '#FBBF24' : '#000000';

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans" style={{ color: textPrimary }}>
      {/* ── Header ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: textPrimary }}>
            Campus Recruitment &amp; Job Drives
          </h1>
          <p className="text-xs mt-1" style={{ color: textMuted }}>
            Active placement drives, company postings, and candidate eligibility criteria
          </p>
        </div>

        {/* CTA button — theme-aware */}
        <button
          className="px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors btn-lift"
          style={{ backgroundColor: btnBg, color: btnColor }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = btnHover; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = btnBg; }}
        >
          <Plus className="w-4 h-4" />
          <span>Post New Campus Drive</span>
        </button>
      </div>

      {/* ── Job Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs.map((job) => (
          <div
            key={job._id || job.id}
            className="p-5 rounded-xl space-y-4 card-hover"
            style={{ backgroundColor: surface, border: `1px solid ${border}` }}
          >
            {/* Job title + company + status badge */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base" style={{ color: textPrimary }}>{job.title}</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">{job.company}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex-shrink-0">
                Active Drive
              </span>
            </div>

            {/* Description */}
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: textMuted }}>
              {job.description}
            </p>

            {/* Meta row */}
            <div
              className="flex flex-wrap items-center gap-3 text-xs pt-2"
              style={{ color: textMuted, borderTop: `1px solid ${border}` }}
            >
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" style={{ color: textMuted }} />
                <span>{job.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5" style={{ color: textMuted }} />
                <span>₹{job.salaryRange?.min / 100000 || 12} - {job.salaryRange?.max / 100000 || 18} LPA</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5" style={{ color: textMuted }} />
                <span>Min CGPA: {job.eligibilityCriteria?.minCgpa || 7.5}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}