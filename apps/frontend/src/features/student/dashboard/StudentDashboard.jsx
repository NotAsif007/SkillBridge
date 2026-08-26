/**
 * StudentDashboard.jsx — Student Overview & Readiness
 * API: GET /api/v1/dashboard/student  (API_CONTRACT.md §12)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RefreshCw, Target, Map, ClipboardCheck, FolderOpen,
  Briefcase, Activity, TrendingUp, Star,
} from 'lucide-react';
import { studentApi } from '../../../api/student';

const T = {
  appBg:'#0B0F17', surface:'#111827', border:'#1F2937',
  textPrimary:'#F9FAFB', textMuted:'#9CA3AF',
  blue:'#2563EB', cobalt:'#1E3A8A',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
  teal:'#0D9488', tealBg:'rgba(13,148,136,0.12)', tealText:'#2DD4BF',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.12)', amberText:'#FBBF24',
  red:'#DC2626', redBg:'rgba(220,38,38,0.12)', redText:'#F87171',
};

function readinessColor(score) {
  if (score >= 80) return { text: T.emeraldText, bg: T.emeraldBg, label: 'Placement Ready', stroke: T.emerald };
  if (score >= 60) return { text: T.tealText, bg: T.tealBg, label: 'Placement Emerging', stroke: T.teal };
  return { text: T.amberText, bg: T.amberBg, label: 'Building Foundation', stroke: T.amber };
}

const MOCK_DATA = {
  readinessScore: 72, skillProgress: 68, roadmapProgress: 54,
  projectsCount: 3, interviewsCompleted: 4, activeJobMatches: 12,
  targetCareer: { id: 'c1', title: 'Full Stack Developer' },
  scoreBreakdown: { technicalSkills: 75, assessmentPerformance: 80, projects: 70, resume: 65, interviewPerformance: 70, roadmapProgress: 54 },
  topSkillGaps: [
    { name: 'System Design', gap: 2 }, { name: 'Docker', gap: 1 },
    { name: 'DSA', gap: 2 }, { name: 'AWS', gap: 3 },
  ],
  recentActivity: [
    { type: 'ASSESSMENT_COMPLETED', title: 'React Intermediate Assessment', score: 90, date: '2026-08-24T14:20:00.000Z' },
    { type: 'PROJECT_ADDED', title: 'Real-Time Collaboration Tool', score: null, date: '2026-08-23T10:00:00.000Z' },
    { type: 'ROADMAP_TASK', title: 'Completed: Advanced Async JavaScript', score: null, date: '2026-08-22T09:00:00.000Z' },
  ],
};

const BREAKDOWN_META = [
  { key: 'technicalSkills',      label: 'Technical Skills',      color: T.blue },
  { key: 'assessmentPerformance', label: 'Assessments',          color: T.teal },
  { key: 'projects',             label: 'Projects',               color: T.emerald },
  { key: 'resume',               label: 'Resume',                 color: T.amber },
  { key: 'interviewPerformance', label: 'Interviews',             color: '#8B5CF6' },
  { key: 'roadmapProgress',      label: 'Roadmap',                color: T.tealText },
];

function ReadinessGauge({ score }) {
  const r = 60, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const c = readinessColor(score);
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.stroke} strokeWidth={10}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill={T.textPrimary} fontSize="28" fontWeight="800">{score}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={T.textMuted} fontSize="11">/ 100</text>
    </svg>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 9999, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color, subtext }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, background: `${color}20`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ color: T.textPrimary, fontSize: 13, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {subtext && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>{subtext}</div>}
    </div>
  );
}

function activityIcon(type) {
  if (type === 'ASSESSMENT_COMPLETED') return <ClipboardCheck size={14} color={T.tealText} />;
  if (type === 'PROJECT_ADDED') return <FolderOpen size={14} color={T.blue} />;
  return <Activity size={14} color={T.amberText} />;
}

function Skeleton() {
  return (
    <div style={{ padding: '32px 40px' }}>
      {[1,2,3].map(i => <div key={i} style={{ height: 120, background: T.surface, borderRadius: 10, marginBottom: 16, opacity: 0.6 }} />)}
    </div>
  );
}

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const res = await studentApi.getDashboard();
      setData(res.data);
    } catch {
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <Skeleton />;
  if (!data) return null;

  const c = readinessColor(data.readinessScore);

  return (
    <div style={{ padding: '32px 40px', background: T.appBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>
            Student Dashboard
          </h1>
          {data.targetCareer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <Target size={13} color={T.blue} />
              <span style={{ color: T.textMuted, fontSize: 13 }}>Target: </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.blue, background: `${T.blue}18`, padding: '2px 10px', borderRadius: 9999 }}>
                {data.targetCareer.title}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textMuted, cursor: 'pointer', fontSize: 13 }}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Readiness + Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20 }}>
        {/* Gauge card */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ReadinessGauge score={data.readinessScore} />
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.text, background: c.bg, padding: '3px 12px', borderRadius: 9999, display: 'inline-block' }}>
              {c.label}
            </div>
            <div style={{ color: T.textMuted, fontSize: 11, marginTop: 6 }}>Placement Readiness Score</div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24 }}>
          <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Score Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {BREAKDOWN_META.map(({ key, label, color }) => {
              const val = data.scoreBreakdown?.[key] ?? 0;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 130, fontSize: 13, color: T.textMuted, flexShrink: 0 }}>{label}</span>
                  <ProgressBar value={val} color={color} />
                  <span style={{ width: 36, fontSize: 13, fontWeight: 600, color: T.textPrimary, textAlign: 'right', flexShrink: 0 }}>{val}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard icon={TrendingUp}     value={`${data.skillProgress}%`}       label="Skill Progress"      color={T.blue}    subtext="vs. target career" />
        <StatCard icon={Map}            value={`${data.roadmapProgress}%`}     label="Roadmap Progress"    color={T.teal}    subtext="milestones done" />
        <StatCard icon={FolderOpen}     value={data.projectsCount}             label="Projects"            color={T.emerald} subtext="in portfolio" />
        <StatCard icon={Briefcase}      value={data.activeJobMatches}          label="Job Matches"         color={T.amber}   subtext="active openings" />
      </div>

      {/* Gaps + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Skill gaps */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24 }}>
          <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Top Skill Gaps</h3>
          {data.topSkillGaps?.map((gap, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < data.topSkillGaps.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <span style={{ color: T.textPrimary, fontSize: 14 }}>{gap.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: T.amberText, background: T.amberBg, padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>
                  Gap: {gap.gap}
                </span>
                <Link to="/assessments" style={{ fontSize: 12, color: T.blue, textDecoration: 'none' }}>
                  Assess →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24 }}>
          <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Recent Activity</h3>
          {data.recentActivity?.map((act, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < data.recentActivity.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ width: 28, height: 28, background: T.border, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {activityIcon(act.type)}
              </div>
              <div>
                <div style={{ color: T.textPrimary, fontSize: 13, fontWeight: 500 }}>{act.title}</div>
                <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>
                  {act.score != null && <span style={{ marginRight: 8, color: T.emeraldText }}>Score: {act.score}</span>}
                  {new Date(act.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { icon: Map, label: 'Continue Roadmap', sub: 'Pick up where you left off', to: '/roadmap', color: T.teal },
          { icon: ClipboardCheck, label: 'Take Assessment', sub: 'Verify your skill levels', to: '/assessments', color: T.blue },
          { icon: FolderOpen, label: 'Add Project', sub: 'Strengthen your portfolio', to: '/projects', color: T.emerald },
        ].map(({ icon: Icon, label, sub, to, color }) => (
          <button key={to} onClick={() => navigate(to)} style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
            padding: '20px 20px', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.15s',
          }}
            onMouseOver={e => e.currentTarget.style.borderColor = color}
            onMouseOut={e => e.currentTarget.style.borderColor = T.border}
          >
            <div style={{ width: 40, height: 40, background: `${color}20`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ color: T.textPrimary, fontSize: 14, fontWeight: 600 }}>{label}</div>
              <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
