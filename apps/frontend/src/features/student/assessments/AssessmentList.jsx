/**
 * AssessmentList.jsx — Available Skill Assessments & Attempt History
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 * APIs: GET /api/v1/assessments | GET /api/v1/assessments/attempts/me
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck, Clock, FileQuestion, CheckCircle2, ChevronRight,
  Sparkles, Award
} from 'lucide-react';
import { studentApi } from '../../../api/student';
import api from '../../../api/client';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

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
  const { isDark } = useTheme();
  const T = getTokens(isDark);
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState(MOCK_ASSESSMENTS);
  const [attempts, setAttempts] = useState(MOCK_ATTEMPTS);
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  const fetchData = useCallback(async () => {
    try {
      const [aRes, attRes] = await Promise.all([
        studentApi.getAssessments(),
        api.get('/assessments/attempts/me').catch(() => ({ data: MOCK_ATTEMPTS })),
      ]);
      if (aRes?.data) setAssessments(aRes.data);
      if (attRes?.data) setAttempts(attRes.data);
    } catch {
      // Retain mock fallback
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const attemptMap = {};
  attempts.forEach((a) => {
    attemptMap[a.assessmentId] = a;
  });

  const filtered = difficultyFilter === 'ALL'
    ? assessments
    : assessments.filter((a) => a.difficulty === difficultyFilter);

  const getDifficultyConfig = (diff) => {
    switch (diff) {
      case 'BEGINNER':
        return { label: 'Beginner', text: T.emeraldText, bg: T.emeraldBg, border: T.emeraldBorder };
      case 'INTERMEDIATE':
        return { label: 'Intermediate', text: T.tealText, bg: T.tealBg, border: T.tealBorder };
      case 'ADVANCED':
        return { label: 'Advanced', text: T.yellowText, bg: T.yellowBg, border: T.yellowBorder };
      default:
        return { label: diff, text: T.textMuted, bg: T.surfaceSubtle, border: T.border };
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 1120, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
          Skill Assessments
        </h1>
        <p style={{ color: T.textMuted, fontSize: 14, margin: '4px 0 0' }}>
          Take verified assessments to prove your technical capabilities and strengthen your placement index
        </p>
      </div>

      {/* Difficulty Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Levels' },
          { id: 'BEGINNER', label: 'Beginner' },
          { id: 'INTERMEDIATE', label: 'Intermediate' },
          { id: 'ADVANCED', label: 'Advanced' },
        ].map((tab) => {
          const active = difficultyFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setDifficultyFilter(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${active ? T.yellow : T.border}`,
                backgroundColor: active ? (isDark ? T.yellowBg : '#1D1D1F') : T.surface,
                color: active ? (isDark ? T.yellowText : '#FFFFFF') : T.textMuted,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Assessment List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map((assessment) => {
          const attempt = attemptMap[assessment._id];
          const diffCfg = getDifficultyConfig(assessment.difficulty);

          return (
            <div
              key={assessment._id}
              style={{
                backgroundColor: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 260 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: isDark ? T.tealBg : '#F0FDFA',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: T.tealText,
                  }}
                >
                  <ClipboardCheck size={22} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ color: T.textPrimary, fontSize: 16, fontWeight: 750, margin: 0 }}>
                      {assessment.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: diffCfg.text,
                        backgroundColor: diffCfg.bg,
                        border: `1px solid ${diffCfg.border}`,
                        padding: '2px 8px',
                        borderRadius: 9999,
                      }}
                    >
                      {diffCfg.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 16, color: T.textMuted, fontSize: 12.5, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {assessment.durationMinutes} min
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileQuestion size={12} /> {assessment.totalQuestions} questions
                    </span>
                    <span>Passing Score: <strong style={{ color: T.textPrimary }}>{assessment.passingScore}%</strong></span>
                    <span style={{ color: T.indigoText, fontWeight: 600 }}>{assessment.skillName}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                {attempt && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: attempt.passed ? T.emeraldText : T.roseText, marginBottom: 2 }}>
                      {attempt.passed && <CheckCircle2 size={13} />}
                      {attempt.passed ? 'Verified' : 'Unverified'} · {attempt.score}%
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>
                      Attempted {new Date(attempt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/assessments/${assessment._id}`)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 20px',
                    borderRadius: 9,
                    border: 'none',
                    backgroundColor: attempt ? T.surfaceSubtle : T.buttonPrimaryBg,
                    color: attempt ? T.textPrimary : T.buttonPrimaryText,
                    fontWeight: 750,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: attempt ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {attempt ? 'Retake' : 'Start'} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
