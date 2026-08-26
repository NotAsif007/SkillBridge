/**
 * AssessmentResult.jsx — Assessment Score & Feedback
 * Receives result from AssessmentTake via router state.
 */
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, TrendingUp, Map } from 'lucide-react';

const T = {
  appBg:'#0B0F17', surface:'#111827', border:'#1F2937',
  textPrimary:'#F9FAFB', textMuted:'#9CA3AF', blue:'#2563EB',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
  red:'#DC2626', redBg:'rgba(220,38,38,0.12)', redText:'#F87171',
};

function ScoreGauge({ score, passed }) {
  const r = 50, cx = 66, cy = 66;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const stroke = passed ? T.emerald : T.red;
  return (
    <svg width={132} height={132} viewBox="0 0 132 132">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={10}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cx - 6} textAnchor="middle" fill={T.textPrimary} fontSize="28" fontWeight="800">{score}</text>
      <text x={cx} y={cx + 14} textAnchor="middle" fill={T.textMuted} fontSize="11">/ 100</text>
    </svg>
  );
}

export default function AssessmentResult() {
  const { state: result } = useLocation();
  const navigate = useNavigate();

  if (!result) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center', background: T.appBg, minHeight: '100vh' }}>
        <div style={{ color: T.textMuted, fontSize: 16, marginBottom: 20 }}>No result data found.</div>
        <Link to="/assessments" style={{ color: T.blue, fontSize: 14 }}>← Back to Assessments</Link>
      </div>
    );
  }

  const { score, passed, feedback, skillUpdated } = result;

  return (
    <div style={{ padding: '48px 40px', background: T.appBg, minHeight: '100vh', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        {/* Pass/Fail badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 20px', borderRadius: 9999, marginBottom: 24, background: passed ? T.emeraldBg : T.redBg }}>
          {passed ? <CheckCircle2 size={18} color={T.emeraldText} /> : <XCircle size={18} color={T.redText} />}
          <span style={{ fontSize: 16, fontWeight: 700, color: passed ? T.emeraldText : T.redText }}>
            {passed ? 'Passed!' : 'Not Passed'}
          </span>
        </div>

        <ScoreGauge score={score} passed={passed} />
        <div style={{ color: T.textPrimary, fontSize: 18, fontWeight: 600, marginTop: 12 }}>Assessment Score</div>
      </div>

      {/* Feedback */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24, marginBottom: 16 }}>
        <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: '0 0 10px' }}>Feedback</h3>
        <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{feedback}</p>
      </div>

      {/* Skill updated */}
      {skillUpdated && (
        <div style={{ background: T.emeraldBg, border: `1px solid ${T.emerald}40`, borderRadius: 10, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <TrendingUp size={24} color={T.emeraldText} />
          <div>
            <div style={{ color: T.emeraldText, fontWeight: 600, fontSize: 15 }}>Skill Level Updated!</div>
            <div style={{ color: T.textMuted, fontSize: 13, marginTop: 2 }}>
              <strong style={{ color: T.textPrimary }}>{skillUpdated.skillName}</strong> is now Level {skillUpdated.newProficiencyLevel}
              {skillUpdated.verified && <span style={{ marginLeft: 8, color: T.emeraldText }}>· Verified ✓</span>}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate('/assessments')} style={{ flex: 1, padding: '12px 0', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textPrimary, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          ← Back to Assessments
        </button>
        <button onClick={() => navigate('/roadmap')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <Map size={15} /> View Roadmap
        </button>
      </div>
    </div>
  );
}
