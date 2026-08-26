/**
 * MilestoneTimeline.jsx — Vertical Roadmap Timeline
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 */
import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

export default function MilestoneTimeline({ milestones = [], onToggleTask }) {
  const { isDark } = useTheme();
  const T = getTokens(isDark);

  const [expanded, setExpanded] = useState(() => new Set(milestones.map((m) => m._id)));

  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div style={{ position: 'relative' }}>
      {/* Vertical connector line */}
      <div
        style={{
          position: 'absolute',
          left: 21,
          top: 24,
          bottom: 24,
          width: 2,
          backgroundColor: T.border,
          zIndex: 0,
        }}
      />

      {milestones.map((milestone) => {
        const isExpanded = expanded.has(milestone._id);
        const completedTasks = milestone.tasks?.filter((t) => t.isCompleted).length || 0;
        const totalTasks = milestone.tasks?.length || 0;
        const allCompleted = totalTasks > 0 && completedTasks === totalTasks;

        return (
          <div key={milestone._id} style={{ position: 'relative', paddingLeft: 56, marginBottom: 14 }}>
            {/* Week Badge Node */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 14,
                width: 44,
                height: 44,
                borderRadius: '50%',
                zIndex: 1,
                backgroundColor: allCompleted ? T.emeraldBg : T.yellowBg,
                border: `2px solid ${allCompleted ? T.emerald : T.yellow}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                boxShadow: isDark ? '0 0 12px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, lineHeight: 1 }}>WK</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: allCompleted ? T.emeraldText : T.yellowText,
                  lineHeight: 1,
                  marginTop: 2,
                }}
              >
                {milestone.weekNumber}
              </span>
            </div>

            {/* Milestone Card */}
            <div
              style={{
                backgroundColor: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <button
                onClick={() => toggle(milestone._id)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {allCompleted ? (
                    <CheckCircle2 size={18} color={T.emerald} />
                  ) : (
                    <Circle size={18} color={T.yellow} />
                  )}
                  <span style={{ color: T.textPrimary, fontSize: 14.5, fontWeight: 700 }}>
                    {milestone.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>
                    {completedTasks}/{totalTasks} tasks
                  </span>
                  {isExpanded ? <ChevronDown size={15} color={T.textMuted} /> : <ChevronRight size={15} color={T.textMuted} />}
                </div>
              </button>

              {isExpanded && milestone.tasks && milestone.tasks.length > 0 && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '10px 20px 14px', backgroundColor: T.surfaceSubtle }}>
                  {milestone.tasks.map((task, ti) => (
                    <div
                      key={task.taskId || ti}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 0',
                        borderBottom: ti < milestone.tasks.length - 1 ? `1px solid ${T.borderSubtle}` : 'none',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => onToggleTask && onToggleTask(task.taskId, task.isCompleted)}
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: T.yellow,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          color: task.isCompleted ? T.textMuted : T.textPrimary,
                          fontSize: 13,
                          textDecoration: task.isCompleted ? 'line-through' : 'none',
                          flex: 1,
                        }}
                      >
                        {task.title}
                      </span>
                      {task.isCompleted && <CheckCircle2 size={14} color={T.emerald} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
