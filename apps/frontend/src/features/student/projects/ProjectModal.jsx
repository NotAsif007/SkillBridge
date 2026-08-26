/**
 * ProjectModal.jsx — Add New Project Form
 * Props: { onClose, onCreated }
 */
import React, { useState } from 'react';
import { X, Plus, Github, Globe } from 'lucide-react';
import { studentApi } from '../../../api/student';

const T = {
  appBg:'#F5F5F7', surface:'#FFFFFF', border:'#E5E5EA',
  textPrimary:'#1D1D1F', textMuted:'#6E6E73', blue:'#1D1D1F',
  red:'#DC2626', redBg:'rgba(220,38,38,0.12)', redText:'#DC2626',
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: T.textMuted, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: '100%', background: T.appBg, border: `1px solid ${T.border}`, borderRadius: 7, padding: '9px 12px', color: T.textPrimary, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

export default function ProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', githubUrl: '', liveUrl: '' });
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleTechKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && techInput.trim()) {
      e.preventDefault();
      const tag = techInput.trim().replace(/,$/, '');
      if (tag && !technologies.includes(tag)) setTechnologies(prev => [...prev, tag]);
      setTechInput('');
    }
  };

  const removeTag = (tag) => setTechnologies(prev => prev.filter(t => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Project title is required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await studentApi.createProject({ ...form, technologies });
      onCreated();
    } catch (err) {
      setError(err?.message || 'Failed to create project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${T.border}` }}>
          <h2 style={{ color: T.textPrimary, fontSize: 17, fontWeight: 700, margin: 0 }}>Add Project</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, padding: 4 }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {error && (
            <div style={{ background: T.redBg, border: `1px solid ${T.red}40`, borderRadius: 7, padding: '10px 14px', marginBottom: 16, color: T.redText, fontSize: 13 }}>
              {error}
            </div>
          )}

          <Field label="Project Title *">
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Real-Time Collaboration Tool" style={inputStyle} />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Describe what this project does and what problems it solves…" rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          <Field label="Technologies (press Enter to add)">
            <div style={{ background: T.appBg, border: `1px solid ${T.border}`, borderRadius: 7, padding: '8px 10px', minHeight: 44 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: technologies.length ? 8 : 0 }}>
                {technologies.map(tag => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.textPrimary, background: `${T.blue}20`, padding: '3px 10px', borderRadius: 9999 }}>
                    {tag}
                    <X size={10} style={{ cursor: 'pointer', color: T.textMuted }} onClick={() => removeTag(tag)} />
                  </span>
                ))}
              </div>
              <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={handleTechKeyDown}
                placeholder="React, Node.js, Docker…" style={{ background: 'transparent', border: 'none', outline: 'none', color: T.textPrimary, fontSize: 14, width: '100%' }} />
            </div>
          </Field>

          <Field label="GitHub URL">
            <div style={{ position: 'relative' }}>
              <Github size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input value={form.githubUrl} onChange={e => setForm(f => ({...f, githubUrl: e.target.value}))} placeholder="https://github.com/you/project" type="url" style={{ ...inputStyle, paddingLeft: 34 }} />
            </div>
          </Field>

          <Field label="Live URL">
            <div style={{ position: 'relative' }}>
              <Globe size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input value={form.liveUrl} onChange={e => setForm(f => ({...f, liveUrl: e.target.value}))} placeholder="https://yourproject.app" type="url" style={{ ...inputStyle, paddingLeft: 34 }} />
            </div>
          </Field>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px 0', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textMuted, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 0', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              <Plus size={15} /> {submitting ? 'Adding…' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
