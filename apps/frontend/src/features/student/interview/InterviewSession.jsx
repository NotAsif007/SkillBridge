/**
 * InterviewSession.jsx — Split-screen AI Interview Q&A
 * Design: DESIGN.md §4.4 Split-screen workspace layout
 */
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight, Star } from 'lucide-react';
import { studentApi } from '../../../api/student';

const T = {
  appBg:'#0B0F17', surface:'#111827', border:'#1F2937',
  textPrimary:'#F9FAFB', textMuted:'#9CA3AF', blue:'#2563EB',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
  teal:'#0D9488', tealBg:'rgba(13,148,136,0.12)', tealText:'#2DD4BF',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.12)', amberText:'#FBBF24',
};

const MOCK_FIRST_Q = {
  interviewId: 'mock-interview-1', status: 'IN_PROGRESS', questionNumber: 1, totalQuestions: 5,
  question: { _id: 'q1', questionText: 'Can you explain how the Node.js event loop handles asynchronous I/O and where microtasks fit in?', skillTested: 'Node.js' },
};

export default function InterviewSession() {
  const { state: initialSession } = useLocation();
  const navigate = useNavigate();
  const session = initialSession || MOCK_FIRST_Q;

  const [question, setQuestion] = useState(session.question);
  const [questionNum, setQuestionNum] = useState(session.questionNumber || 1);
  const [totalQuestions] = useState(session.totalQuestions || 5);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [allAnswers, setAllAnswers] = useState([]);

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await studentApi.submitInterviewAnswer(session.interviewId, {
        questionId: question._id,
        studentAnswer: answer,
      });
      const result = res.data;
      const newAnswers = [...allAnswers, { question: question.questionText, answer, evaluation: result.evaluation }];
      setAllAnswers(newAnswers);
      setEvaluation(result.evaluation);
      setIsCompleted(result.isCompleted);
      if (!result.isCompleted && result.nextQuestion) {
        // Don't advance yet — show evaluation first
      }
      if (result.isCompleted) {
        // Keep on page to show "View Report" button
      }
    } catch {
      // Mock evaluation
      const mockEval = { score: 78, feedback: 'Good understanding of the event loop phases. Mention microtask queue executing between tasks for a complete answer.' };
      const newAnswers = [...allAnswers, { question: question.questionText, answer, evaluation: mockEval }];
      setAllAnswers(newAnswers);
      setEvaluation(mockEval);
      setIsCompleted(questionNum >= totalQuestions);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isCompleted) {
      navigate('/interview/report', { state: { allAnswers, totalQuestions } });
      return;
    }
    try {
      const res = await studentApi.submitInterviewAnswer(session.interviewId, { questionId: question._id, studentAnswer: answer });
      if (res.data.nextQuestion) {
        setQuestion(res.data.nextQuestion);
        setQuestionNum(q => q + 1);
        setAnswer('');
        setEvaluation(null);
      }
    } catch {
      // Mock next question
      const mockQs = [
        { _id: 'q2', questionText: 'How would you design an idempotency mechanism for payment endpoints?', skillTested: 'System Design' },
        { _id: 'q3', questionText: 'Explain the difference between SQL and NoSQL databases. When would you choose each?', skillTested: 'Databases' },
        { _id: 'q4', questionText: 'What are the SOLID principles? Give an example of applying one in JavaScript.', skillTested: 'Software Engineering' },
        { _id: 'q5', questionText: 'How does React\'s reconciliation algorithm (virtual DOM diffing) work?', skillTested: 'React' },
      ];
      const next = mockQs[questionNum - 1];
      if (next && questionNum < totalQuestions) {
        setQuestion(next);
        setQuestionNum(q => q + 1);
        setAnswer('');
        setEvaluation(null);
      } else {
        navigate('/interview/report', { state: { allAnswers, totalQuestions } });
      }
    }
  };

  const scoreColor = (s) => s >= 80 ? T.emeraldText : s >= 60 ? T.tealText : T.amberText;
  const scoreBg = (s) => s >= 80 ? T.emeraldBg : s >= 60 ? T.tealBg : T.amberBg;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 60px)' }}>
      {/* Progress bar */}
      <div style={{ height: 4, background: T.border }}>
        <div style={{ width: `${(questionNum / totalQuestions) * 100}%`, height: '100%', background: T.blue, transition: 'width 0.3s' }} />
      </div>

      {/* Split screen */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* LEFT — Question */}
        <div style={{ width: '40%', background: T.surface, borderRight: `1px solid ${T.border}`, padding: '36px 32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>Question {questionNum} of {totalQuestions}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.tealText, background: T.tealBg, padding: '3px 10px', borderRadius: 9999 }}>
                {question?.skillTested}
              </span>
            </div>
            {/* Question dots */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 24 }}>
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <span key={i} style={{ flex: 1, height: 3, borderRadius: 9999, background: i < questionNum ? T.blue : T.border }} />
              ))}
            </div>
            <p style={{ color: T.textPrimary, fontSize: 18, fontWeight: 500, lineHeight: 1.65, margin: 0 }}>
              {question?.questionText}
            </p>
          </div>
          <div style={{ marginTop: 'auto', background: `${T.blue}10`, border: `1px solid ${T.border}`, borderRadius: 8, padding: '12px 16px' }}>
            <p style={{ color: T.textMuted, fontSize: 12, lineHeight: 1.5, margin: 0 }}>
              💡 Take your time to structure your answer. Cover key concepts, give examples, and be specific.
            </p>
          </div>
        </div>

        {/* RIGHT — Answer */}
        <div style={{ flex: 1, background: T.appBg, padding: '36px 36px', display: 'flex', flexDirection: 'column' }}>
          <label style={{ display: 'block', fontSize: 12, color: T.textMuted, fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Answer</label>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={!!evaluation}
            placeholder="Type your answer here. Be thorough and specific — the AI evaluates technical depth, problem-solving, and clarity…"
            style={{
              flex: 1, minHeight: 240, background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: '16px 18px', color: T.textPrimary, fontSize: 14,
              lineHeight: 1.65, resize: 'none', outline: 'none', fontFamily: 'inherit',
              opacity: evaluation ? 0.7 : 1,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span style={{ color: T.textMuted, fontSize: 12 }}>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
            {!evaluation ? (
              <button onClick={handleSubmit} disabled={!answer.trim() || submitting} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '11px 24px', border: 'none', borderRadius: 8,
                background: answer.trim() ? T.blue : T.border,
                color: answer.trim() ? '#fff' : T.textMuted,
                fontWeight: 600, fontSize: 14, cursor: answer.trim() ? 'pointer' : 'not-allowed',
              }}>
                {submitting ? 'Evaluating…' : 'Submit Answer'} {!submitting && <ChevronRight size={16} />}
              </button>
            ) : (
              <button onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 24px', border: 'none', borderRadius: 8, background: isCompleted ? T.emerald : T.blue, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                {isCompleted ? 'View Report →' : 'Next Question →'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Evaluation card */}
      {evaluation && (
        <div style={{ background: T.surface, borderTop: `1px solid ${T.border}`, padding: '24px 36px' }}>
          <div style={{ maxWidth: 900, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: scoreBg(evaluation.score), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor(evaluation.score) }}>{evaluation.score}</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: T.textPrimary, fontSize: 14, fontWeight: 600 }}>AI Evaluation</span>
                <span style={{ fontSize: 11, color: scoreColor(evaluation.score), background: scoreBg(evaluation.score), padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>
                  {evaluation.score}/100
                </span>
              </div>
              <p style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{evaluation.feedback}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
