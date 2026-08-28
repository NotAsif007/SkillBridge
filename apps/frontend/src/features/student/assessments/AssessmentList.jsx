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

function AssessmentSkeleton({ T, isDark }) {
  return (
    <div
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minHeight: 180,
      }}
      className="animate-pulse"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ height: 16, width: '50%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 4 }} />
        <div style={{ height: 20, width: 70, backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 999 }} />
      </div>
      <div style={{ height: 14, width: '70%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 4 }} />
      <div style={{ height: 38, width: '100%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 8, marginTop: 'auto' }} />
    </div>
  );
}

export default function AssessmentList() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [aRes, attRes] = await Promise.all([
        studentApi.getAssessments(),
        api.get('/assessments/attempts/me').catch(() => ({ data: [] })),
      ]);
      const aList = Array.isArray(aRes) ? aRes : aRes?.data || [];
      const attList = Array.isArray(attRes) ? attRes : attRes?.data || [];
      setAssessments(aList);
      setAttempts(attList);
    } catch (err) {
      console.warn('Assessment fetch notice:', err);
    } finally {
      setLoading(false);
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
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 650,
                border: active ? `1px solid ${T.yellow}` : `1px solid ${T.border}`,
                backgroundColor: active ? T.yellowBg : T.surface,
                color: active ? T.yellowText : T.textMuted,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Assessment Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {loading && assessments.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <AssessmentSkeleton key={i} T={T} isDark={isDark} />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((item) => {
            const diffCfg = getDifficultyConfig(item.difficulty);
            const prevAttempt = attemptMap[item._id];

            return (
              <div
                key={item._id}
                className="card-hover"
                style={{
                  backgroundColor: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: T.indigoText, letterSpacing: '0.04em' }}>
                      {item.skillName || item.skillId?.name || 'Programming'}
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 750, color: T.textPrimary }}>
                      {item.title}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: diffCfg.text,
                      backgroundColor: diffCfg.bg,
                      border: `1px solid ${diffCfg.border}`,
                      padding: '3px 9px',
                      borderRadius: 9999,
                    }}
                  >
                    {diffCfg.label}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.textMuted, margin: '8px 0 18px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={13} style={{ color: T.teal }} /> {item.durationMinutes || 20} mins
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <FileQuestion size={13} style={{ color: T.indigo }} /> {item.questions?.length || item.totalQuestions || 10} Questions
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Award size={13} style={{ color: T.yellow }} /> Pass: {item.passingScore || 70}%
                  </span>
                </div>

                {prevAttempt && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      backgroundColor: prevAttempt.passed ? T.emeraldBg : T.yellowBg,
                      border: `1px solid ${prevAttempt.passed ? T.emeraldBorder : T.yellowBorder}`,
                      color: prevAttempt.passed ? T.emeraldText : T.yellowText,
                      fontSize: 12,
                      fontWeight: 650,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <CheckCircle2 size={14} /> Previous Score: {prevAttempt.score}% ({prevAttempt.passed ? 'Passed' : 'Needs Retake'})
                  </div>
                )}

                <button
                  onClick={() => navigate(`/assessments/${item._id}`)}
                  style={{
                    marginTop: 'auto',
                    width: '100%',
                    padding: '10px 0',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: prevAttempt?.passed ? T.surfaceSubtle : T.buttonPrimaryBg,
                    color: prevAttempt?.passed ? T.textPrimary : T.buttonPrimaryText,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{prevAttempt?.passed ? 'Retake Assessment' : 'Start Assessment'}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: T.textMuted }}>
            No assessments found for this filter level.
          </div>
        )}
      </div>
    </div>
  );
}
