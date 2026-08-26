/**
 * InterviewSetup.jsx — AI Interview Career & Difficulty Selector
 * APIs: GET /api/v1/careers | POST /api/v1/interviews | GET /api/v1/interviews/history
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { studentApi } from '../../../api/student';
import api from '../../../api/client';

const T = {
  appBg:'#F5F5F7', surface:'#FFFFFF', border:'#E5E5EA',
  textPrimary:'#1D1D1F', textMuted:'#6E6E73', blue:'#1D1D1F',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#059669',
  teal:'#0D9488', tealBg:'rgba(13,148,136,0.12)', tealText:'#0D9488',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.12)', amberText:'#D97706',
  red:'#DC2626', redBg:'rgba(220,38,38,0.12)', redText:'#DC2626',
};

const DIFFICULTIES = [
  { value: 'EASY',   label: 'Easy',   sub: 'Foundational concepts, suitable for beginners' },
  { value: 'MEDIUM', label: 'Medium', sub: 'Intermediate topics and problem solving' },
  { value: 'HARD',   label: 'Hard',   sub: 'Advanced concepts, system design, edge cases' },
];

const MOCK_HISTORY = [
  { _id: 'i1', targetCareer: 'Full Stack Developer', difficulty: 'MEDIUM', status: 'COMPLETED', overallScore: 82, createdAt: '2026-08-23T10:00:00Z' },
  { _id: 'i2', targetCareer: 'Full Stack Developer', difficulty: 'EASY', status: 'COMPLETED', overallScore: 75, createdAt: '2026-08-18T14:00:00Z' },
];

export default function InterviewSetup() {
  const [careers, setCareers] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [cRes, hRes] = await Promise.all([
        studentApi.getCareers(),
        api.get('/interviews/history'),
      ]);
      setCareers(cRes.data || []);
      setHistory(hRes.data || []);
      if (cRes.data?.length) setSelectedCareer(cRes.data[0]._id);
    } catch {
      const mockCareers = [{ _id: 'c1', title: 'Full Stack Developer' }, { _id: 'c2', title: 'Data Scientist' }];
      setCareers(mockCareers);
      setHistory(MOCK_HISTORY);
      setSelectedCareer('c1');
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStart = async () => {
    if (!selectedCareer) return;
    setStarting(true);
    setError('');
    try {
      const res = await studentApi.startInterview({ targetCareerId: selectedCareer, difficulty });
      navigate('/interview/session', { state: res.data });
    } catch (err) {
      setError(err?.message || 'Failed to start interview. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div style={{ padding: '32px 40px', background: T.appBg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 700 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>AI Mock Interview</h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 8 }}>Practice with AI-generated questions tailored to your target career. Get scored feedback after each answer.</p>
        </div>

        {/* Setup card */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 28, marginBottom: 24 }}>
          <h2 style={{ color: T.textPrimary, fontSize: 16, fontWeight: 600, margin: '0 0 20px' }}>Session Setup</h2>

          {/* Career select */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: T.textMuted, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target Career</label>
            <select value={selectedCareer} onChange={e => setSelectedCareer(e.target.value)}
              style={{ width: '100%', background: T.appBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 14px', color: T.textPrimary, fontSize: 14, outline: 'none' }}>
              {careers.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: T.textMuted, fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Difficulty</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {DIFFICULTIES.map(d => {
                const active = difficulty === d.value;
                return (
                  <button key={d.value} onClick={() => setDifficulty(d.value)} style={{
                    flex: 1, padding: '12px 10px', border: `2px solid ${active ? T.blue : T.border}`,
                    borderRadius: 9, background: active ? `${T.blue}18` : T.appBg,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ color: active ? T.blue : T.textPrimary, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
                    <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.4 }}>{d.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div style={{ color: T.redText, fontSize: 13, marginBottom: 14 }}>{error}</div>}

          <button onClick={handleStart} disabled={!selectedCareer || starting} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 0', border: 'none', borderRadius: 8,
            background: selectedCareer ? T.blue : T.border,
            color: selectedCareer ? '#fff' : T.textMuted,
            fontWeight: 700, fontSize: 15, cursor: selectedCareer ? 'pointer' : 'not-allowed',
          }}>
            <MessageSquare size={18} /> {starting ? 'Starting Interview…' : 'Start Interview'}
            {!starting && <ChevronRight size={16} />}
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}` }}>
              <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: 0 }}>Past Interviews</h3>
            </div>
            {history.map((session, i) => {
              const sc = session.overallScore >= 80 ? { color: T.emeraldText, bg: T.emeraldBg } : session.overallScore >= 60 ? { color: T.tealText, bg: T.tealBg } : { color: T.amberText, bg: T.amberBg };
              return (
                <div key={session._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ display: 'flex', items: 'center', gap: 14 }}>
                    <div>
                      <div style={{ color: T.textPrimary, fontSize: 13, fontWeight: 500 }}>{session.targetCareer || 'Interview'}</div>
                      <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>
                        {session.difficulty} · {new Date(session.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  {session.overallScore != null && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: sc.color, background: sc.bg, padding: '4px 12px', borderRadius: 9999 }}>
                      {session.overallScore}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
