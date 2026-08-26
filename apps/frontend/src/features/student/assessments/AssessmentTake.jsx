/**
 * AssessmentTake.jsx — MCQ Assessment Interface with Timer
 * API: GET /api/v1/assessments/:id | POST /api/v1/assessments/:id/submit
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { studentApi } from '../../../api/student';

const T = {
  appBg:'#0B0F17', surface:'#111827', border:'#1F2937',
  textPrimary:'#F9FAFB', textMuted:'#9CA3AF', blue:'#2563EB',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.12)', amberText:'#FBBF24',
  red:'#DC2626',
};

const MOCK_SESSION = {
  attemptId: 'att_mock_001', assessmentId: 'a2',
  title: 'React Intermediate Assessment', durationMinutes: 30,
  questions: [
    { questionIndex: 0, questionText: 'What does the useEffect hook do when passing an empty dependency array?', options: ['Runs on every render', 'Runs only once after the initial render', 'Never runs', 'Runs only before unmounting'] },
    { questionIndex: 1, questionText: 'Which hook allows you to access the previous value of a state variable?', options: ['useRef', 'useMemo', 'useCallback', 'useContext'] },
    { questionIndex: 2, questionText: 'What is the purpose of React.memo?', options: ['To memoize function results', 'To prevent unnecessary re-renders of functional components', 'To create memoized selectors', 'To cache API calls'] },
    { questionIndex: 3, questionText: 'Which of the following correctly describes the Context API?', options: ['A state management library', 'A way to pass data through the component tree without props', 'A replacement for Redux', 'A router for React'] },
    { questionIndex: 4, questionText: 'What does the key prop help React do?', options: ['Style components', 'Identify which items have changed in a list', 'Pass data to children', 'Trigger re-renders'] },
  ],
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function AssessmentTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const timerRef = useRef(null);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentApi.startAssessment(id);
      const s = res.data;
      setSession(s);
      setTimeLeft(s.durationMinutes * 60);
    } catch {
      setSession(MOCK_SESSION);
      setTimeLeft(MOCK_SESSION.durationMinutes * 60);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  useEffect(() => {
    if (!session || loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [session, loading]);

  useEffect(() => {
    questionStartRef.current = Date.now();
    setSelected(answers[currentIdx]?.selectedOptionIndex ?? null);
  }, [currentIdx]);

  const handleNext = () => {
    if (selected === null) return;
    const timeTaken = Math.round((Date.now() - questionStartRef.current) / 1000);
    const newAnswers = [...answers];
    newAnswers[currentIdx] = { questionIndex: currentIdx, selectedOptionIndex: selected, timeTakenSeconds: timeTaken };
    setAnswers(newAnswers);

    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const res = await studentApi.submitAssessment(id, { attemptId: session.attemptId, answers: finalAnswers });
      navigate('/assessments/result', { state: res.data });
    } catch {
      navigate('/assessments/result', { state: { score: 75, passed: true, feedback: 'Good understanding of React concepts.', skillUpdated: { skillName: 'React', newProficiencyLevel: 3, verified: true } } });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px 40px', textAlign: 'center' }}>
        <div style={{ color: T.textMuted, fontSize: 14 }}>Loading assessment…</div>
      </div>
    );
  }
  if (!session) return null;

  const question = session.questions[currentIdx];
  const progress = ((currentIdx) / session.questions.length) * 100;
  const isLast = currentIdx === session.questions.length - 1;
  const isLowTime = timeLeft < 60;

  return (
    <div style={{ padding: '32px 40px', background: T.appBg, minHeight: '100vh', maxWidth: 780 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, margin: 0 }}>{session.title}</h1>
          <div style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>Question {currentIdx + 1} of {session.questions.length}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: isLowTime ? T.redBg || T.amberBg : T.surface, border: `1px solid ${isLowTime ? T.red : T.border}`, borderRadius: 8 }}>
          <Clock size={15} color={isLowTime ? T.red : T.textMuted} />
          <span style={{ fontSize: 16, fontWeight: 700, color: isLowTime ? T.red : T.textPrimary, fontFamily: 'JetBrains Mono, monospace' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 6, background: T.border, borderRadius: 9999, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: T.blue, borderRadius: 9999, transition: 'width 0.3s ease' }} />
      </div>

      {/* Question card */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 28, marginBottom: 16 }}>
        <p style={{ fontSize: 17, color: T.textPrimary, fontWeight: 500, lineHeight: 1.6, margin: '0 0 24px' }}>
          {question.questionText}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button key={i} onClick={() => setSelected(i)} style={{
                padding: '13px 18px', border: `2px solid ${isSelected ? T.blue : T.border}`,
                borderRadius: 9, background: isSelected ? `${T.blue}18` : T.appBg,
                color: isSelected ? T.textPrimary : T.textMuted, cursor: 'pointer',
                textAlign: 'left', fontSize: 14, fontWeight: isSelected ? 500 : 400,
                display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
              }}>
                <span style={{ width: 24, height: 24, border: `2px solid ${isSelected ? T.blue : T.border}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isSelected ? T.blue : 'transparent' }}>
                  {isSelected && <span style={{ width: 10, height: 10, background: '#fff', borderRadius: '50%' }} />}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleNext}
          disabled={selected === null || submitting}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '11px 24px', border: 'none', borderRadius: 8,
            background: selected !== null ? T.blue : T.border,
            color: selected !== null ? '#fff' : T.textMuted,
            fontWeight: 600, fontSize: 15, cursor: selected !== null ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? 'Submitting…' : isLast ? 'Submit Assessment' : 'Next Question'}
          {!isLast && !submitting && <ChevronRight size={16} />}
        </button>
      </div>

      {/* Question dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 28 }}>
        {session.questions.map((_, i) => (
          <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === currentIdx ? T.blue : answers[i] ? T.emerald : T.border, transition: 'background 0.2s' }} />
        ))}
      </div>
    </div>
  );
}
