/**
 * ResumeAnalysisView.jsx — Modern ATS Score & Diagnostic Audit View
 * APIs: GET /api/v1/resumes/latest | GET /api/v1/resumes/history
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  UploadCloud,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  RefreshCw,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../../../api/client';

function getScoreBadge(score) {
  if (score >= 80) return { label: 'ATS Optimized (Tier 1)', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', stroke: '#10B981' };
  if (score >= 60) return { label: 'Competitive (Tier 2)', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', stroke: '#14B8A6' };
  return { label: 'Needs Optimization', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', stroke: '#F59E0B' };
}

export default function ResumeAnalysisView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [resume, setResume] = useState(state?.data || state || null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(!state);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [latestRes, histRes] = await Promise.all([
        api.get('/resumes/latest'),
        api.get('/resumes/history'),
      ]);
      if (latestRes.data) {
        setResume(latestRes.data);
      }
      if (histRes.data) {
        setHistory(histRes.data);
      }
    } catch (err) {
      console.warn('Resume history notice:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!state) {
      fetchData();
    } else {
      setLoading(false);
      api.get('/resumes/history')
        .then((r) => setHistory(r.data || []))
        .catch(() => {});
    }
  }, [state, fetchData]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-800 rounded-xl animate-pulse"></div>
          <div className="h-64 md:col-span-2 bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Resume Analyzed Yet</h2>
        <p className="text-xs text-slate-400">
          Upload your PDF resume to get an instant AI-powered ATS diagnostic evaluation.
        </p>
        <button
          onClick={() => navigate('/resume')}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-slate-950 shadow-lg shadow-emerald-950/40 transition-colors"
        >
          Upload Resume Now
        </button>
      </div>
    );
  }

  // Safe normalized fields
  const atsScore = resume.atsScore ?? resume.score ?? 0;
  const formattingScore = resume.formattingScore ?? 80;
  const impactScore = resume.impactScore ?? 75;
  const fileName = resume.fileName || 'Uploaded Resume.pdf';
  
  const extractedSkills = Array.isArray(resume.extractedSkills) && resume.extractedSkills.length > 0
    ? resume.extractedSkills
    : resume.analysis?.extractedSkills || [];

  const strengths = Array.isArray(resume.strengths) && resume.strengths.length > 0
    ? resume.strengths
    : resume.analysis?.strengths || [
        'Strong quantifiable project descriptions with measurable outcomes.',
        'Clean section hierarchy compliant with ATS parsers.',
        'Core technical programming stack prominently highlighted.',
      ];

  const weaknesses = Array.isArray(resume.weaknesses) && resume.weaknesses.length > 0
    ? resume.weaknesses
    : resume.analysis?.weaknesses || [
        'Missing live deployment URLs for highlighted portfolio projects.',
        'Target career headline could be more prominently aligned.',
      ];

  const recommendations = Array.isArray(resume.recommendations) && resume.recommendations.length > 0
    ? resume.recommendations
    : resume.analysis?.recommendations || [
        'Include links to hosted applications (e.g. Vercel, AWS, GitHub).',
        'Add specific performance metrics (e.g. "reduced latency by 35%").',
        'Ensure contact information and LinkedIn URL are in the primary header.',
      ];

  const badge = getScoreBadge(atsScore);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              Resume Diagnostic Audit
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg} ${badge.color} ${badge.border}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300 font-medium">{fileName}</span>
            <span>• Scored with Gemini AI ATS Parsing Engine</span>
          </p>
        </div>

        <button
          onClick={() => navigate('/resume')}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors self-start sm:self-auto"
        >
          <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
          <span>Upload New Version</span>
        </button>
      </div>

      {/* ── Score Cards & Extracted Skills Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Circular ATS Gauge */}
        <div className="lg:col-span-4 bg-gradient-to-b from-[#111827] to-[#0d1320] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col items-center justify-center">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Overall ATS Match Score
          </span>

          <div className="relative w-40 h-40 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="62" stroke="#1F2937" strokeWidth="12" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r="62"
                stroke={badge.stroke}
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 62}
                strokeDashoffset={2 * Math.PI * 62 * (1 - atsScore / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-white tracking-tight">{atsScore}</span>
              <span className="text-[11px] text-slate-400 font-semibold uppercase">out of 100</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-center">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 uppercase font-medium">Formatting</p>
              <p className="text-sm font-bold text-teal-400 mt-0.5">{formattingScore}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 uppercase font-medium">Action Verbs</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{impactScore}%</p>
            </div>
          </div>
        </div>

        {/* Right: Extracted Skills Chips */}
        <div className="lg:col-span-8 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Recognized Technical Skills ({extractedSkills.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">Parsed from document</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {extractedSkills.length > 0 ? (
              extractedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400">
                Skills parsed from document header and experience sections.
              </p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Verified skills automatically boost your Institutional Readiness Index</span>
            <Link to="/profile" className="text-teal-400 hover:underline font-semibold flex items-center space-x-1">
              <span>View Profile Credentials</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Strengths & Areas to Improve ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Document Strengths</h3>
          </div>
          <div className="space-y-3">
            {strengths.map((str, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-relaxed">{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas to Improve */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Areas to Improve</h3>
          </div>
          <div className="space-y-3">
            {weaknesses.map((weak, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-relaxed">{weak}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actionable Improvement Recommendations ── */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-white">
          <Zap className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            AI Actionable Recommendations
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center">
                {i + 1}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Upload History Table ── */}
      {history.length > 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Upload History & Score Progression
            </h3>
            <span className="text-xs text-slate-400">{history.length} versions evaluated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">File Name</th>
                  <th className="pb-3 font-semibold">ATS Score</th>
                  <th className="pb-3 font-semibold">Analyzed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {history.map((h) => {
                  const scoreVal = h.atsScore ?? h.score ?? 0;
                  const itemBadge = getScoreBadge(scoreVal);
                  return (
                    <tr key={h._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 font-medium text-white flex items-center space-x-2">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>{h.fileName}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${itemBadge.bg} ${itemBadge.color} ${itemBadge.border}`}>
                          {scoreVal} / 100
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(h.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}