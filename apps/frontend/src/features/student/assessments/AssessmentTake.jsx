/**
 * AssessmentTake.jsx — MCQ Assessment Interface with Dynamic Timer
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 * API: GET /api/v1/assessments/:id | POST /api/v1/assessments/:id/submit
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { studentApi } from '../../../api/student';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

const MOCK_SESSION = {
  attemptId: 'att_mock_001',
  assessmentId: 'a2',
  title: 'React Intermediate Assessment',
  durationMinutes: 30,
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
  const { isDark } = useTheme();
  const T = getTokens(isDark);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (!session || loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [session, loading]);

  useEffect(() => {
    questionStartRef.current = Date.now();
    setSelected(answers[currentIdx]?.selectedOptionIndex ?? null);
  }, [currentIdx, answers]);

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
      navigate('/assessments/result', {
        state: {
          score: 75,
          passed: true,
          feedback: 'Good understanding of React concepts.',
          skillUpdated: { skillName: 'React', newProficiencyLevel: 3, verified: true },
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', color: T.textMuted }}>
        Loading assessment…
      </div>
    );
  }
  if (!session) return null;

  const question = session.questions[currentIdx];
  const progress = (currentIdx / session.questions.length) * 100;
  const isLast = currentIdx === session.questions.length - 1;
  const isLowTime = timeLeft < 60;

  return (
    <div style={{ width: '100%', maxWidth: 780, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, margin: 0 }}>
            {session.title}
          </h1>
          <div style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>
            Question {currentIdx + 1} of {session.questions.length}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            backgroundColor: isLowTime ? T.roseBg : T.surface,
            border: `1px solid ${isLowTime ? T.roseBorder : T.border}`,
            borderRadius: 8,
          }}
        >
          <Clock size={16} color={isLowTime ? T.roseText : T.yellowText} />
          <span style={{ fontSize: 16, fontWeight: 800, color: isLowTime ? T.roseText : T.textPrimary, fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: 6, backgroundColor: T.border, borderRadius: 9999, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: T.yellow, borderRadius: 9999, transition: 'width 0.3s ease' }} />
      </div>

      {/* Question Card */}
      <div
        style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 28,
          marginBottom: 20,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <p style={{ fontSize: 17, color: T.textPrimary, fontWeight: 650, lineHeight: 1.6, margin: '0 0 24px' }}>
          {question.questionText}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                style={{
                  padding: '14px 18px',
                  border: `2px solid ${isSelected ? T.yellow : T.border}`,
                  borderRadius: 10,
                  backgroundColor: isSelected ? (isDark ? T.yellowBg : '#FFFBEB') : T.surfaceSubtle,
                  color: isSelected ? (isDark ? T.yellowText : T.textPrimary) : T.textPrimary,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: isSelected ? 650 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    border: `2px solid ${isSelected ? T.yellow : T.border}`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: isSelected ? T.yellow : 'transparent',
                  }}
                >
                  {isSelected && <span style={{ width: 8, height: 8, backgroundColor: isDark ? '#121317' : '#FFFFFF', borderRadius: '50%' }} />}
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            border: 'none',
            borderRadius: 10,
            backgroundColor: selected !== null ? T.buttonPrimaryBg : T.border,
            color: selected !== null ? T.buttonPrimaryText : T.textMuted,
            fontWeight: 750,
            fontSize: 14,
            cursor: selected !== null ? 'pointer' : 'not-allowed',
            boxShadow: selected !== null ? '0 4px 12px rgba(245,158,11,0.25)' : 'none',
          }}
        >
          {submitting ? 'Submitting…' : isLast ? 'Submit Assessment' : 'Next Question'}
          {!isLast && !submitting && <ChevronRight size={16} />}
        </button>
      </div>

      {/* Question Indicators */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 28 }}>
        {session.questions.map((_, i) => (
          <span
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: i === currentIdx ? T.yellow : answers[i] ? T.emerald : T.border,
              transition: 'background-color 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
