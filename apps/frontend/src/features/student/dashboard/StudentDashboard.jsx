/**
 * StudentDashboard.jsx — High-Performance Student Placement Readiness & Diagnostics
 * Fully themed for Apple Light and Yellow Graphite Dark mode
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RefreshCw, Target, Map, ClipboardCheck, FolderOpen,
  Briefcase, Activity, TrendingUp, Sparkles, ArrowUpRight,
  CheckCircle2, AlertTriangle, MessageSquare, FileText,
  ChevronRight, Award, ShieldAlert, Zap,
} from 'lucide-react';
import { studentApi } from '../../../api/student';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

function readinessBadge(score, isDark) {
  if (score >= 80) return { label: 'Placement Ready', color: isDark ? 'text-emerald-400' : 'text-emerald-600', bg: isDark ? 'bg-emerald-950/40' : 'bg-emerald-50', border: isDark ? 'border-emerald-800/60' : 'border-emerald-200', stroke: '#10B981' };
  if (score >= 60) return { label: 'Placement Emerging', color: isDark ? 'text-teal-400' : 'text-teal-600', bg: isDark ? 'bg-teal-950/40' : 'bg-teal-50', border: isDark ? 'border-teal-800/60' : 'border-teal-200', stroke: '#14B8A6' };
  return { label: 'Building Foundation', color: isDark ? 'text-amber-400' : 'text-amber-600', bg: isDark ? 'bg-amber-950/40' : 'bg-amber-50', border: isDark ? 'border-amber-800/60' : 'border-amber-200', stroke: '#F59E0B' };
}

const BREAKDOWN_METRICS = [
  { key: 'technicalSkills', label: 'Technical Skills', color: 'bg-amber-500', text: 'text-amber-400', darkColor: '#F59E0B', darkText: '#FBBF24', icon: Target },
  { key: 'assessmentPerformance', label: 'Skill Assessments', color: 'bg-teal-400', text: 'text-teal-400', darkColor: '#06B6D4', darkText: '#22D3EE', icon: ClipboardCheck },
  { key: 'projects', label: 'Verified Projects', color: 'bg-emerald-400', text: 'text-emerald-400', darkColor: '#10B981', darkText: '#34D399', icon: FolderOpen },
  { key: 'resume', label: 'ATS Resume Quality', color: 'bg-amber-400', text: 'text-amber-400', darkColor: '#F59E0B', darkText: '#FBBF24', icon: FileText },
  { key: 'interviewPerformance', label: 'Mock Interviews', color: 'bg-emerald-500', text: 'text-emerald-400', darkColor: '#10B981', darkText: '#34D399', icon: MessageSquare },
  { key: 'roadmapProgress', label: 'Roadmap Milestone', color: 'bg-yellow-400', text: 'text-yellow-400', darkColor: '#6366F1', darkText: '#818CF8', icon: Map },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const score = data?.readinessScore ?? 45;
  const badge = readinessBadge(score, isDark);
  const targetCareer = data?.targetCareer?.title || 'Full Stack Developer';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans">
      {/* ─── Top Header Banner ─── */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${isDark ? 'border-[#1E2130]' : 'border-[#E5E5EA]'}`}>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${isDark ? 'text-[#F4F4F6]' : 'text-[#1D1D1F]'}`}>
              Welcome back, {user?.name || 'Suraj'}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 ${
              isDark ? 'bg-amber-950/40 text-[#FBBF24] border border-amber-800/50' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#F59E0B]' : 'bg-emerald-600'} animate-pulse`}></span>
              <span>Active Student</span>
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-[#9CA3AF]' : 'text-[#6E6E73]'}`}>
            Placement readiness and skill gap analysis for{' '}
            <span className={`font-semibold ${isDark ? 'text-[#FBBF24]' : 'text-emerald-600'}`}>{targetCareer}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
              isDark
                ? 'bg-[#181B25] hover:bg-[#1E2130] border-[#1E2130] text-[#F4F4F6]'
                : 'bg-white hover:bg-[#E5E5EA] border-[#E5E5EA] text-[#424245]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate Score</span>
          </button>

          <Link
            to="/jobs"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
              isDark
                ? 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#121316] shadow-amber-950/40'
                : 'bg-[#1D1D1F] hover:bg-black text-white shadow-stone-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>View {data?.activeJobMatches || 1} Matched Jobs</span>
          </Link>
        </div>
      </div>

      {/* ─── Primary Readiness Overview & KPI Hero ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Readiness Gauge Card */}
        <div className={`lg:col-span-5 border rounded-2xl p-6 relative overflow-hidden shadow-sm ${
          isDark
            ? 'bg-[#151720] border-[#1E2130]'
            : 'bg-gradient-to-b from-[#FFFFFF] to-[#F8F8FA] border-[#E5E5EA]'
        }`}>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#9CA3AF]' : 'text-[#6E6E73]'}`}>
              Placement Readiness Index
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${badge.bg} ${badge.color} ${badge.border}`}>
              {badge.label}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-4 relative z-10">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  stroke={isDark ? '#1E2130' : '#E5E5EA'}
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  stroke={isDark ? '#F59E0B' : badge.stroke}
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 64}
                  strokeDashoffset={2 * Math.PI * 64 * (1 - score / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-[#F4F4F6]' : 'text-[#1D1D1F]'}`}>{score}%</span>
                <span className={`text-xs font-medium ${isDark ? 'text-[#9CA3AF]' : 'text-[#6E6E73]'}`}>Readiness</span>
              </div>
            </div>

            <p className={`text-xs text-center max-w-xs mt-3 ${isDark ? 'text-[#9CA3AF]' : 'text-[#6E6E73]'}`}>
              Calculated from your assessments, projects, and roadmap progress.
            </p>
          </div>

          <div className={`pt-4 border-t flex items-center justify-between text-xs relative z-10 ${
            isDark ? 'border-[#1E2130] text-[#9CA3AF]' : 'border-[#E5E5EA] text-[#6E6E73]'
          }`}>
            <span>Target score: 75%</span>
            <Link to="/career-analysis" className={`hover:underline flex items-center space-x-1 font-semibold ${isDark ? 'text-[#FBBF24]' : 'text-emerald-600'}`}>
              <span>View Gap Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: 6 Diagnostic Pillars Breakdown */}
        <div className={`lg:col-span-7 border rounded-2xl p-6 shadow-sm flex flex-col justify-between ${
          isDark ? 'bg-[#151720] border-[#1E2130]' : 'bg-[#FFFFFF] border-[#E5E5EA]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-[#F4F4F6]' : 'text-[#1D1D1F]'}`}>
                Readiness Breakdown by Pillar
              </h2>
            </div>

            <div className="space-y-4">
              {BREAKDOWN_METRICS.map(({ key, label, color, text, darkColor, darkText, icon: Icon }) => {
                const val = data?.scoreBreakdown?.[key] ?? (key === 'technicalSkills' ? 52 : key === 'projects' || key === 'resume' ? 75 : key === 'interviewPerformance' ? 70 : 0);
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" style={isDark ? { color: darkColor } : undefined} />
                        <span className={isDark ? 'text-[#D1D5DB]' : 'text-[#424245]'}>{label}</span>
                      </div>
                      <span className="font-bold" style={isDark ? { color: darkText } : undefined}>{val}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#181B25]' : 'bg-[#E5E5EA]'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isDark ? '' : color}`}
                        style={{
                          width: `${Math.min(100, Math.max(0, val))}%`,
                          ...(isDark ? { backgroundColor: darkColor } : {}),
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-[#1E2130] text-[#9CA3AF]' : 'border-[#E5E5EA] text-[#6E6E73]'
          }`}>
            <span>Pass official assessments to upgrade verification status</span>
            <Link to="/assessments" className={`hover:underline font-semibold flex items-center space-x-1 ${isDark ? 'text-[#FBBF24]' : 'text-teal-600'}`}>
              <span>Take Assessment</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Priority Skill Gaps & Action Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Skill Gaps (Left 7 cols) */}
        <div className={`lg:col-span-7 border rounded-2xl p-6 shadow-sm space-y-4 ${
          isDark ? 'bg-[#151720] border-[#1E2130]' : 'bg-[#FFFFFF] border-[#E5E5EA]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#F59E0B]' : 'bg-amber-500'}`}></div>
              <h2 className={`text-base font-bold ${isDark ? 'text-[#F4F4F6]' : 'text-[#1D1D1F]'}`}>Priority Skill Gaps</h2>
            </div>
            <span className={`text-xs ${isDark ? 'text-[#9CA3AF]' : 'text-[#6E6E73]'}`}>Target: {targetCareer}</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Data Structures & Algorithms', gap: 2 },
              { name: 'MongoDB', gap: 3 },
              { name: 'REST APIs & WebSockets', gap: 1 },
            ].map((gap, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-[#10121A] border-[#1E2130] hover:border-[#F59E0B]/40'
                    : 'bg-[#F5F5F7] border-[#E5E5EA] hover:border-[#D2D2D7]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isDark
                      ? 'bg-amber-950/50 border border-amber-800/60 text-[#FBBF24]'
                      : 'bg-amber-50 border border-amber-200 text-amber-600'
                  }`}>
                    #{i + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-[#F4F4F6]' : 'text-[#1D1D1F]'}`}>{gap.name}</p>
                    <p className={`text-xs font-medium ${isDark ? 'text-[#FBBF24]' : 'text-amber-600'}`}>Gap Level: -{gap.gap} from target</p>
                  </div>
                </div>

                <Link
                  to="/roadmap"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                    isDark
                      ? 'bg-[#181B25] hover:bg-[#1E2130] text-[#F4F4F6] border border-[#1E2130]'
                      : 'bg-[#E5E5EA] hover:bg-[#D2D2D7] text-[#1D1D1F]'
                  }`}
                >
                  <span>Bridge in Roadmap</span>
                  <ArrowUpRight className={`w-3.5 h-3.5 ${isDark ? 'text-[#F59E0B]' : 'text-emerald-600'}`} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Fast Action Cards (Right 5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/roadmap"
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between group ${
              isDark
                ? 'bg-[#151720] border-[#1E2130] hover:border-emerald-500/40'
                : 'bg-[#F5F5F7] border-[#E5E5EA] hover:border-emerald-300'
            }`}
          >
            <div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                isDark ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                <Map className="w-4 h-4" />
              </div>
              <h3 className={`font-bold text-sm transition-colors ${isDark ? 'text-[#F3F4F6] group-hover:text-emerald-400' : 'text-[#1D1D1F]'}`}>
                Personalized Roadmap
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#6B7280]' : 'text-[#6E6E73]'}`}>
                45% Completed
              </p>
            </div>
            <div className={`mt-3 flex items-center text-xs font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <span>View Tasks</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/interview"
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between group ${
              isDark
                ? 'bg-[#151720] border-[#1E2130] hover:border-cyan-500/40'
                : 'bg-[#F5F5F7] border-[#E5E5EA] hover:border-emerald-300'
            }`}
          >
            <div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                isDark ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/40' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className={`font-bold text-sm transition-colors ${isDark ? 'text-[#F3F4F6] group-hover:text-cyan-400' : 'text-[#1D1D1F]'}`}>
                AI Mock Interview
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#6B7280]' : 'text-[#6E6E73]'}`}>
                0 Sessions Taken
              </p>
            </div>
            <div className={`mt-3 flex items-center text-xs font-semibold ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`}>
              <span>Practice AI</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/resume"
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between group ${
              isDark
                ? 'bg-[#151720] border-[#1E2130] hover:border-amber-500/40'
                : 'bg-[#F5F5F7] border-[#E5E5EA] hover:border-amber-300'
            }`}
          >
            <div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                isDark ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40' : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                <FileText className="w-4 h-4" />
              </div>
              <h3 className={`font-bold text-sm transition-colors ${isDark ? 'text-[#F3F4F6] group-hover:text-amber-400' : 'text-[#1D1D1F]'}`}>
                ATS Resume Audit
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#6B7280]' : 'text-[#6E6E73]'}`}>
                Score: 75/100
              </p>
            </div>
            <div className={`mt-3 flex items-center text-xs font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              <span>Analyze PDF</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/projects"
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between group ${
              isDark
                ? 'bg-[#151720] border-[#1E2130] hover:border-indigo-500/40'
                : 'bg-[#F5F5F7] border-[#E5E5EA] hover:border-stone-300'
            }`}
          >
            <div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                isDark ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-800/40' : 'bg-stone-50 text-stone-600 border border-stone-200'
              }`}>
                <FolderOpen className="w-4 h-4" />
              </div>
              <h3 className={`font-bold text-sm transition-colors ${isDark ? 'text-[#F3F4F6] group-hover:text-indigo-400' : 'text-[#1D1D1F]'}`}>
                Portfolio Projects
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#6B7280]' : 'text-[#6E6E73]'}`}>
                1 Live Verified
              </p>
            </div>
            <div className={`mt-3 flex items-center text-xs font-semibold ${isDark ? 'text-indigo-400' : 'text-stone-600'}`}>
              <span>Manage Projects</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
