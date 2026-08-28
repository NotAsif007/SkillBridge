/**
 * CareerAnalysis.jsx — Deterministic Career Gap Analysis
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 * API: GET /api/v1/career-analysis
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Map,
  ClipboardCheck, Sparkles, TrendingUp, ChevronRight
} from 'lucide-react';
import { studentApi } from '../../../api/student';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

const MOCK_ANALYSIS = {
  targetCareer: { _id: 'c1', title: 'Full Stack Developer' },
  readinessScore: 71,
  breakdown: { technicalSkills: 68, assessmentPerformance: 75, projects: 80, resume: 65, interviewPerformance: 70, roadmapProgress: 60 },
  matchedSkills: [
    { name: 'JavaScript', level: 4, requiredLevel: 4 },
    { name: 'React', level: 3, requiredLevel: 3 },
    { name: 'Node.js', level: 3, requiredLevel: 3 },
  ],
  weakSkills: [
    { name: 'Data Structures & Algorithms', level: 2, requiredLevel: 4, gap: 2 },
  ],
  missingSkills: [
    { name: 'Docker', importance: 'Medium', requiredLevel: 2 },
    { name: 'System Design', importance: 'High', requiredLevel: 3 },
    { name: 'AWS', importance: 'Medium', requiredLevel: 2 },
  ],
  prioritySkills: ['Data Structures & Algorithms', 'System Design', 'Docker'],
  estimatedWeeksToReady: 8,
  aiInsights: 'Strong JavaScript foundation with solid React and Node.js skills. Focus on System Design patterns and containerization with Docker to significantly boost your readiness score. DSA is your highest priority gap.',
};

function ReadinessGauge({ score, T }) {
  const r = 65, cx = 86, cy = 86;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const strokeColor = score >= 80 ? T.emerald : score >= 60 ? T.teal : T.yellow;

  return (
    <svg width={172} height={172} viewBox="0 0 172 172">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={12} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth={12}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x={cx} y={cx - 6} textAnchor="middle" fill={T.textPrimary} fontSize="34" fontWeight="800">
        {score}
      </text>
      <text x={cx} y={cx + 16} textAnchor="middle" fill={T.textMuted} fontSize="12" fontWeight="500">
        / 100
      </text>
    </svg>
  );
}

export default function CareerAnalysis() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentApi.getCareerAnalysis();
      if (res?.data || res) setAnalysis(res?.data || res);
    } catch (err) {
      console.warn('Career analysis notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (loading && !analysis) {
    return (
      <div style={{ width: '100%', maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ height: 60, width: '40%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 8 }} className="animate-pulse" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ height: 260, backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 14 }} className="animate-pulse" />
          <div style={{ height: 260, backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 14 }} className="animate-pulse" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <BarChart2 size={48} color={T.textMuted} style={{ marginBottom: 16, opacity: 0.4 }} />
        <h2 style={{ color: T.textPrimary, marginBottom: 8 }}>No Career Set</h2>
        <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20 }}>Set a target career first to run your gap analysis.</p>
        <button
          onClick={() => navigate('/careers')}
          style={{
            padding: '10px 24px',
            border: 'none',
            borderRadius: 8,
            backgroundColor: T.buttonPrimaryBg,
            color: T.buttonPrimaryText,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Explore Careers
        </button>
      </div>
    );
  }

  const score = analysis.readinessScore || 71;
  const statusBadge = score >= 80
    ? { label: 'Placement Ready', text: T.emeraldText, bg: T.emeraldBg, border: T.emeraldBorder }
    : score >= 60
    ? { label: 'Placement Emerging', text: T.tealText, bg: T.tealBg, border: T.tealBorder }
    : { label: 'Building Foundation', text: T.yellowText, bg: T.yellowBg, border: T.yellowBorder };

  return (
    <div style={{ width: '100%', maxWidth: 1120, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
            Career Gap Analysis
          </h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 4, margin: '4px 0 0 0' }}>
            Target: <strong style={{ color: T.yellowText }}>{analysis.targetCareer?.title || 'Full Stack Developer'}</strong> · Estimated {analysis.estimatedWeeksToReady || 8} weeks to target readiness
          </p>
        </div>

        <button
          onClick={fetchAnalysis}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 16px',
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            backgroundColor: T.surface,
            color: T.textPrimary,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Analysis
        </button>
      </div>

      {/* ── Score + Breakdown Section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: 20, marginBottom: 24 }}>
        {/* Left: Overall Gauge Card */}
        <div
          className="card-hover"
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ReadinessGauge score={score} T={T} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: statusBadge.text,
              backgroundColor: statusBadge.bg,
              border: `1px solid ${statusBadge.border}`,
              padding: '4px 14px',
              borderRadius: 9999,
              marginTop: 12,
            }}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Right: Score Breakdown Progress Bars */}
        <div
          className="card-hover"
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>
            Diagnostic Pillar Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(analysis.breakdown || {}).map(([key, val]) => {
              const label = key.replace(/([A-Z])/g, ' $1');
              const barColor = val >= 75 ? T.emerald : val >= 60 ? T.teal : T.yellow;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ width: 170, fontSize: 13, color: T.textMuted, flexShrink: 0, textTransform: 'capitalize', fontWeight: 500 }}>
                    {label}
                  </span>
                  <div style={{ flex: 1, height: 7, backgroundColor: T.surfaceSubtle, borderRadius: 9999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${val}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        borderRadius: 9999,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <span style={{ width: 40, fontSize: 13, fontWeight: 700, color: T.textPrimary, textAlign: 'right' }}>
                    {val}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 3-Column Skills Gap Matrix ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Matched Skills Card */}
        <div
          className="card-hover"
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h3 style={{ color: T.emeraldText, fontSize: 14, fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} /> Matched Skills ({analysis.matchedSkills?.length || 0})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(analysis.matchedSkills || []).map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  backgroundColor: T.emeraldBg,
                  border: `1px solid ${T.emeraldBorder}`,
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: T.textPrimary, fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                <span style={{ color: T.emeraldText, fontSize: 12, fontWeight: 750 }}>L{s.level} / L{s.requiredLevel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak / Level Gap Skills Card */}
        <div
          className="card-hover"
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h3 style={{ color: T.yellowText, fontSize: 14, fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} /> Skill Level Gaps ({analysis.weakSkills?.length || 0})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(analysis.weakSkills || []).map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  backgroundColor: T.yellowBg,
                  border: `1px solid ${T.yellowBorder}`,
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, alignItems: 'center' }}>
                  <span style={{ color: T.textPrimary, fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                  <span style={{ color: T.yellowText, fontSize: 12, fontWeight: 750 }}>L{s.level} → L{s.requiredLevel}</span>
                </div>
                <div style={{ color: T.textMuted, fontSize: 11 }}>Gap: {s.gap} levels below target</div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Skills Card */}
        <div
          className="card-hover"
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h3 style={{ color: T.roseText, fontSize: 14, fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <XCircle size={16} /> Missing Competencies ({analysis.missingSkills?.length || 0})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(analysis.missingSkills || []).map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  backgroundColor: T.roseBg,
                  border: `1px solid ${T.roseBorder}`,
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: T.textPrimary, fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                <span
                  style={{
                    color: T.roseText,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {s.importance}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Insights Card ── */}
      {analysis.aiInsights && (
        <div
          className="card-hover"
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${T.indigo}`,
            borderRadius: 14,
            padding: 22,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: T.indigoText }}>
            <Sparkles size={16} />
            <h3 style={{ fontSize: 15, fontWeight: 750, margin: 0 }}>Strategic Analysis Insights</h3>
          </div>
          <p style={{ color: T.textMuted, fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>
            {analysis.aiInsights}
          </p>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/roadmap')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 22px',
            border: 'none',
            borderRadius: 10,
            backgroundColor: T.buttonPrimaryBg,
            color: T.buttonPrimaryText,
            fontWeight: 750,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Map size={15} /> View Learning Roadmap
        </button>

        <button
          onClick={() => navigate('/assessments')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 22px',
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            backgroundColor: T.surface,
            color: T.textPrimary,
            fontWeight: 650,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <ClipboardCheck size={15} /> Take Assessments
        </button>
      </div>
    </div>
  );
}
