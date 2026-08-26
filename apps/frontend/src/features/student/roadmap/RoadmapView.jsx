/**
 * RoadmapView.jsx — Personalized Learning Roadmap
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 * API: GET /api/v1/roadmaps/me | PUT /api/v1/roadmaps/tasks/:taskId/toggle | POST /api/v1/roadmaps/generate
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Map, RefreshCw, Zap, CheckCircle2, Sparkles } from 'lucide-react';
import { studentApi } from '../../../api/student';
import api from '../../../api/client';
import MilestoneTimeline from './MilestoneTimeline';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

const MOCK_ROADMAP = {
  _id: 'r1',
  targetCareer: 'Full Stack Developer',
  overallProgress: 45,
  totalMilestones: 4,
  completedMilestones: 1,
  milestones: [
    {
      _id: 'm1',
      weekNumber: 1,
      title: 'Advanced Async JavaScript & Event Loop',
      isCompleted: true,
      tasks: [
        { taskId: 't101', title: 'Microtasks and Promises deep dive', isCompleted: true },
        { taskId: 't102', title: 'Web Workers and Concurrency', isCompleted: true },
      ],
    },
    {
      _id: 'm2',
      weekNumber: 2,
      title: 'System Design: Monolith vs Microservices & Caching',
      isCompleted: false,
      tasks: [
        { taskId: 't201', title: 'Redis caching strategies', isCompleted: false },
        { taskId: 't202', title: 'Database indexing and sharding', isCompleted: false },
        { taskId: 't203', title: 'Load balancing fundamentals', isCompleted: false },
      ],
    },
    {
      _id: 'm3',
      weekNumber: 3,
      title: 'Docker & Containerization',
      isCompleted: false,
      tasks: [
        { taskId: 't301', title: 'Docker images and containers', isCompleted: false },
        { taskId: 't302', title: 'Docker Compose for local dev', isCompleted: false },
      ],
    },
    {
      _id: 'm4',
      weekNumber: 4,
      title: 'DSA: Trees, Graphs & Dynamic Programming',
      isCompleted: false,
      tasks: [
        { taskId: 't401', title: 'Binary Trees: traversal and problems', isCompleted: false },
        { taskId: 't402', title: 'Graph BFS/DFS and shortest path', isCompleted: false },
      ],
    },
  ],
};

export default function RoadmapView() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);

  const [roadmap, setRoadmap] = useState(MOCK_ROADMAP);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentApi.getRoadmap();
      if (res?.data) setRoadmap(res.data);
    } catch {
      // Retain mock fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const handleToggleTask = async (taskId, currentIsCompleted) => {
    const newVal = !currentIsCompleted;
    setRoadmap((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => ({
        ...m,
        tasks: m.tasks.map((t) => (t.taskId === taskId ? { ...t, isCompleted: newVal } : t)),
      })),
    }));

    try {
      await studentApi.toggleTask(taskId, newVal);
    } catch {
      setRoadmap((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) => ({
          ...m,
          tasks: m.tasks.map((t) => (t.taskId === taskId ? { ...t, isCompleted: currentIsCompleted } : t)),
        })),
      }));
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/roadmaps/generate');
      await fetchRoadmap();
    } catch {
      await fetchRoadmap();
    } finally {
      setGenerating(false);
    }
  };

  const progress = roadmap.overallProgress || 45;

  return (
    <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
            Personalized Roadmap
          </h1>
          <p style={{ color: T.textMuted, fontSize: 14, margin: '4px 0 0' }}>
            Structured step-by-step milestones tailored to bridge your skill gaps for <strong style={{ color: T.yellowText }}>{roadmap.targetCareer || 'Full Stack Developer'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchRoadmap}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              backgroundColor: T.surface,
              color: T.textPrimary,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>

          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 20px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: T.buttonPrimaryBg,
              color: T.buttonPrimaryText,
              fontSize: 13,
              fontWeight: 750,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Zap size={14} /> {generating ? 'Regenerating…' : 'Regenerate Plan'}
          </button>
        </div>
      </div>

      {/* Progress Overview Card */}
      <div
        style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: '24px 28px',
          marginBottom: 32,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: T.indigoText, letterSpacing: '0.04em' }}>
              Overall Progress
            </span>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, marginTop: 2 }}>
              {progress}% Completed
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: 13, color: T.textMuted }}>
            <span>{roadmap.completedMilestones || 1} of {roadmap.totalMilestones || 4} milestones mastered</span>
          </div>
        </div>

        <div style={{ height: 8, backgroundColor: T.surfaceSubtle, borderRadius: 9999, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: T.yellow,
              borderRadius: 9999,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>

      {/* Milestones Timeline */}
      <MilestoneTimeline milestones={roadmap.milestones || []} onToggleTask={handleToggleTask} />
    </div>
  );
}
