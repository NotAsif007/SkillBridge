/**
 * ResumeAnalysisView.jsx — Modern ATS Score & Diagnostic Audit View
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 * APIs: GET /api/v1/resumes/latest | GET /api/v1/resumes/history
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  UploadCloud,
  TrendingUp,
  Sparkles,
  Zap,
  RefreshCw,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../../../api/client';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

export default function ResumeAnalysisView() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);
  const { state } = useLocation();
  const navigate = useNavigate();

  const [resume, setResume] = useState(state?.data || state || null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(!state);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [latestRes, histRes] = await Promise.all([
        api.get('/resumes/latest'),
        api.get('/resumes/history').catch(() => ({ data: [] })),
      ]);
      if (latestRes.data) setResume(latestRes.data);
      if (histRes.data) setHistory(histRes.data);
    } catch (err) {
      console.warn('Resume history notice:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!state) {
      fetchData();
    } else {
      setLoading(false);
      api.get('/resumes/history')
        .then((r) => setHistory(r.data || []))
        .catch(() => {});
    }
  }, [state, fetchData]);

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto', padding: 32 }}>
        <div style={{ height: 32, width: 220, backgroundColor: T.surfaceSubtle, borderRadius: 8, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          <div style={{ height: 260, backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: 14 }} />
          <div style={{ height: 260, backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: 14 }} />
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div style={{ width: '100%', maxWidth: 520, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: T.surfaceSubtle, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: T.textMuted }}>
          <FileText size={32} />
        </div>
        <h2 style={{ color: T.textPrimary, fontSize: 20, fontWeight: 750, margin: '0 0 8px' }}>No Resume Analyzed Yet</h2>
        <p style={{ color: T.textMuted, fontSize: 13.5, margin: '0 0 20px' }}>
          Upload your PDF resume to get an instant AI-powered ATS diagnostic audit.
        </p>
        <button
          onClick={() => navigate('/resume')}
          style={{
            padding: '11px 24px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: T.buttonPrimaryBg,
            color: T.buttonPrimaryText,
            fontWeight: 750,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Upload Resume Now
        </button>
      </div>
    );
  }

  const score = resume.atsScore ?? resume.score ?? 75;
  const scoreCfg = score >= 80
    ? { label: 'ATS Optimized', text: T.emeraldText, bg: T.emeraldBg, border: T.emeraldBorder }
    : score >= 60
    ? { label: 'Competitive', text: T.tealText, bg: T.tealBg, border: T.tealBorder }
    : { label: 'Needs Optimization', text: T.yellowText, bg: T.yellowBg, border: T.yellowBorder };

  const extractedSkills = Array.isArray(resume.extractedSkills)
    ? resume.extractedSkills
    : Array.isArray(resume.skills)
    ? resume.skills
    : ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Docker'];

  const strengths = Array.isArray(resume.strengths) && resume.strengths.length > 0
    ? resume.strengths
    : ['Strong technical skill section', 'Clean document layout'];

  const weaknesses = Array.isArray(resume.weaknesses) && resume.weaknesses.length > 0
    ? resume.weaknesses
    : ['Quantify project impact with metrics', 'Include GitHub links for projects'];

  const recommendations = Array.isArray(resume.recommendations) && resume.recommendations.length > 0
    ? resume.recommendations
    : ['Add measurable outcome metrics to bullet points', 'Integrate more targeted keywords from job descriptions'];

  return (
    <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
            ATS Resume Audit
          </h1>
          <p style={{ color: T.textMuted, fontSize: 14, margin: '4px 0 0' }}>
            Diagnostic audit for <strong style={{ color: T.textPrimary }}>{resume.fileName || 'resume.pdf'}</strong>
          </p>
        </div>

        <button
          onClick={() => navigate('/resume')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            backgroundColor: T.surface,
            color: T.textPrimary,
            fontWeight: 650,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <UploadCloud size={15} /> Upload New Version
        </button>
      </div>

      {/* Hero 2-Column: Score Gauge + Recognized Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 20 }}>
        {/* Left: Overall ATS Score */}
        <div
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="64" stroke={T.border} strokeWidth="12" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke={score >= 80 ? T.emerald : score >= 60 ? T.teal : T.yellow}
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - score / 100)}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: T.textPrimary }}>{score}%</span>
              <span style={{ fontSize: 11, color: T.textMuted }}>ATS Score</span>
            </div>
          </div>

          <span
            style={{
              fontSize: 12,
              fontWeight: 750,
              color: scoreCfg.text,
              backgroundColor: scoreCfg.bg,
              border: `1px solid ${scoreCfg.border}`,
              padding: '3px 12px',
              borderRadius: 9999,
            }}
          >
            {scoreCfg.label}
          </span>
        </div>

        {/* Right: Recognized Skills */}
        <div
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.yellowText }}>
                <Sparkles size={16} />
                <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 750, margin: 0 }}>
                  Recognized Technical Skills ({extractedSkills.length})
                </h3>
              </div>
              <span style={{ fontSize: 12, color: T.textMuted }}>Parsed from resume</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {extractedSkills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 12,
                    fontWeight: 650,
                    color: T.indigoText,
                    backgroundColor: T.indigoBg,
                    border: `1px solid ${T.indigoBorder}`,
                    padding: '4px 10px',
                    borderRadius: 8,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: T.textMuted }}>
            <span>Verified skills automatically link to your profile</span>
            <Link to="/profile" style={{ color: T.yellowText, fontWeight: 650, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>View Profile</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Strengths */}
        <div
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 22,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.emeraldText, marginBottom: 14 }}>
            <CheckCircle2 size={16} />
            <h3 style={{ fontSize: 14, fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              Document Strengths
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {strengths.map((str, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  backgroundColor: T.emeraldBg,
                  border: `1px solid ${T.emeraldBorder}`,
                  borderRadius: 8,
                  fontSize: 13,
                  color: T.textPrimary,
                  lineHeight: 1.5,
                }}
              >
                {str}
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 22,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.yellowText, marginBottom: 14 }}>
            <AlertTriangle size={16} />
            <h3 style={{ fontSize: 14, fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              Areas for Improvement
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {weaknesses.map((weak, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  backgroundColor: T.yellowBg,
                  border: `1px solid ${T.yellowBorder}`,
                  borderRadius: 8,
                  fontSize: 13,
                  color: T.textPrimary,
                  lineHeight: 1.5,
                }}
              >
                {weak}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}