import React, { useState, useEffect } from 'react';
import { studentApi } from '../../../api/student';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  Users,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#1D1D1F] font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5EA] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Campus Recruitment & Job Drives</h1>
          <p className="text-xs text-[#6E6E73] mt-1">
            Active placement drives, company postings, and candidate eligibility criteria
          </p>
        </div>

        <button className="px-3.5 py-2 rounded-lg bg-[#1D1D1F] hover:bg-black text-xs font-bold text-white flex items-center space-x-1.5 shadow-sm shadow-emerald-100 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Post New Campus Drive</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs.map((job) => (
          <div
            key={job._id || job.id}
            className="p-5 rounded-xl bg-[#111827] border border-[#E5E5EA] shadow-sm space-y-4 hover:border-[#E5E5EA] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-[#1D1D1F]">{job.title}</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">{job.company}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                Active Drive
              </span>
            </div>

            <p className="text-xs text-[#6E6E73] leading-relaxed line-clamp-2">
              {job.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#6E6E73] pt-2 border-t border-[#E5E5EA]">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#6E6E73]" />
                <span>{job.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-[#6E6E73]" />
                <span>₹{job.salaryRange?.min / 100000 || 12} - {job.salaryRange?.max / 100000 || 18} LPA</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#6E6E73]" />
                <span>Min CGPA: {job.eligibilityCriteria?.minCgpa || 7.5}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}