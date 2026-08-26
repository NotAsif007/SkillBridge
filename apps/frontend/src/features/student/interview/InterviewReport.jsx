/**
 * InterviewReport.jsx — Final Interview Score & Report
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, MessageSquare, LayoutDashboard, CheckCircle2, AlertTriangle } from 'lucide-react';

const T = {
  appBg:'#0B0F17', surface:'#111827', border:'#1F2937',
  textPrimary:'#F9FAFB', textMuted:'#9CA3AF', blue:'#2563EB',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
  teal:'#0D9488', tealBg:'rgba(13,148,136,0.12)', tealText:'#2DD4BF',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.12)', amberText:'#FBBF24',
};

const MOCK_REPORT = {
  allAnswers: [
    { question: 'Explain the Node.js event loop and microtasks.', answer: 'The event loop has phases...', evaluation: { score: 78, feedback: 'Good understanding of phases. Mention microtask queue.' } },
    { question: 'How would you design idempotency for payment APIs?', answer: 'Use idempotency keys...', evaluation: { score: 85, feedback: 'Excellent coverage of idempotency keys and database constraints.' } },
    { question: 'SQL vs NoSQL — when to choose each?', answer: 'SQL for structured data...', evaluation: { score: 90, feedback: 'Comprehensive comparison with clear use-case differentiation.' } },
    { question: 'Explain SOLID principles with a JS example.', answer: 'Single Responsibility...', evaluation: { score: 72, feedback: 'Good on SRP. Could strengthen O and L with code examples.' } },
    { question: 'How does React\'s virtual DOM diffing work?', answer: 'React creates a virtual DOM...', evaluation: { score: 88, feedback: 'Clear explanation of reconciliation. Mention fiber architecture for bonus.' } },
  ],
};

function ScoreGauge({ score }) {
  const r = 60, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const stroke = score >= 80 ? T.emerald : score >= 60 ? T.teal : T.amber;
  const textColor = score >= 80 ? T.emeraldText : score >= 60 ? T.tealText : T.amberText;
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={10}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cx - 6} textAnchor="middle" fill={T.textPrimary} fontSize="30" fontWeight="800">{score}</text>
      <text x={cx} y={cx + 14} textAnchor="middle" fill={T.textMuted} fontSize="11">/ 100</text>
    </svg>
  );
}

export default function InterviewReport() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const data = state || MOCK_REPORT;
  const { allAnswers = [] } = data;

  const scores = allAnswers.map(a => a.evaluation?.score || 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0;

  const strengths = allAnswers.filter(a => (a.evaluation?.score || 0) >= 80);
  const improvements = allAnswers.filter(a => (a.evaluation?.score || 0) < 70);

  return (
    <div style={{ padding: '40px 40px', background: T.appBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Trophy size={28} color={T.amberText} />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>Interview Complete!</h1>
        </div>
        <p style={{ color: T.textMuted, fontSize: 14 }}>Here's your performance breakdown across all {allAnswers.length} questions.</p>
      </div>

      {/* Score */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '28px 40px', textAlign: 'center' }}>
          <ScoreGauge score={avgScore} />
          <div style={{ marginTop: 12 }}>
            <div style={{ color: T.textPrimary, fontSize: 16, fontWeight: 600 }}>Overall Score</div>
            <div style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>Average across {allAnswers.length} answers</div>
          </div>
        </div>
      </div>

      {/* Strengths + Improvements */}
      {(strengths.length > 0 || improvements.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {strengths.length > 0 && (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
              <h3 style={{ color: T.emeraldText, fontSize: 14, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} /> Strong Answers
              </h3>
              {strengths.map((a, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < strengths.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ color: T.textPrimary, fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{a.evaluation?.score}% · {a.question?.slice(0, 50)}…</div>
                  <div style={{ color: T.textMuted, fontSize: 11 }}>{a.evaluation?.feedback?.slice(0, 80)}…</div>
                </div>
              ))}
            </div>
          )}
          {improvements.length > 0 && (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
              <h3 style={{ color: T.amberText, fontSize: 14, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={15} /> Areas to Improve
              </h3>
              {improvements.map((a, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < improvements.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ color: T.textPrimary, fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{a.evaluation?.score}% · {a.question?.slice(0, 50)}…</div>
                  <div style={{ color: T.textMuted, fontSize: 11 }}>{a.evaluation?.feedback?.slice(0, 80)}…</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Q&A Table */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: 0 }}>Answer Breakdown</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'rgba(255,255,255,0.03)' }}>
            {['#', 'Question', 'Score', 'Feedback'].map(h => <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: T.textMuted, fontWeight: 600, letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>)}
          </tr></thead>
          <tbody>
            {allAnswers.map((a, i) => {
              const s = a.evaluation?.score || 0;
              const sc = s >= 80 ? { color: T.emeraldText, bg: T.emeraldBg } : s >= 60 ? { color: T.tealText, bg: T.tealBg } : { color: T.amberText, bg: T.amberBg };
              return (
                <tr key={i} style={{ borderTop: `1px solid ${T.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 20px', color: T.textMuted, fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: '12px 20px', color: T.textPrimary, fontSize: 13, maxWidth: 300 }}>{a.question?.slice(0, 60)}{a.question?.length > 60 ? '…' : ''}</td>
                  <td style={{ padding: '12px 20px' }}><span style={{ fontSize: 12, fontWeight: 700, color: sc.color, background: sc.bg, padding: '3px 10px', borderRadius: 9999 }}>{s}%</span></td>
                  <td style={{ padding: '12px 20px', color: T.textMuted, fontSize: 12 }}>{a.evaluation?.feedback?.slice(0, 70)}{a.evaluation?.feedback?.length > 70 ? '…' : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12, maxWidth: 500 }}>
        <button onClick={() => navigate('/interview')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textPrimary, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <MessageSquare size={15} /> New Interview
        </button>
        <button onClick={() => navigate('/dashboard')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <LayoutDashboard size={15} /> View Dashboard
        </button>
      </div>
    </div>
  );
}
