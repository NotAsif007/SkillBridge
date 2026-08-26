/**
 * ProjectModal.jsx — Add New Project Modal Form
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 * Props: { isOpen, onClose, onSuccess }
 */
import React, { useState } from 'react';
import { X, Plus, Github, Globe } from 'lucide-react';
import { studentApi } from '../../../api/student';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

export default function ProjectModal({ isOpen = true, onClose, onSuccess }) {
  const { isDark } = useTheme();
  const T = getTokens(isDark);

  const [form, setForm] = useState({ title: '', description: '', githubUrl: '', liveUrl: '' });
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTechKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && techInput.trim()) {
      e.preventDefault();
      const tag = techInput.trim().replace(/,$/, '');
      if (tag && !technologies.includes(tag)) setTechnologies((prev) => [...prev, tag]);
      setTechInput('');
    }
  };

  const removeTag = (tag) => setTechnologies((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Project title is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await studentApi.createProject({ ...form, technologies });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: T.surfaceSubtle,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '10px 14px',
    color: T.textPrimary,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: `1px solid ${T.border}`,
            backgroundColor: T.surfaceSubtle,
          }}
        >
          <h2 style={{ color: T.textPrimary, fontSize: 18, fontWeight: 750, margin: 0 }}>
            Add Verified Project
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ backgroundColor: T.roseBg, border: `1px solid ${T.roseBorder}`, borderRadius: 8, padding: '10px 14px', color: T.roseText, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, color: T.textMuted, fontWeight: 650, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Project Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Distributed Task Queue"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: T.textMuted, fontWeight: 650, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe technical implementation, architecture, and impact…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: T.textMuted, fontWeight: 650, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Technologies (Press Enter to add)
            </label>
            <div style={{ backgroundColor: T.surfaceSubtle, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', minHeight: 44 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: technologies.length ? 8 : 0 }}>
                {technologies.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: T.indigoText,
                      backgroundColor: T.indigoBg,
                      border: `1px solid ${T.indigoBorder}`,
                      padding: '3px 9px',
                      borderRadius: 6,
                    }}
                  >
                    {tag}
                    <X size={11} style={{ cursor: 'pointer', color: T.textMuted }} onClick={() => removeTag(tag)} />
                  </span>
                ))}
              </div>
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="React, Node.js, Redis, Docker…"
                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', color: T.textPrimary, fontSize: 13, width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: T.textMuted, fontWeight: 650, marginBottom: 6, textTransform: 'uppercase' }}>
                GitHub Repository URL
              </label>
              <input
                value={form.githubUrl}
                onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                placeholder="https://github.com/user/project"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, color: T.textMuted, fontWeight: 650, marginBottom: 6, textTransform: 'uppercase' }}>
                Live Deployment URL
              </label>
              <input
                value={form.liveUrl}
                onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))}
                placeholder="https://my-project.app"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                backgroundColor: 'transparent',
                color: T.textMuted,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 22px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: T.buttonPrimaryBg,
                color: T.buttonPrimaryText,
                fontWeight: 750,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(245,158,11,0.25)',
              }}
            >
              {submitting ? 'Saving…' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
