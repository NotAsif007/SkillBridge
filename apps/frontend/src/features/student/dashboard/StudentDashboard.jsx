/**
 * StudentDashboard.jsx — High-Performance Student Placement Readiness & Diagnostics
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

function readinessBadge(score) {
  if (score >= 80) return { label: 'Placement Ready', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', stroke: '#059669' };
  if (score >= 60) return { label: 'Placement Emerging', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', stroke: '#0D9488' };
  return { label: 'Building Foundation', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', stroke: '#D97706' };
}

const BREAKDOWN_METRICS = [
  { key: 'technicalSkills', label: 'Technical Skills', color: 'bg-stone-50', text: 'text-stone-600', icon: Target },
  { key: 'assessmentPerformance', label: 'Skill Assessments', color: 'bg-teal-50', text: 'text-teal-600', icon: ClipboardCheck },
  { key: 'projects', label: 'Verified Projects', color: 'bg-emerald-50', text: 'text-emerald-600', icon: FolderOpen },
  { key: 'resume', label: 'ATS Resume Quality', color: 'bg-amber-50', text: 'text-amber-600', icon: FileText },
  { key: 'interviewPerformance', label: 'Mock Interviews', color: 'bg-emerald-50', text: 'text-emerald-600', icon: MessageSquare },
  { key: 'roadmapProgress', label: 'Roadmap Milestone', color: 'bg-cyan-50', text: 'text-cyan-600', icon: Map },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
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
      setError(err.message || 'Unable to load real-time dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const score = data?.readinessScore ?? 0;
  const badge = readinessBadge(score);
  const targetCareer = data?.targetCareer?.title || 'Target Career Path';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* ─── Top Header Banner ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E5EA] pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Active Student</span>
            </span>
          </div>
          <p className="text-sm text-[#6E6E73] mt-1">
            Institutional placement index & deterministic gap analysis for{' '}
            <span className="text-emerald-600 font-semibold">{targetCareer}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-white hover:bg-[#E5E5EA] border border-[#E5E5EA] text-xs font-semibold text-[#424245] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate Score</span>
          </button>

          <Link
            to="/jobs"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-50 text-xs font-bold text-[#1D1D1F] shadow-sm shadow-emerald-100 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>View {data?.activeJobMatches || 0} Matched Jobs</span>
          </Link>
        </div>
      </div>

      {/* ─── Primary Readiness Overview & KPI Hero ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Readiness Gauge Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#FFFFFF] to-[#F8F8FA] border border-[#E5E5EA] rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -z-0"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
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
                  stroke="#E5E5EA"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  stroke={badge.stroke}
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 64}
                  strokeDashoffset={2 * Math.PI * 64 * (1 - score / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-[#1D1D1F] tracking-tight">{score}%</span>
                <span className="text-xs text-[#6E6E73] font-medium">Readiness</span>
              </div>
            </div>

            <p className="text-xs text-[#6E6E73] text-center max-w-xs mt-3">
              Weighted composite evaluating your assessments, roadmap progress, project credentials, and resume alignment.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73] relative z-10">
            <span>Minimum Tier-1 Target: 75%</span>
            <Link to="/career-analysis" className="text-emerald-600 hover:underline flex items-center space-x-1 font-medium">
              <span>View Gap Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: 6 Diagnostic Pillars Breakdown */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E5E5EA] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider">
                Readiness Breakdown by Pillar
              </h2>
              <span className="text-xs text-[#6E6E73]">Deterministic Engine v1.4</span>
            </div>

            <div className="space-y-4">
              {BREAKDOWN_METRICS.map(({ key, label, color, text, icon: Icon }) => {
                const val = data?.scoreBreakdown?.[key] ?? 0;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${text}`} />
                        <span className="text-[#424245]">{label}</span>
                      </div>
                      <span className={`font-bold ${text}`}>{val}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${color}`}
                        style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
            <span>Pass official assessments to upgrade verification status</span>
            <Link to="/assessments" className="text-teal-600 hover:underline font-semibold flex items-center space-x-1">
              <span>Take Assessment</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Priority Skill Gaps & Action Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Skill Gaps (Left 7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E5E5EA] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-amber-50"></div>
              <h2 className="text-base font-bold text-[#1D1D1F]">Priority Skill Gaps</h2>
            </div>
            <span className="text-xs text-[#6E6E73]">Target: {targetCareer}</span>
          </div>

          <div className="space-y-3">
            {data?.topSkillGaps && data.topSkillGaps.length > 0 ? (
              data.topSkillGaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] hover:border-[#E5E5EA] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1D1D1F]">{gap.name}</p>
                      <p className="text-xs text-amber-600/90 font-medium">Gap Level: -{gap.gap} from target</p>
                    </div>
                  </div>

                  <Link
                    to="/roadmap"
                    className="px-3 py-1.5 rounded-lg bg-[#E5E5EA] hover:bg-slate-700 text-xs font-semibold text-[#1D1D1F] transition-colors flex items-center space-x-1"
                  >
                    <span>Bridge in Roadmap</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[#6E6E73] text-xs bg-[#F5F5F7] rounded-xl border border-[#E5E5EA]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-[#1D1D1F]">No critical skill gaps identified</p>
                <p className="mt-1">All foundational requirements for {targetCareer} are verified!</p>
              </div>
            )}
          </div>
        </div>

        {/* 4 Fast Action Cards (Right 5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/roadmap"
            className="p-4 rounded-xl bg-[#F5F5F7] hover:bg-[#F5F5F7] border border-[#E5E5EA] hover:border-emerald-300 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <Map className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#1D1D1F] group-hover:text-emerald-600 transition-colors">
                Personalized Roadmap
              </h3>
              <p className="text-xs text-[#6E6E73] mt-1">
                {data?.roadmapProgress || 0}% Completed
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs text-emerald-600 font-semibold">
              <span>View Tasks</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/interview"
            className="p-4 rounded-xl bg-[#F5F5F7] hover:bg-[#F5F5F7] border border-[#E5E5EA] hover:border-emerald-300 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#1D1D1F] group-hover:text-emerald-600 transition-colors">
                AI Mock Interview
              </h3>
              <p className="text-xs text-[#6E6E73] mt-1">
                {data?.interviewsCompleted || 0} Sessions Taken
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs text-emerald-600 font-semibold">
              <span>Practice AI</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/resume"
            className="p-4 rounded-xl bg-[#F5F5F7] hover:bg-[#F5F5F7] border border-[#E5E5EA] hover:border-amber-300 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#1D1D1F] group-hover:text-amber-600 transition-colors">
                ATS Resume Audit
              </h3>
              <p className="text-xs text-[#6E6E73] mt-1">
                Keyword & formatting scoring
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs text-amber-600 font-semibold">
              <span>Analyze PDF</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/projects"
            className="p-4 rounded-xl bg-[#F5F5F7] hover:bg-[#F5F5F7] border border-[#E5E5EA] hover:border-stone-300 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-600 mb-3">
                <FolderOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#1D1D1F] group-hover:text-stone-600 transition-colors">
                Portfolio Projects
              </h3>
              <p className="text-xs text-[#6E6E73] mt-1">
                {data?.projectsCount || 0} Live Verified
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs text-stone-600 font-semibold">
              <span>Manage Projects</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* ─── Recent Activity ─── */}
      <div className="bg-[#FFFFFF] border border-[#E5E5EA] rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#1D1D1F] mb-4">Recent Activity</h2>
        {data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {data.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-[#F5F5F7] rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#6E6E73]">
                    {activity.type === 'assessment' && <ClipboardCheck className="w-5 h-5" />}
                    {activity.type === 'roadmap' && <Map className="w-5 h-5" />}
                    {activity.type === 'interview' && <MessageSquare className="w-5 h-5" />}
                    {activity.type === 'resume' && <FileText className="w-5 h-5" />}
                    {!['assessment', 'roadmap', 'interview', 'resume'].includes(activity.type) && <Activity className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1D1D1F]">{activity.title}</p>
                    <p className="text-xs text-[#6E6E73]">{activity.date}</p>
                  </div>
                </div>
                {activity.score !== undefined && (
                  <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-200">
                    Score: {activity.score}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-[#6E6E73] text-sm bg-[#F5F5F7] rounded-xl border border-[#E5E5EA]">
            No recent activity to show.
          </div>
        )}
      </div>
    </div>
  );
}