/**
 * InterviewReport.jsx — Final Mock Interview Score & Diagnostic Report
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, MessageSquare, LayoutDashboard, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

const MOCK_REPORT = {
  allAnswers: [
    { question: { questionText: 'Explain the Node.js event loop and microtasks.' }, answer: 'The event loop has phases...', evaluation: { score: 85, feedback: 'Good understanding of phases and microtask queue priorities.', strengths: ['Clear execution order'], improvements: [] } },
    { question: { questionText: 'How would you design idempotency for payment APIs?' }, answer: 'Use idempotency keys...', evaluation: { score: 88, feedback: 'Excellent coverage of idempotency keys and database constraints.', strengths: ['Atomic transactions'], improvements: [] } },
    { question: { questionText: 'SQL vs NoSQL — when to choose each?' }, answer: 'SQL for structured data...', evaluation: { score: 82, feedback: 'Comprehensive comparison with clear use-case differentiation.', strengths: ['ACID vs BASE tradeoffs'], improvements: ['Mention sharding'] } },
  ],
};

function ScoreGauge({ score, T }) {
  const r = 60, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const stroke = score >= 80 ? T.emerald : score >= 60 ? T.teal : T.yellow;

  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={10} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={10}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x={cx} y={cx - 6} textAnchor="middle" fill={T.textPrimary} fontSize="30" fontWeight="800">
        {score}
      </text>
      <text x={cx} y={cx + 14} textAnchor="middle" fill={T.textMuted} fontSize="11" fontWeight="600">
        / 100
      </text>
    </svg>
  );
}

export default function InterviewReport() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);
  const { state } = useLocation();
  const navigate = useNavigate();

  const data = state || MOCK_REPORT;
  const { allAnswers = [] } = data;

  const scores = allAnswers.map((a) => a.evaluation?.score || 80);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 80;

  const strengths = allAnswers.filter((a) => (a.evaluation?.score || 0) >= 80);
  const improvements = allAnswers.filter((a) => (a.evaluation?.score || 0) < 80);

  return (
    <div style={{ width: '100%', maxWidth: 840, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Trophy size={28} color={T.yellow} />
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>
            Mock Interview Completed
          </h1>
        </div>
        <p style={{ color: T.textMuted, fontSize: 14, margin: 0 }}>
          Performance evaluation across all {allAnswers.length} mock technical questions
        </p>
      </div>

      {/* Score Card */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: '28px 48px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <ScoreGauge score={avgScore} T={T} />
          <div style={{ marginTop: 12 }}>
            <div style={{ color: T.textPrimary, fontSize: 16, fontWeight: 750 }}>
              Overall Composite Score
            </div>
            <div style={{ color: T.textMuted, fontSize: 13, marginTop: 3 }}>
              Calculated across {allAnswers.length} responses
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Improvements Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18, marginBottom: 32 }}>
        {/* Strengths */}
        <div
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 22,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <h3 style={{ color: T.emeraldText, fontSize: 14, fontWeight: 750, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} /> Strong Answers ({strengths.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {strengths.map((a, i) => (
              <div key={i} style={{ padding: '10px 12px', backgroundColor: T.emeraldBg, borderRadius: 8, border: `1px solid ${T.emeraldBorder}` }}>
                <div style={{ color: T.textPrimary, fontSize: 13, fontWeight: 650, marginBottom: 2 }}>
                  {a.evaluation?.score}% · {a.question?.questionText?.slice(0, 60)}…
                </div>
                <div style={{ color: T.textMuted, fontSize: 11.5 }}>
                  {a.evaluation?.feedback}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 22,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <h3 style={{ color: T.yellowText, fontSize: 14, fontWeight: 750, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} /> Key Growth Areas ({improvements.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {improvements.length > 0 ? (
              improvements.map((a, i) => (
                <div key={i} style={{ padding: '10px 12px', backgroundColor: T.yellowBg, borderRadius: 8, border: `1px solid ${T.yellowBorder}` }}>
                  <div style={{ color: T.textPrimary, fontSize: 13, fontWeight: 650, marginBottom: 2 }}>
                    {a.evaluation?.score}% · {a.question?.questionText?.slice(0, 60)}…
                  </div>
                  <div style={{ color: T.textMuted, fontSize: 11.5 }}>
                    {a.evaluation?.feedback}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: T.textMuted, fontSize: 13, margin: 0 }}>
                No significant weaknesses detected. Excellent job!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
        <button
          onClick={() => navigate('/interview')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 22px',
            borderRadius: 10,
            border: `1px solid ${T.border}`,
            backgroundColor: T.surface,
            color: T.textPrimary,
            fontWeight: 650,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <MessageSquare size={15} /> Practice Again
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 24px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: T.buttonPrimaryBg,
            color: T.buttonPrimaryText,
            fontWeight: 750,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <LayoutDashboard size={15} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
}
