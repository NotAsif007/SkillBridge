/**
 * InterviewSetup.jsx — AI Mock Interview Setup & History
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 * APIs: GET /api/v1/careers | POST /api/v1/interviews | GET /api/v1/interviews/history
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { studentApi } from '../../../api/student';
import api from '../../../api/client';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy', sub: 'Foundational concepts, suitable for quick warm-ups' },
  { value: 'MEDIUM', label: 'Medium', sub: 'Intermediate problem solving and real-world architectures' },
  { value: 'HARD', label: 'Hard', sub: 'Advanced edge-cases, system design & high-scale tradeoffs' },
];

const MOCK_HISTORY = [
  { _id: 'i1', targetCareer: 'Full Stack Developer', difficulty: 'MEDIUM', status: 'COMPLETED', overallScore: 82, createdAt: '2026-08-23T10:00:00Z' },
  { _id: 'i2', targetCareer: 'Full Stack Developer', difficulty: 'EASY', status: 'COMPLETED', overallScore: 75, createdAt: '2026-08-18T14:00:00Z' },
];

export default function InterviewSetup() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);
  const navigate = useNavigate();

  const [careers, setCareers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, hRes] = await Promise.all([
        studentApi.getCareers(),
        api.get('/interviews/history').catch(() => ({ data: [] })),
      ]);
      const cList = Array.isArray(cRes) ? cRes : cRes?.data || [];
      const hList = Array.isArray(hRes) ? hRes : hRes?.data || [];
      setCareers(cList);
      setHistory(hList);
      if (cList.length) setSelectedCareer(cList[0]._id);
    } catch (err) {
      console.warn('Interview setup fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStart = async () => {
    if (!selectedCareer) return;
    setStarting(true);
    setError('');
    try {
      const res = await studentApi.startInterview({
        careerId: selectedCareer,
        targetCareerId: selectedCareer,
        difficulty,
      });
      const sessionData = res.data || res;
      navigate('/interview/session', { state: sessionData });
    } catch (err) {
      setError(err?.message || 'Failed to start interview. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
          AI Mock Interview
        </h1>
        <p style={{ color: T.textMuted, fontSize: 14, margin: '6px 0 0' }}>
          Practice technical and system design rounds tailored to your target career with instant AI evaluations
        </p>
      </div>

      {/* Setup Card */}
      <div
        style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 28,
          marginBottom: 28,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <h2 style={{ color: T.textPrimary, fontSize: 16, fontWeight: 750, margin: '0 0 20px' }}>
          Configure Mock Session
        </h2>

        {/* Target Career Selection */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 12, color: T.textMuted, fontWeight: 650, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Target Career
          </label>
          <select
            value={selectedCareer}
            onChange={(e) => setSelectedCareer(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: T.surfaceSubtle,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: '11px 14px',
              color: T.textPrimary,
              fontSize: 14,
              outline: 'none',
            }}
          >
            {careers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Selection */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, color: T.textMuted, fontWeight: 650, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Difficulty Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  style={{
                    padding: '14px 12px',
                    border: `2px solid ${active ? T.yellow : T.border}`,
                    borderRadius: 10,
                    backgroundColor: active ? (isDark ? T.yellowBg : '#FFFBEB') : T.surfaceSubtle,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ color: active ? T.yellowText : T.textPrimary, fontSize: 14, fontWeight: 750, marginBottom: 4 }}>
                    {d.label}
                  </div>
                  <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.4 }}>
                    {d.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{ color: T.roseText, backgroundColor: T.roseBg, border: `1px solid ${T.roseBorder}`, padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 18 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!selectedCareer || starting}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '13px 0',
            border: 'none',
            borderRadius: 10,
            backgroundColor: selectedCareer ? T.buttonPrimaryBg : T.border,
            color: selectedCareer ? T.buttonPrimaryText : T.textMuted,
            fontWeight: 750,
            fontSize: 15,
            cursor: selectedCareer ? 'pointer' : 'not-allowed',
            boxShadow: selectedCareer ? '0 4px 14px rgba(245,158,11,0.25)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <MessageSquare size={18} /> {starting ? 'Generating AI Questions…' : 'Start Mock Interview'}
          {!starting && <ChevronRight size={16} />}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, backgroundColor: T.surfaceSubtle }}>
            <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 750, margin: 0 }}>
              Past Mock Interview Records
            </h3>
          </div>

          <div>
            {history.map((session, i) => {
              const sc = session.overallScore >= 80
                ? { color: T.emeraldText, bg: T.emeraldBg, border: T.emeraldBorder }
                : session.overallScore >= 60
                ? { color: T.tealText, bg: T.tealBg, border: T.tealBorder }
                : { color: T.yellowText, bg: T.yellowBg, border: T.yellowBorder };

              return (
                <div
                  key={session._id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 24px',
                    borderBottom: i < history.length - 1 ? `1px solid ${T.border}` : 'none',
                  }}
                >
                  <div>
                    <div style={{ color: T.textPrimary, fontSize: 14, fontWeight: 650 }}>
                      {session.targetCareer || 'Interview'}
                    </div>
                    <div style={{ color: T.textMuted, fontSize: 11.5, marginTop: 2 }}>
                      {session.difficulty} · {new Date(session.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {session.overallScore != null && (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 750,
                        color: sc.color,
                        backgroundColor: sc.bg,
                        border: `1px solid ${sc.border}`,
                        padding: '4px 12px',
                        borderRadius: 9999,
                      }}
                    >
                      {session.overallScore}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
