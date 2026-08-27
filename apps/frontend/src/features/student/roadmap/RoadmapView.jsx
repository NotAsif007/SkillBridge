import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Zap, CheckCircle2, Circle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { studentApi } from '../../../api/student';
import api from '../../../api/client';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

function MilestoneTimeline({ milestones, onToggleTask, T, isDark }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {milestones.map((m, idx) => {
        const isExp = expanded[idx] ?? true;
        const total = m.tasks?.length || 0;
        const completed = m.tasks?.filter((t) => t.isCompleted)?.length || 0;
        const allDone = total > 0 && completed === total;

        return (
          <div
            key={m._id || idx}
            style={{
              backgroundColor: T.surface,
              border: `1px solid ${allDone ? T.emeraldBorder : T.border}`,
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              transition: 'border-color 0.2s ease',
            }}
          >
            {/* Milestone Header */}
            <div
              onClick={() => toggleExpand(idx)}
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor: allDone ? T.emeraldBg : T.surface,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9999,
                    backgroundColor: allDone ? T.emerald : T.surfaceSubtle,
                    color: allDone ? '#FFFFFF' : T.textPrimary,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    border: `1px solid ${allDone ? T.emerald : T.border}`,
                  }}
                >
                  {allDone ? '✓' : `W${m.weekNumber || idx + 1}`}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 750, color: T.textPrimary }}>
                    {m.title}
                  </h3>
                  {m.description && (
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>
                      {m.description}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 650,
                    color: allDone ? T.emeraldText : T.textMuted,
                  }}
                >
                  {completed}/{total} tasks
                </span>
                {isExp ? <ChevronUp size={16} color={T.textMuted} /> : <ChevronDown size={16} color={T.textMuted} />}
              </div>
            </div>

            {/* Task List */}
            {isExp && m.tasks && m.tasks.length > 0 && (
              <div style={{ padding: '8px 20px 16px', borderTop: `1px solid ${T.border}` }}>
                {m.tasks.map((task) => (
                  <div
                    key={task.taskId || task._id}
                    onClick={() => onToggleTask(task.taskId, task.isCompleted)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 8px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = T.surfaceSubtle)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 size={17} style={{ color: T.emerald, flexShrink: 0 }} />
                    ) : (
                      <Circle size={17} style={{ color: T.textSubtle, flexShrink: 0 }} />
                    )}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 550,
                        color: task.isCompleted ? T.textMuted : T.textPrimary,
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RoadmapSkeleton({ T, isDark }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Progress Card Skeleton */}
      <div
        style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: '24px 28px',
          height: 110,
        }}
        className="animate-pulse"
      />
      {/* Milestones Skeletons */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            height: 76,
          }}
          className="animate-pulse"
        />
      ))}
    </div>
  );
}

export default function RoadmapView() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentApi.getRoadmap();
      if (res?.data || res) {
        setRoadmap(res?.data || res);
      }
    } catch (err) {
      console.warn('Roadmap fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const handleToggleTask = async (taskId, currentIsCompleted) => {
    if (!roadmap) return;
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
      // Revert on failure
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

  // Accurate dynamic calculations from real milestone data
  const { totalTasks, completedTasks, progress, completedMilestones, totalMilestones } = useMemo(() => {
    if (!roadmap || !roadmap.milestones) {
      return { totalTasks: 0, completedTasks: 0, progress: 0, completedMilestones: 0, totalMilestones: 0 };
    }

    const allTasks = roadmap.milestones.flatMap((m) => m.tasks || []);
    const totTasks = allTasks.length;
    const compTasks = allTasks.filter((t) => t.isCompleted).length;
    const prog = totTasks > 0 ? Math.round((compTasks / totTasks) * 100) : 0;
    const compMilestones = roadmap.milestones.filter((m) => m.tasks && m.tasks.length > 0 && m.tasks.every((t) => t.isCompleted)).length;

    return {
      totalTasks: totTasks,
      completedTasks: compTasks,
      progress: prog,
      completedMilestones: compMilestones,
      totalMilestones: roadmap.milestones.length,
    };
  }, [roadmap]);

  return (
    <div style={{ width: '100%', maxWidth: 960, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
            Personalized Roadmap
          </h1>
          <p style={{ color: T.textMuted, fontSize: 14, margin: '4px 0 0' }}>
            Structured step-by-step milestones tailored to bridge your skill gaps for <strong style={{ color: T.yellowText }}>{roadmap?.title || roadmap?.targetCareer || 'Full Stack Developer'}</strong>
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

      {loading && !roadmap ? (
        <RoadmapSkeleton T={T} isDark={isDark} />
      ) : (
        <>
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
                <span>{completedMilestones} of {totalMilestones} milestones mastered</span>
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
          {roadmap?.milestones && roadmap.milestones.length > 0 ? (
            <MilestoneTimeline milestones={roadmap.milestones} onToggleTask={handleToggleTask} T={T} isDark={isDark} />
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: T.textMuted, backgroundColor: T.surface, borderRadius: 14, border: `1px solid ${T.border}` }}>
              No roadmap generated yet. Click <strong>Regenerate Plan</strong> above to build a custom milestone path!
            </div>
          )}
        </>
      )}
    </div>
  );
}
