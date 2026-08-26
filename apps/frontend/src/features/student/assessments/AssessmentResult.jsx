/**
 * AssessmentResult.jsx — Assessment Score & Feedback
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 */
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, TrendingUp, Map } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

function ScoreGauge({ score, passed, T }) {
  const r = 50, cx = 66, cy = 66;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const stroke = passed ? T.emerald : T.rose;

  return (
    <svg width={132} height={132} viewBox="0 0 132 132">
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
      <text x={cx} y={cx - 6} textAnchor="middle" fill={T.textPrimary} fontSize="28" fontWeight="800">
        {score}
      </text>
      <text x={cx} y={cx + 14} textAnchor="middle" fill={T.textMuted} fontSize="11" fontWeight="600">
        / 100
      </text>
    </svg>
  );
}

export default function AssessmentResult() {
  const { state: result } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const T = getTokens(isDark);

  if (!result) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ color: T.textMuted, fontSize: 16, marginBottom: 20 }}>No result data found.</div>
        <Link to="/assessments" style={{ color: T.yellowText, fontSize: 14, textDecoration: 'none', fontWeight: 650 }}>
          ← Back to Assessments
        </Link>
      </div>
    );
  }

  const { score, passed, feedback, skillUpdated } = result;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        {/* Pass/Fail badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 20px',
            borderRadius: 9999,
            marginBottom: 24,
            backgroundColor: passed ? T.emeraldBg : T.roseBg,
            border: `1px solid ${passed ? T.emeraldBorder : T.roseBorder}`,
          }}
        >
          {passed ? <CheckCircle2 size={18} color={T.emeraldText} /> : <XCircle size={18} color={T.roseText} />}
          <span style={{ fontSize: 16, fontWeight: 800, color: passed ? T.emeraldText : T.roseText }}>
            {passed ? 'Passed!' : 'Not Passed'}
          </span>
        </div>

        <ScoreGauge score={score} passed={passed} T={T} />
        <div style={{ color: T.textPrimary, fontSize: 18, fontWeight: 750, marginTop: 12 }}>
          Assessment Score
        </div>
      </div>

      {/* Feedback */}
      <div
        style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 750, margin: '0 0 10px' }}>
          Diagnostic Feedback
        </h3>
        <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          {feedback}
        </p>
      </div>

      {/* Skill updated */}
      {skillUpdated && (
        <div
          style={{
            backgroundColor: T.emeraldBg,
            border: `1px solid ${T.emeraldBorder}`,
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <TrendingUp size={24} color={T.emeraldText} />
          <div>
            <div style={{ color: T.emeraldText, fontWeight: 750, fontSize: 15 }}>
              Skill Level Verified!
            </div>
            <div style={{ color: T.textMuted, fontSize: 13, marginTop: 2 }}>
              <strong style={{ color: T.textPrimary }}>{skillUpdated.skillName}</strong> is now verified at Level {skillUpdated.newProficiencyLevel}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 14 }}>
        <button
          onClick={() => navigate('/assessments')}
          style={{
            flex: 1,
            padding: '12px 0',
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            backgroundColor: T.surface,
            color: T.textPrimary,
            fontWeight: 650,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          ← Back to Assessments
        </button>

        <button
          onClick={() => navigate('/roadmap')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 0',
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
          <Map size={15} /> View Roadmap
        </button>
      </div>
    </div>
  );
}
