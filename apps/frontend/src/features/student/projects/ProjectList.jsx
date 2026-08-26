/**
 * ProjectList.jsx — Student Project Portfolio
 * APIs: GET /api/v1/projects | GET /api/v1/projects/recommendations
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Github, Globe, Zap, FolderOpen, ExternalLink } from 'lucide-react';
import { studentApi } from '../../../api/student';
import api from '../../../api/client';
import ProjectModal from './ProjectModal';

const T = {
  appBg:'#0B0F17', surface:'#111827', border:'#1F2937',
  textPrimary:'#F9FAFB', textMuted:'#9CA3AF', blue:'#2563EB',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#34D399',
  teal:'#0D9488', tealBg:'rgba(13,148,136,0.12)', tealText:'#2DD4BF',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.12)', amberText:'#FBBF24',
};

const MOCK_PROJECTS = [
  { _id: 'p1', title: 'Real-Time Collaboration Tool', description: 'Collaborative canvas using WebSockets and Redis Pub/Sub for real-time multi-user editing.', technologies: ['Node.js', 'React', 'Socket.io', 'Redis'], githubUrl: 'https://github.com', liveUrl: 'https://demo.app', evaluationScore: 88 },
  { _id: 'p2', title: 'E-Commerce Microservices', description: 'Event-driven checkout and order processing service with Docker Compose orchestration.', technologies: ['Node.js', 'Docker', 'RabbitMQ', 'MongoDB'], githubUrl: 'https://github.com', liveUrl: '', evaluationScore: 76 },
  { _id: 'p3', title: 'AI Resume Screener', description: 'Machine learning pipeline to rank resumes against job descriptions using NLP.', technologies: ['Python', 'FastAPI', 'scikit-learn', 'React'], githubUrl: 'https://github.com', liveUrl: '', evaluationScore: 65 },
];

const MOCK_RECOMMENDATIONS = [
  { title: 'Distributed Task Queue', description: 'Build a Celery-style task queue with Redis as broker. Closes Docker and Redis skill gaps.', skillsAddressed: ['Docker', 'Redis', 'System Design'] },
  { title: 'CI/CD Pipeline Setup', description: 'Implement GitHub Actions + Docker multi-stage build for an existing project.', skillsAddressed: ['Docker', 'DevOps', 'GitHub Actions'] },
];

function scoreColor(score) {
  if (score >= 80) return { color: T.emeraldText, bg: T.emeraldBg };
  if (score >= 60) return { color: T.tealText, bg: T.tealBg };
  return { color: T.amberText, bg: T.amberBg };
}

function ProjectCard({ project }) {
  const sc = scoreColor(project.evaluationScore);
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: 0, flex: 1, marginRight: 10 }}>{project.title}</h3>
        {project.evaluationScore != null && (
          <span style={{ fontSize: 12, fontWeight: 700, color: sc.color, background: sc.bg, padding: '3px 10px', borderRadius: 9999, flexShrink: 0 }}>
            {project.evaluationScore}
          </span>
        )}
      </div>
      <p style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.5, margin: '0 0 12px', flex: 1 }}>{project.description}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {project.technologies.map(t => (
          <span key={t} style={{ fontSize: 11, color: T.blue, background: `${T.blue}18`, padding: '2px 8px', borderRadius: 9999 }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.textMuted, textDecoration: 'none' }}>
            <Github size={13} /> GitHub
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.blue, textDecoration: 'none' }}>
            <Globe size={13} /> Live Demo <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        studentApi.getProjects(),
        api.get('/projects/recommendations'),
      ]);
      setProjects(pRes.data || []);
      setRecommendations(rRes.data || []);
    } catch {
      setProjects(MOCK_PROJECTS);
      setRecommendations(MOCK_RECOMMENDATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div style={{ padding: '32px 40px' }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 180, background: T.surface, borderRadius: 10, marginBottom: 16, opacity: 0.6 }} />)}
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', background: T.appBg, minHeight: '100vh' }}>
      {showModal && <ProjectModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); fetchData(); }} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>Project Portfolio</h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 6 }}>{projects.length} project{projects.length !== 1 ? 's' : ''} · Contributes 15% to readiness score</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <Plus size={15} /> Add Project
        </button>
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <div style={{ background: T.surface, border: `1px dashed ${T.border}`, borderRadius: 10, padding: '60px 40px', textAlign: 'center', marginBottom: 28 }}>
          <FolderOpen size={48} color={T.textMuted} style={{ marginBottom: 16, opacity: 0.4 }} />
          <h3 style={{ color: T.textPrimary, fontSize: 18, marginBottom: 8 }}>No Projects Yet</h3>
          <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 24 }}>Add your first project to start building your portfolio and boost your readiness score.</p>
          <button onClick={() => setShowModal(true)} style={{ padding: '10px 24px', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            <Plus size={14} style={{ marginRight: 6 }} />Add Your First Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
          {projects.map(p => <ProjectCard key={p._id} project={p} />)}
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Zap size={18} color={T.amberText} />
            <h2 style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, margin: 0 }}>AI-Recommended Projects</h2>
            <span style={{ fontSize: 12, color: T.textMuted }}>Based on your skill gaps</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recommendations.map((rec, i) => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.amberBg || T.border}`, borderLeft: `3px solid ${T.amber}`, borderRadius: 10, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <h4 style={{ color: T.textPrimary, fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>{rec.title}</h4>
                  <p style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.5, margin: '0 0 10px' }}>{rec.description}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(rec.skillsAddressed || []).map(s => (
                      <span key={s} style={{ fontSize: 11, color: T.amberText, background: T.amberBg, padding: '2px 8px', borderRadius: 9999 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowModal(true)} style={{ flexShrink: 0, padding: '8px 14px', border: `1px solid ${T.border}`, borderRadius: 7, background: 'transparent', color: T.textMuted, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
                  Start Project
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
