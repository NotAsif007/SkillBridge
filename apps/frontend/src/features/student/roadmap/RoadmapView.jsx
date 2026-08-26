/**
 * RoadmapView.jsx — Personalized Learning Roadmap
 * API: GET /api/v1/roadmaps/me | PUT /api/v1/roadmaps/tasks/:taskId/toggle | POST /api/v1/roadmaps/generate
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Map, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';
import { studentApi } from '../../../api/student';
import api from '../../../api/client';
import MilestoneTimeline from './MilestoneTimeline';

const T = {
  appBg:'#F5F5F7', surface:'#FFFFFF', border:'#E5E5EA',
  textPrimary:'#1D1D1F', textMuted:'#6E6E73', blue:'#1D1D1F',
  emerald:'#059669', emeraldBg: '#ECFDF5', emeraldText: '#059669',
  teal:'#0D9488', tealText: '#0D9488',
  amber:'#D97706', amberBg: '#FFFBEB', amberText: '#D97706',
};

const MOCK_ROADMAP = {
  _id: 'r1', targetCareer: 'Full Stack Developer',
  overallProgress: 45, totalMilestones: 8, completedMilestones: 3,
  milestones: [
    { _id: 'm1', weekNumber: 1, title: 'Advanced Async JavaScript & Event Loop', isCompleted: true, tasks: [
      { taskId: 't101', title: 'Microtasks and Promises deep dive', isCompleted: true },
      { taskId: 't102', title: 'Web Workers and Concurrency', isCompleted: true },
    ]},
    { _id: 'm2', weekNumber: 2, title: 'System Design: Monolith vs Microservices & Caching', isCompleted: false, tasks: [
      { taskId: 't201', title: 'Redis caching strategies', isCompleted: false },
      { taskId: 't202', title: 'Database indexing and sharding', isCompleted: false },
      { taskId: 't203', title: 'Load balancing fundamentals', isCompleted: false },
    ]},
    { _id: 'm3', weekNumber: 3, title: 'Docker & Containerization', isCompleted: false, tasks: [
      { taskId: 't301', title: 'Docker images and containers', isCompleted: false },
      { taskId: 't302', title: 'Docker Compose for local dev', isCompleted: false },
    ]},
    { _id: 'm4', weekNumber: 4, title: 'DSA: Trees, Graphs & Dynamic Programming', isCompleted: false, tasks: [
      { taskId: 't401', title: 'Binary Trees: traversal and problems', isCompleted: false },
      { taskId: 't402', title: 'Graph BFS/DFS and shortest path', isCompleted: false },
    ]},
  ],
};

export default function RoadmapView() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentApi.getRoadmap();
      setRoadmap(res.data);
    } catch {
      setRoadmap(MOCK_ROADMAP);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoadmap(); }, [fetchRoadmap]);

  const handleToggleTask = async (taskId, currentIsCompleted) => {
    const newVal = !currentIsCompleted;
    // Optimistic update
    setRoadmap(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => ({
        ...m,
        tasks: m.tasks.map(t => t.taskId === taskId ? { ...t, isCompleted: newVal } : t),
      })),
    }));
    try {
      await studentApi.toggleTask(taskId, newVal);
    } catch {
      // revert on failure
      setRoadmap(prev => ({
        ...prev,
        milestones: prev.milestones.map(m => ({
          ...m,
          tasks: m.tasks.map(t => t.taskId === taskId ? { ...t, isCompleted: currentIsCompleted } : t),
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

  if (loading) {
    return (
      <div style={{ padding: '32px 40px' }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 80, background: T.surface, borderRadius: 10, marginBottom: 14, opacity: 0.6 }} />)}
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <Map size={48} color={T.textMuted} style={{ marginBottom: 16, opacity: 0.4 }} />
        <h2 style={{ color: T.textPrimary, fontSize: 20, marginBottom: 8 }}>No Roadmap Yet</h2>
        <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 24 }}>Set a target career and generate your personalised roadmap.</p>
        <button onClick={handleGenerate} disabled={generating} style={{ padding: '11px 24px', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <Zap size={15} style={{ marginRight: 6 }} />{generating ? 'Generating…' : 'Generate Roadmap'}
        </button>
      </div>
    );
  }

  // Recalculate progress from state
  const allTasks = roadmap.milestones.flatMap(m => m.tasks || []);
  const doneTasks = allTasks.filter(t => t.isCompleted).length;
  const liveProgress = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : roadmap.overallProgress;

  return (
    <div style={{ padding: '32px 40px', background: T.appBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>Learning Roadmap</h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 6 }}>Target: <strong style={{ color: T.blue }}>{roadmap.targetCareer}</strong></p>
        </div>
        <button onClick={handleGenerate} disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textMuted, cursor: 'pointer', fontSize: 13 }}>
          <Zap size={14} />{generating ? 'Generating…' : 'Regenerate'}
        </button>
      </div>

      {/* Progress overview */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600 }}>Overall Progress</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: T.emeraldText, letterSpacing: '-0.03em' }}>{liveProgress}%</span>
        </div>
        <div style={{ height: 10, background: T.border, borderRadius: 9999, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ width: `${liveProgress}%`, height: '100%', background: T.emerald, borderRadius: 9999, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} color={T.emerald} />
            <span style={{ color: T.textMuted, fontSize: 13 }}>{roadmap.completedMilestones} / {roadmap.totalMilestones} milestones</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} color={T.blue} />
            <span style={{ color: T.textMuted, fontSize: 13 }}>{doneTasks} / {allTasks.length} tasks</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <MilestoneTimeline milestones={roadmap.milestones} onToggleTask={handleToggleTask} />
    </div>
  );
}
