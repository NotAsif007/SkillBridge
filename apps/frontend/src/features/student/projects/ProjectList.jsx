/**
 * ProjectList.jsx — Student Project Portfolio
 * Dynamic Apple Light and Multi-Accent Yellow Graphite Dark Mode
 * APIs: GET /api/v1/projects | GET /api/v1/projects/recommendations
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Github, Globe, Zap, FolderOpen, ExternalLink, Sparkles, Award } from 'lucide-react';
import { studentApi } from '../../../api/student';
import api from '../../../api/client';
import ProjectModal from './ProjectModal';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

const MOCK_PROJECTS = [
  {
    _id: 'p1',
    title: 'Real-Time Collaborative Workspace',
    description: 'Engineered a collaborative canvas using WebSockets, Node.js, and Redis Pub/Sub for synchronized multi-user state.',
    technologies: ['React', 'Node.js', 'Socket.io', 'Redis'],
    githubUrl: 'https://github.com/suraj/collab-canvas',
    liveUrl: 'https://collab-canvas.demo.app',
    evaluationScore: 85,
  },
];

const MOCK_RECOMMENDATIONS = [
  {
    title: 'Distributed Asynchronous Task Queue',
    description: 'Build a background worker system with Redis and PostgreSQL to master concurrency, rate limiting, and backoff retries.',
    skillsAddressed: ['Node.js', 'Redis', 'System Design'],
  },
  {
    title: 'Containerized Microservices Pipeline',
    description: 'Containerize services with Docker and automate CI/CD testing and deployment via GitHub Actions.',
    skillsAddressed: ['Docker', 'DevOps', 'CI/CD'],
  },
];

function ProjectCard({ project, T }) {
  const score = project.evaluationScore || 80;
  const scoreCfg = score >= 80
    ? { text: T.emeraldText, bg: T.emeraldBg, border: T.emeraldBorder }
    : score >= 60
    ? { text: T.tealText, bg: T.tealBg, border: T.tealBorder }
    : { text: T.yellowText, bg: T.yellowBg, border: T.yellowBorder };

  return (
    <div
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <h3 style={{ color: T.textPrimary, fontSize: 16, fontWeight: 750, margin: 0, letterSpacing: '-0.01em', flex: 1, marginRight: 10 }}>
          {project.title}
        </h3>
        {project.evaluationScore != null && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: scoreCfg.text,
              backgroundColor: scoreCfg.bg,
              border: `1px solid ${scoreCfg.border}`,
              padding: '3px 10px',
              borderRadius: 9999,
              flexShrink: 0,
            }}
          >
            {project.evaluationScore}/100
          </span>
        )}
      </div>

      <p style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>
        {project.description}
      </p>

      {/* Tech Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
        {(project.technologies || []).map((t) => (
          <span
            key={t}
            style={{
              fontSize: 11,
              fontWeight: 650,
              color: T.indigoText,
              backgroundColor: T.indigoBg,
              border: `1px solid ${T.indigoBorder}`,
              padding: '3px 8px',
              borderRadius: 6,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 0',
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              backgroundColor: T.surfaceSubtle,
              color: T.textPrimary,
              fontSize: 12,
              fontWeight: 650,
              textDecoration: 'none',
            }}
          >
            <Github size={14} /> Repository
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 0',
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              backgroundColor: T.surfaceSubtle,
              color: T.textPrimary,
              fontSize: 12,
              fontWeight: 650,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} /> Live Demo
          </a>
        )}
      </div>
    </div>
  );
}

export default function ProjectList() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);

  const [projects, setProjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, recRes] = await Promise.all([
        studentApi.getProjects(),
        api.get('/projects/recommendations').catch(() => ({ data: [] })),
      ]);
      const pList = Array.isArray(projRes) ? projRes : projRes?.data || [];
      const rList = Array.isArray(recRes) ? recRes : recRes?.data || [];
      setProjects(pList);
      setRecommendations(rList);
    } catch (err) {
      console.warn('Projects fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div style={{ width: '100%', maxWidth: 1120, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
            Project Portfolio
          </h1>
          <p style={{ color: T.textMuted, fontSize: 14, margin: '4px 0 0' }}>
            {projects.length} verified project{projects.length !== 1 ? 's' : ''} showcasing your applied engineering work
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: T.buttonPrimaryBg,
            color: T.buttonPrimaryText,
            fontWeight: 750,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Plus size={16} /> Add Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div
          style={{
            backgroundColor: T.surface,
            border: `1px dashed ${T.border}`,
            borderRadius: 14,
            padding: '60px 40px',
            textAlign: 'center',
            marginBottom: 36,
          }}
        >
          <FolderOpen size={44} color={T.textMuted} style={{ marginBottom: 14, opacity: 0.5 }} />
          <h3 style={{ color: T.textPrimary, fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>
            No Projects in Portfolio Yet
          </h3>
          <p style={{ color: T.textMuted, fontSize: 14, margin: '0 0 20px' }}>
            Add your engineering projects to showcase verified technical competency.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 22px',
              border: 'none',
              borderRadius: 8,
              backgroundColor: T.buttonPrimaryBg,
              color: T.buttonPrimaryText,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} style={{ marginRight: 6 }} /> Add Your First Project
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}
        >
          {projects.map((p) => (
            <ProjectCard key={p._id} project={p} T={T} />
          ))}
        </div>
      )}

      {/* Recommended Projects Section */}
      {recommendations.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: T.yellowBg,
                color: T.yellowText,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 750, color: T.textPrimary, margin: 0 }}>
                Recommended Engineering Projects
              </h2>
              <span style={{ fontSize: 12, color: T.textMuted }}>
                Targeted builds designed to bridge your top technical gaps
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
            {recommendations.map((rec, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: T.surface,
                  border: `1px solid ${T.border}`,
                  borderLeft: `4px solid ${T.yellow}`,
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <h4 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 750, margin: '0 0 6px' }}>
                    {rec.title}
                  </h4>
                  <p style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.55, margin: '0 0 14px' }}>
                    {rec.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {(rec.skillsAddressed || []).map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: T.yellowText,
                          backgroundColor: T.yellowBg,
                          border: `1px solid ${T.yellowBorder}`,
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                      >
                        +{s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '8px 16px',
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    backgroundColor: T.surfaceSubtle,
                    color: T.textPrimary,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 650,
                  }}
                >
                  Start Project →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Creation Dialog */}
      {showModal && (
        <ProjectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}
