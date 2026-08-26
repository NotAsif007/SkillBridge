/**
 * AssessmentList.jsx — Available Assessments & Attempt History
 * APIs: GET /api/v1/assessments | GET /api/v1/assessments/attempts/me
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Clock, FileQuestion, CheckCircle2, ChevronRight } from 'lucide-react';
import { studentApi } from '../../../api/student';
import api from '../../../api/client';

const T = {
  appBg:'#0B0F17', surface:'#111827', border:'#1F2937',
  textPrimary:'#F9FAFB', textMuted:'#9CA3AF', blue:'#2563EB',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
  teal:'#0D9488', tealBg:'rgba(13,148,136,0.12)', tealText:'#2DD4BF',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.12)', amberText:'#FBBF24',
  red:'#DC2626', redBg:'rgba(220,38,38,0.12)', redText:'#F87171',
};

const DIFFICULTY_CONFIG = {
  BEGINNER:     { label: 'Beginner',     color: T.emeraldText, bg: T.emeraldBg },
  INTERMEDIATE: { label: 'Intermediate', color: T.tealText,    bg: T.tealBg },
  ADVANCED:     { label: 'Advanced',     color: T.amberText,   bg: T.amberBg },
};

const MOCK_ASSESSMENTS = [
  { _id: 'a1', title: 'JavaScript Fundamentals', skillName: 'JavaScript', difficulty: 'BEGINNER', durationMinutes: 20, totalQuestions: 10, passingScore: 70 },
  { _id: 'a2', title: 'React Intermediate Assessment', skillName: 'React', difficulty: 'INTERMEDIATE', durationMinutes: 30, totalQuestions: 15, passingScore: 70 },
  { _id: 'a3', title: 'Node.js Architecture', skillName: 'Node.js', difficulty: 'INTERMEDIATE', durationMinutes: 25, totalQuestions: 12, passingScore: 75 },
  { _id: 'a4', title: 'DSA — Arrays & Trees', skillName: 'Data Structures', difficulty: 'ADVANCED', durationMinutes: 45, totalQuestions: 20, passingScore: 65 },
  { _id: 'a5', title: 'Docker Basics', skillName: 'Docker', difficulty: 'BEGINNER', durationMinutes: 15, totalQuestions: 8, passingScore: 70 },
  { _id: 'a6', title: 'System Design Fundamentals', skillName: 'System Design', difficulty: 'ADVANCED', durationMinutes: 40, totalQuestions: 10, passingScore: 75 },
];

const MOCK_ATTEMPTS = [
  { assessmentId: 'a2', score: 90, passed: true, createdAt: '2026-08-24T14:20:00.000Z' },
  { assessmentId: 'a1', score: 85, passed: true, createdAt: '2026-08-20T10:00:00.000Z' },
];

export default function AssessmentList() {
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [aRes, attRes] = await Promise.all([
        studentApi.getAssessments(),
        api.get('/assessments/attempts/me'),
      ]);
      setAssessments(aRes.data || []);
      setAttempts(attRes.data || []);
    } catch {
      setAssessments(MOCK_ASSESSMENTS);
      setAttempts(MOCK_ATTEMPTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const attemptMap = {};
  attempts.forEach(a => { attemptMap[a.assessmentId] = a; });

  const filtered = difficultyFilter === 'ALL'
    ? assessments
    : assessments.filter(a => a.difficulty === difficultyFilter);

  if (loading) {
    return (
      <div style={{ padding: '32px 40px' }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 120, background: T.surface, borderRadius: 10, marginBottom: 14, opacity: 0.6 }} />)}
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', background: T.appBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>Skill Assessments</h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 6 }}>Take assessments to verify your skill levels and boost your readiness score.</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(d => {
          const cfg = d === 'ALL' ? { label: 'All Levels' } : DIFFICULTY_CONFIG[d];
          const active = difficultyFilter === d;
          return (
            <button key={d} onClick={() => setDifficultyFilter(d)} style={{
              padding: '7px 14px', borderRadius: 7, border: `1px solid ${active ? T.blue : T.border}`,
              background: active ? `${T.blue}18` : 'transparent',
              color: active ? T.blue : T.textMuted, fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer',
            }}>
              {cfg?.label || d}
            </button>
          );
        })}
      </div>

      {/* Assessment list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(assessment => {
          const attempt = attemptMap[assessment._id];
          const cfg = DIFFICULTY_CONFIG[assessment.difficulty] || DIFFICULTY_CONFIG.INTERMEDIATE;
          return (
            <div key={assessment._id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                <div style={{ width: 44, height: 44, background: `${T.blue}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ClipboardCheck size={22} color={T.blue} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: 0 }}>{assessment.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 9999 }}>{cfg.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, color: T.textMuted, fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {assessment.durationMinutes} min</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FileQuestion size={11} /> {assessment.totalQuestions} questions</span>
                    <span>Pass: {assessment.passingScore}%</span>
                    <span style={{ color: T.blue }}>{assessment.skillName}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {attempt && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: attempt.passed ? T.emeraldText : T.redText, marginBottom: 2 }}>
                      {attempt.passed && <CheckCircle2 size={12} />}
                      {attempt.passed ? 'Passed' : 'Failed'} · {attempt.score}%
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Last attempt: {new Date(attempt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/assessments/${assessment._id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  {attempt ? 'Retake' : 'Start'} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: T.textMuted }}>
          <ClipboardCheck size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No assessments found for this filter.</p>
        </div>
      )}
    </div>
  );
}
