/**
 * CareerAnalysis.jsx — Deterministic Career Gap Analysis
 * API: GET /api/v1/career-analysis  (API_CONTRACT.md §5)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Map, ClipboardCheck } from 'lucide-react';
import { studentApi } from '../../../api/student';

const T = {
  appBg:'#0B0F17', surface:'#111827', border:'#1F2937',
  textPrimary:'#F9FAFB', textMuted:'#9CA3AF', blue:'#2563EB',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
  teal:'#0D9488', tealBg:'rgba(13,148,136,0.12)', tealText:'#2DD4BF',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.12)', amberText:'#FBBF24',
  red:'#DC2626', redBg:'rgba(220,38,38,0.12)', redText:'#F87171',
};

function readinessColor(score) {
  if (score >= 80) return { text: T.emeraldText, bg: T.emeraldBg, stroke: T.emerald, label: 'Placement Ready' };
  if (score >= 60) return { text: T.tealText, bg: T.tealBg, stroke: T.teal, label: 'Placement Emerging' };
  return { text: T.amberText, bg: T.amberBg, stroke: T.amber, label: 'Building Foundation' };
}

const MOCK_ANALYSIS = {
  targetCareer: { _id: 'c1', title: 'Full Stack Developer' },
  readinessScore: 71,
  breakdown: { technicalSkills: 68, assessmentPerformance: 75, projects: 80, resume: 65, interviewPerformance: 70, roadmapProgress: 60 },
  matchedSkills: [{ name: 'JavaScript', level: 4, requiredLevel: 4 }, { name: 'React', level: 3, requiredLevel: 3 }, { name: 'Node.js', level: 3, requiredLevel: 3 }],
  weakSkills: [{ name: 'Data Structures & Algorithms', level: 2, requiredLevel: 4, gap: 2 }],
  missingSkills: [{ name: 'Docker', importance: 'Medium', requiredLevel: 2 }, { name: 'System Design', importance: 'High', requiredLevel: 3 }, { name: 'AWS', importance: 'Medium', requiredLevel: 2 }],
  prioritySkills: ['Data Structures & Algorithms', 'System Design', 'Docker'],
  estimatedWeeksToReady: 8,
  aiInsights: 'Strong JavaScript foundation with solid React and Node.js skills. Focus on System Design patterns and containerization with Docker to significantly boost your readiness score. DSA is your highest priority gap.',
};

function ReadinessGauge({ score }) {
  const r = 65, cx = 86, cy = 86;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const c = readinessColor(score);
  return (
    <svg width={172} height={172} viewBox="0 0 172 172">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={12} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.stroke} strokeWidth={12}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cx - 6} textAnchor="middle" fill={T.textPrimary} fontSize="34" fontWeight="800">{score}</text>
      <text x={cx} y={cx + 16} textAnchor="middle" fill={T.textMuted} fontSize="12">/ 100</text>
    </svg>
  );
}

export default function CareerAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentApi.getCareerAnalysis();
      setAnalysis(res.data);
    } catch {
      setAnalysis(MOCK_ANALYSIS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);

  if (loading) {
    return (
      <div style={{ padding: '32px 40px' }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 140, background: T.surface, borderRadius: 10, marginBottom: 16, opacity: 0.6 }} />)}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <BarChart2 size={48} color={T.textMuted} style={{ marginBottom: 16, opacity: 0.4 }} />
        <h2 style={{ color: T.textPrimary, marginBottom: 8 }}>No Career Set</h2>
        <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20 }}>Set a target career first to run your gap analysis.</p>
        <button onClick={() => navigate('/careers')} style={{ padding: '10px 24px', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Explore Careers
        </button>
      </div>
    );
  }

  const c = readinessColor(analysis.readinessScore);

  return (
    <div style={{ padding: '32px 40px', background: T.appBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>Career Gap Analysis</h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 6 }}>Target: <strong style={{ color: T.blue }}>{analysis.targetCareer?.title}</strong> · ~{analysis.estimatedWeeksToReady} weeks to ready</p>
        </div>
        <button onClick={fetchAnalysis} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textMuted, cursor: 'pointer', fontSize: 13 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Score + Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ReadinessGauge score={analysis.readinessScore} />
          <span style={{ fontSize: 11, fontWeight: 700, color: c.text, background: c.bg, padding: '3px 12px', borderRadius: 9999, marginTop: 10 }}>{c.label}</span>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24 }}>
          <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Score Breakdown</h3>
          {Object.entries(analysis.breakdown || {}).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ width: 160, fontSize: 13, color: T.textMuted, flexShrink: 0, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
              <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ width: `${val}%`, height: '100%', background: T.blue, borderRadius: 9999 }} />
              </div>
              <span style={{ width: 36, fontSize: 13, fontWeight: 600, color: T.textPrimary, textAlign: 'right' }}>{val}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {/* Matched */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <h3 style={{ color: T.emeraldText, fontSize: 14, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} /> Matched ({analysis.matchedSkills?.length})
          </h3>
          {(analysis.matchedSkills || []).map((s, i) => (
            <div key={i} style={{ padding: '8px 10px', background: T.emeraldBg, borderRadius: 7, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: T.textPrimary, fontSize: 13 }}>{s.name}</span>
              <span style={{ color: T.emeraldText, fontSize: 12, fontWeight: 600 }}>L{s.level}</span>
            </div>
          ))}
        </div>
        {/* Weak */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <h3 style={{ color: T.amberText, fontSize: 14, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} /> Weak ({analysis.weakSkills?.length})
          </h3>
          {(analysis.weakSkills || []).map((s, i) => (
            <div key={i} style={{ padding: '8px 10px', background: T.amberBg, borderRadius: 7, marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ color: T.textPrimary, fontSize: 13 }}>{s.name}</span>
                <span style={{ color: T.amberText, fontSize: 12, fontWeight: 600 }}>L{s.level}→L{s.requiredLevel}</span>
              </div>
              <div style={{ color: T.textMuted, fontSize: 11 }}>Gap: {s.gap} levels</div>
            </div>
          ))}
        </div>
        {/* Missing */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <h3 style={{ color: T.redText, fontSize: 14, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <XCircle size={14} /> Missing ({analysis.missingSkills?.length})
          </h3>
          {(analysis.missingSkills || []).map((s, i) => (
            <div key={i} style={{ padding: '8px 10px', background: T.redBg, borderRadius: 7, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: T.textPrimary, fontSize: 13 }}>{s.name}</span>
              <span style={{ color: T.redText, fontSize: 11 }}>{s.importance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      {analysis.aiInsights && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: '0 0 10px' }}>AI Insights</h3>
          <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{analysis.aiInsights}</p>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate('/roadmap')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <Map size={15} /> View Roadmap
        </button>
        <button onClick={() => navigate('/assessments')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textPrimary, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <ClipboardCheck size={15} /> Take Assessments
        </button>
      </div>
    </div>
  );
}
