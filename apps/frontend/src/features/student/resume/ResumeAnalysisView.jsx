/**
 * ResumeAnalysisView.jsx — ATS Score & Analysis Display
 * APIs: GET /api/v1/resumes/latest | GET /api/v1/resumes/history
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, FileText, UploadCloud } from 'lucide-react';
import api from '../../../api/client';

const T = {
  appBg:'#0B0F17', surface:'#111827', border:'#1F2937',
  textPrimary:'#F9FAFB', textMuted:'#9CA3AF', blue:'#2563EB',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
  teal:'#0D9488', tealBg:'rgba(13,148,136,0.12)', tealText:'#2DD4BF',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.12)', amberText:'#FBBF24',
  red:'#DC2626', redBg:'rgba(220,38,38,0.12)', redText:'#F87171',
};

function readinessColor(score) {
  if (score >= 80) return { text: T.emeraldText, bg: T.emeraldBg, stroke: T.emerald };
  if (score >= 60) return { text: T.tealText, bg: T.tealBg, stroke: T.teal };
  return { text: T.amberText, bg: T.amberBg, stroke: T.amber };
}

function ATSGauge({ score }) {
  const r = 55, cx = 75, cy = 75;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const c = readinessColor(score);
  return (
    <svg width={150} height={150} viewBox="0 0 150 150">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.stroke} strokeWidth={10}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill={T.textPrimary} fontSize="26" fontWeight="800">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={T.textMuted} fontSize="10">ATS Score</text>
    </svg>
  );
}

const MOCK_RESUME = {
  resumeId: 'r1', fileName: 'Alex_Chen_Resume.pdf', score: 78,
  analysis: {
    extractedSkills: ['JavaScript', 'React', 'Node.js', 'Docker', 'MongoDB', 'Git', 'REST APIs'],
    strengths: ['Strong quantifiable impact in project bullet points', 'Clean ATS-friendly formatting', 'Clear section hierarchy'],
    weaknesses: ['Missing cloud deployment metrics (AWS/GCP)', 'Summary could highlight target role more clearly', 'No GitHub/portfolio links'],
    recommendations: ['Add numbers showing latency improvement in backend project', 'Include links to live demos in project section', 'Quantify impact: "reduced API response time by 40%"', 'Add a concise professional summary targeting Full Stack Developer roles'],
  },
};

const MOCK_HISTORY = [
  { _id: 'h1', fileName: 'Alex_Chen_Resume.pdf', score: 78, createdAt: '2026-08-24T10:00:00Z' },
  { _id: 'h2', fileName: 'Alex_Chen_Resume_v1.pdf', score: 62, createdAt: '2026-08-10T10:00:00Z' },
];

export default function ResumeAnalysisView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [resume, setResume] = useState(state || null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(!state);

  const fetchData = useCallback(async () => {
    try {
      const [latestRes, histRes] = await Promise.all([api.get('/resumes/latest'), api.get('/resumes/history')]);
      setResume(latestRes.data);
      setHistory(histRes.data || []);
    } catch {
      setResume(MOCK_RESUME);
      setHistory(MOCK_HISTORY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!state) fetchData(); else { setLoading(false); api.get('/resumes/history').then(r => setHistory(r.data || [])).catch(() => setHistory(MOCK_HISTORY)); } }, [state, fetchData]);

  if (loading) {
    return <div style={{ padding: '32px 40px' }}>{[1,2,3].map(i => <div key={i} style={{ height: 120, background: T.surface, borderRadius: 10, marginBottom: 16, opacity: 0.6 }} />)}</div>;
  }

  if (!resume) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center', background: T.appBg, minHeight: '100vh' }}>
        <FileText size={48} color={T.textMuted} style={{ marginBottom: 16, opacity: 0.4 }} />
        <h2 style={{ color: T.textPrimary, marginBottom: 8 }}>No Resume Uploaded</h2>
        <button onClick={() => navigate('/resume')} style={{ padding: '10px 24px', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Upload Resume
        </button>
      </div>
    );
  }

  const { fileName, score, analysis } = resume;
  const c = readinessColor(score);

  return (
    <div style={{ padding: '32px 40px', background: T.appBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>Resume Analysis</h1>
          {fileName && <p style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>{fileName}</p>}
        </div>
        <button onClick={() => navigate('/resume')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textMuted, cursor: 'pointer', fontSize: 13 }}>
          <UploadCloud size={14} /> Upload New
        </button>
      </div>

      {/* Score + Skills row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ATSGauge score={score} />
          <span style={{ fontSize: 11, fontWeight: 700, color: c.text, background: c.bg, padding: '3px 12px', borderRadius: 9999, marginTop: 8 }}>
            {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
          </span>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24 }}>
          <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Extracted Skills ({analysis?.extractedSkills?.length || 0})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {(analysis?.extractedSkills || []).map(s => (
              <span key={s} style={{ fontSize: 12, color: T.blue, background: `${T.blue}18`, padding: '4px 12px', borderRadius: 9999 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24 }}>
          <h3 style={{ color: T.emeraldText, fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Strengths</h3>
          {(analysis?.strengths || []).map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <CheckCircle2 size={15} color={T.emerald} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24 }}>
          <h3 style={{ color: T.amberText, fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Areas to Improve</h3>
          {(analysis?.weaknesses || []).map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={15} color={T.amber} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.5 }}>{w}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24, marginBottom: 24 }}>
        <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Recommendations</h3>
        {(analysis?.recommendations || []).map((rec, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < analysis.recommendations.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: `${T.blue}20`, color: T.blue, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.5 }}>{rec}</span>
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}` }}>
            <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: 0 }}>Upload History</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['File', 'ATS Score', 'Date'].map(h => <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: T.textMuted, fontWeight: 600, letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>)}
            </tr></thead>
            <tbody>
              {history.map((h, i) => {
                const hc = readinessColor(h.score);
                return (
                  <tr key={h._id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: '12px 20px', color: T.textPrimary, fontSize: 13 }}>{h.fileName}</td>
                    <td style={{ padding: '12px 20px' }}><span style={{ fontSize: 12, fontWeight: 700, color: hc.text, background: hc.bg, padding: '3px 10px', borderRadius: 9999 }}>{h.score}</span></td>
                    <td style={{ padding: '12px 20px', color: T.textMuted, fontSize: 13 }}>{new Date(h.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
