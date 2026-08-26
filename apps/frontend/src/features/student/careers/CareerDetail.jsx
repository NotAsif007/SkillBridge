import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Target, BarChart2, CheckCircle, AlertCircle,
  TrendingUp, Briefcase, BookOpen
} from 'lucide-react';
import { studentApi } from '../../../api/student';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  appBg:       '#0B0F17',
  surface:     '#111827',
  border:      '#1F2937',
  textPrimary: '#F9FAFB',
  textMuted:   '#9CA3AF',
  blue:        '#2563EB',
  blueHover:   '#1D4ED8',
  cobalt:      '#1E3A8A',
  emerald:     '#059669',
  emeraldBg:   'rgba(5,150,105,0.12)',
  emeraldText: '#34D399',
  teal:        '#0D9488',
  tealBg:      'rgba(13,148,136,0.12)',
  tealText:    '#2DD4BF',
  amber:       '#D97706',
  amberBg:     'rgba(217,119,6,0.12)',
  amberText:   '#FBBF24',
  red:         '#DC2626',
  redBg:       'rgba(220,38,38,0.12)',
  redText:     '#F87171',
};

// ─── Mock data (API_CONTRACT.md §3 - single career detail) ───────────────────
const MOCK_CAREER_DETAIL = {
  _id: 'career_001',
  title: 'Full Stack Developer',
  description: `Full Stack Developers design, build, and maintain both the frontend and backend of web applications. They are proficient in a range of technologies and frameworks across the entire software stack, from database management to creating responsive user interfaces. They collaborate closely with designers, product managers and backend engineers to deliver high-quality, scalable web solutions.

In this role you will architect RESTful APIs, implement authentication systems, optimize database queries and build component-driven UIs. A strong Full Stack Developer understands the trade-offs between different technologies and can make pragmatic decisions that balance performance, maintainability and developer experience.`,
  requirements: [
    { skillId: 'sk_001', skillName: 'JavaScript',  importance: 'Critical', requiredProficiency: 5, weight: 25 },
    { skillId: 'sk_002', skillName: 'React',        importance: 'Critical', requiredProficiency: 4, weight: 20 },
    { skillId: 'sk_003', skillName: 'Node.js',      importance: 'High',     requiredProficiency: 4, weight: 18 },
    { skillId: 'sk_005', skillName: 'SQL',          importance: 'High',     requiredProficiency: 3, weight: 15 },
    { skillId: 'sk_010', skillName: 'MongoDB',      importance: 'Medium',   requiredProficiency: 3, weight: 10 },
    { skillId: 'sk_006', skillName: 'TypeScript',   importance: 'High',     requiredProficiency: 3, weight: 8  },
    { skillId: 'sk_007', skillName: 'Docker',       importance: 'Medium',   requiredProficiency: 2, weight: 4  },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function importanceBadge(importance) {
  switch (importance) {
    case 'Critical': return { text: T.redText,   bg: T.redBg,   border: T.red   };
    case 'High':     return { text: T.amberText, bg: T.amberBg, border: T.amber };
    case 'Medium':   return { text: T.tealText,  bg: T.tealBg,  border: T.teal  };
    default:         return { text: T.textMuted, bg: T.border,  border: T.border };
  }
}

// ─── Proficiency dots ─────────────────────────────────────────────────────────
function ProficiencyDots({ level, max = 5, size = 12 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          title={`Required: ${level} / ${max}`}
          style={{
            display: 'inline-block',
            width: size, height: size,
            borderRadius: '50%',
            background: i < level ? T.blue : 'transparent',
            border: `2px solid ${i < level ? T.blue : T.border}`,
            transition: 'all 0.2s',
          }}
        />
      ))}
    </span>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ background: T.appBg, minHeight: '100vh', padding: '32px 40px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ background: T.border, height: 14, width: 80, borderRadius: 6, marginBottom: 28, animation: 'pulse 1.5s infinite' }} />
      <div style={{ background: T.border, height: 36, width: '45%', borderRadius: 6, marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
      <div style={{ background: T.border, height: 14, width: '80%', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
      <div style={{ background: T.border, height: 14, width: '65%', borderRadius: 6, marginBottom: 32, animation: 'pulse 1.5s infinite' }} />
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 24 }}>
            <div style={{ background: T.border, height: 14, flex: 2, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
            <div style={{ background: T.border, height: 14, flex: 1, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
            <div style={{ background: T.border, height: 14, flex: 1, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = type === 'success'
    ? { bg: T.emeraldBg, border: T.emerald, color: T.emeraldText }
    : { bg: T.amberBg,   border: T.amber,   color: T.amberText   };

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: colors.bg, border: `1px solid ${colors.border}`,
      color: colors.color, padding: '12px 20px', borderRadius: 10,
      fontWeight: 600, fontSize: 14,
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'slideIn 0.3s ease',
    }}>
      <CheckCircle size={16} /> {msg}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CareerDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();

  const [career,    setCareer]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [isTarget,  setIsTarget]  = useState(false);
  const [targeting, setTargeting] = useState(false);
  const [toast,     setToast]     = useState(null);

  // ── Fetch career detail ─────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [careerRes, profileRes] = await Promise.all([
        studentApi.getCareerDetails(id),
        studentApi.getProfile(),
      ]);
      setCareer(careerRes.data);
      setIsTarget(profileRes.data?.targetCareer?._id === id);
    } catch (err) {
      console.warn('API unavailable, using mock data:', err);
      setCareer({ ...MOCK_CAREER_DETAIL, _id: id });
      setIsTarget(id === 'career_001');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Set as target ───────────────────────────────────────────────────────────
  const handleSetTarget = async () => {
    if (isTarget || targeting) return;
    try {
      setTargeting(true);
      await studentApi.setTargetCareer(id);
      setIsTarget(true);
      setToast({ msg: `"${career?.title}" is now your target career!`, type: 'success' });
    } catch (err) {
      console.warn('setTargetCareer failed, applying locally:', err);
      setIsTarget(true);
      setToast({ msg: 'Target set (offline mode)', type: 'warning' });
    } finally {
      setTargeting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return <LoadingSkeleton />;
  if (!career) return (
    <div style={{ background: T.appBg, minHeight: '100vh', padding: '32px 40px', color: T.textMuted, fontSize: 16 }}>
      Career not found.
    </div>
  );

  const totalWeight = (career.requirements || []).reduce((s, r) => s + (r.weight || 0), 0);

  return (
    <div style={{ background: T.appBg, minHeight: '100vh', padding: '32px 40px', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes pulse   { 0%, 100% { opacity: 1 } 50% { opacity: .4 } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
        * { box-sizing: border-box; }
        .skill-row:hover > div { background: rgba(31,41,55,0.5); }
      `}</style>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Back button ── */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'transparent', color: T.textMuted, border: 'none',
          cursor: 'pointer', fontWeight: 600, fontSize: 14, padding: '0 0 24px 0',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = T.textPrimary}
        onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
      >
        <ArrowLeft size={16} /> Careers
      </button>

      {/* ── Career header ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          {/* Left: title + description */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, background: T.cobalt, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Briefcase size={24} color={T.blue} />
              </div>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em' }}>
                {career.title}
              </h1>
            </div>
            <p style={{
              color: T.textMuted, fontSize: 15, lineHeight: 1.75,
              maxWidth: 680, margin: 0, whiteSpace: 'pre-line',
            }}>
              {career.description}
            </p>
          </div>

          {/* Right: CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 210, flexShrink: 0 }}>
            <button
              onClick={handleSetTarget}
              disabled={isTarget || targeting}
              style={{
                background: isTarget ? T.emeraldBg : targeting ? T.cobalt : T.blue,
                color: isTarget ? T.emeraldText : '#fff',
                padding: '12px 20px', borderRadius: 10,
                border: `1px solid ${isTarget ? T.emerald : targeting ? T.border : T.blue}`,
                cursor: isTarget ? 'default' : targeting ? 'wait' : 'pointer',
                fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: targeting ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!isTarget && !targeting) e.currentTarget.style.background = T.blueHover; }}
              onMouseLeave={e => { if (!isTarget && !targeting) e.currentTarget.style.background = T.blue; }}
            >
              {isTarget
                ? <><CheckCircle size={16} /> Target Career Set</>
                : targeting
                  ? 'Setting…'
                  : <><Target size={16} /> Set as Target Career</>
              }
            </button>

            <button
              onClick={() => navigate('/career-analysis')}
              style={{
                background: 'transparent', color: T.tealText,
                padding: '12px 20px', borderRadius: 10,
                border: `1px solid ${T.teal}`,
                cursor: 'pointer', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.tealBg; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <BarChart2 size={16} /> Run Gap Analysis
            </button>
          </div>
        </div>
      </div>

      {/* ── Required Skills table ── */}
      <div>
        {/* Section heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <BookOpen size={18} color={T.blue} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.textPrimary }}>
            Required Skills
          </h2>
          <span style={{
            background: T.cobalt, color: T.blue, fontSize: 12, fontWeight: 600,
            padding: '2px 10px', borderRadius: 20,
          }}>
            {(career.requirements || []).length} skills
          </span>
        </div>

        {/* Table */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 10, overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 160px 80px',
            padding: '12px 24px',
            background: T.appBg,
            borderBottom: `1px solid ${T.border}`,
          }}>
            {['Skill', 'Importance', 'Required Level', 'Weight'].map(col => (
              <span key={col} style={{
                fontSize: 11, fontWeight: 700, color: T.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {(career.requirements || []).length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: T.textMuted, fontSize: 14 }}>
              No skill requirements defined for this career yet.
            </div>
          ) : (
            (career.requirements || []).map((req, idx) => {
              const imp    = importanceBadge(req.importance);
              const isLast = idx === (career.requirements.length - 1);
              const dotColor =
                req.importance === 'Critical' ? T.red :
                req.importance === 'High'     ? T.amber : T.teal;
              return (
                <div
                  key={req.skillId || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 160px 80px',
                    padding: '16px 24px',
                    borderBottom: isLast ? 'none' : `1px solid ${T.border}`,
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(31,41,55,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Skill name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: dotColor, flexShrink: 0,
                    }} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: T.textPrimary }}>
                      {req.skillName}
                    </span>
                  </div>

                  {/* Importance badge */}
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: imp.bg, color: imp.text,
                      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                    }}>
                      {req.importance === 'Critical' && <AlertCircle size={11} />}
                      {req.importance === 'High'     && <TrendingUp  size={11} />}
                      {req.importance === 'Medium'   && <BarChart2   size={11} />}
                      {req.importance}
                    </span>
                  </div>

                  {/* Proficiency dots */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ProficiencyDots level={req.requiredProficiency} max={5} size={13} />
                    <span style={{ fontSize: 12, color: T.textMuted }}>{req.requiredProficiency}/5</span>
                  </div>

                  {/* Weight */}
                  <div>
                    <span style={{
                      background: T.border, color: T.textPrimary,
                      fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
                      display: 'inline-block',
                    }}>
                      {req.weight}%
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Total weight footer row */}
          {(career.requirements || []).length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 160px 80px',
              padding: '12px 24px',
              background: T.appBg,
              borderTop: `1px solid ${T.border}`,
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, gridColumn: '1 / 4' }}>
                Total Weight
              </span>
              <span style={{
                background: totalWeight === 100 ? T.emeraldBg : T.amberBg,
                color:      totalWeight === 100 ? T.emeraldText : T.amberText,
                fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
                display: 'inline-block',
              }}>
                {totalWeight}%
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>Legend:</span>
          {[
            { label: 'Critical',  text: T.redText,   bg: T.redBg   },
            { label: 'High',      text: T.amberText, bg: T.amberBg },
            { label: 'Medium',    text: T.tealText,  bg: T.tealBg  },
          ].map(({ label, text, bg }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                display: 'inline-block', width: 10, height: 10, borderRadius: 3,
                background: bg, border: `1px solid ${text}`,
              }} />
              <span style={{ fontSize: 12, color: T.textMuted }}>{label} importance</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-flex', gap: 3 }}>
              {[true, true, true, false, false].map((f, i) => (
                <span key={i} style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: f ? T.blue : 'transparent',
                  border: `2px solid ${f ? T.blue : T.border}`,
                  display: 'inline-block',
                }} />
              ))}
            </span>
            <span style={{ fontSize: 12, color: T.textMuted }}>=3/5 required proficiency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
