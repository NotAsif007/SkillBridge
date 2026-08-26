/**
 * MilestoneTimeline.jsx — Vertical Roadmap Timeline (Presentational)
 * Props: { milestones, onToggleTask }
 */
import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';

const T = {
  surface:'#111827', border:'#1F2937', textPrimary:'#F9FAFB', textMuted:'#9CA3AF',
  blue:'#2563EB', emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
};

export default function MilestoneTimeline({ milestones = [], onToggleTask }) {
  const [expanded, setExpanded] = useState(() => new Set(milestones.map(m => m._id)));

  const toggle = (id) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div style={{ position: 'relative' }}>
      {/* Vertical connector line */}
      <div style={{ position: 'absolute', left: 20, top: 24, bottom: 24, width: 2, background: T.border, zIndex: 0 }} />

      {milestones.map((milestone, mi) => {
        const isExpanded = expanded.has(milestone._id);
        const completedTasks = milestone.tasks?.filter(t => t.isCompleted).length || 0;
        const totalTasks = milestone.tasks?.length || 0;

        return (
          <div key={milestone._id} style={{ position: 'relative', paddingLeft: 52, marginBottom: 8 }}>
            {/* Week dot */}
            <div style={{
              position: 'absolute', left: 0, top: 16, width: 42, height: 42,
              borderRadius: '50%', zIndex: 1,
              background: milestone.isCompleted ? T.emeraldBg : `${T.blue}18`,
              border: `2px solid ${milestone.isCompleted ? T.emerald : T.blue}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <span style={{ fontSize: 9, color: T.textMuted, lineHeight: 1 }}>WK</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: milestone.isCompleted ? T.emeraldText : T.blue, lineHeight: 1 }}>{milestone.weekNumber}</span>
            </div>

            {/* Milestone card */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <button onClick={() => toggle(milestone._id)} style={{
                width: '100%', padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {milestone.isCompleted
                    ? <CheckCircle2 size={18} color={T.emerald} />
                    : <Circle size={18} color={T.textMuted} />
                  }
                  <span style={{ color: T.textPrimary, fontSize: 14, fontWeight: 600 }}>{milestone.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{completedTasks}/{totalTasks} tasks</span>
                  {isExpanded ? <ChevronDown size={15} color={T.textMuted} /> : <ChevronRight size={15} color={T.textMuted} />}
                </div>
              </button>

              {isExpanded && milestone.tasks && milestone.tasks.length > 0 && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '8px 20px 12px' }}>
                  {milestone.tasks.map((task, ti) => (
                    <div key={task.taskId} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 0', borderBottom: ti < milestone.tasks.length - 1 ? `1px solid ${T.border}` : 'none',
                    }}>
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => onToggleTask && onToggleTask(task.taskId, task.isCompleted)}
                        style={{ width: 16, height: 16, accentColor: T.blue, cursor: 'pointer', flexShrink: 0 }}
                      />
                      <span style={{
                        color: task.isCompleted ? T.textMuted : T.textPrimary,
                        fontSize: 13,
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                        flex: 1,
                      }}>
                        {task.title}
                      </span>
                      {task.isCompleted && <CheckCircle2 size={13} color={T.emerald} />}
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
