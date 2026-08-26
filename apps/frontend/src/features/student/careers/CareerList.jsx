import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Target, ChevronRight, CheckCircle, TrendingUp,
  DollarSign, Briefcase, Zap
} from 'lucide-react';
import { studentApi } from '../../../api/student';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  appBg:       '#F5F5F7',
  surface:     '#FFFFFF',
  border:      '#E5E5EA',
  textPrimary: '#1D1D1F',
  textMuted:   '#6E6E73',
  blue:        '#1D1D1F',
  blueHover:   '#000000',
  cobalt:      '#1D1D1F',
  emerald:     '#059669',
  emeraldBg: '#ECFDF5',
  emeraldText: '#059669',
  teal:        '#0D9488',
  tealBg: '#F0FDFA',
  tealText: '#0D9488',
  amber:       '#D97706',
  amberBg: '#FFFBEB',
  amberText: '#D97706',
  red:         '#DC2626',
  redBg: '#FEF2F2',
  redText: '#DC2626',
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CAREERS = [
  {
    _id: 'career_001', title: 'Full Stack Developer', slug: 'full-stack-developer',
    category: 'Software Engineering',
    overview: 'Build end-to-end web applications using modern frontend and backend technologies. Work across the entire stack from UI design to database architecture.',
    marketDemand: 'VERY_HIGH',
    averageSalaryRange: { min: 600000, max: 1800000, currency: 'INR' },
  },
  {
    _id: 'career_002', title: 'Data Scientist', slug: 'data-scientist',
    category: 'Data & Analytics',
    overview: 'Analyze complex datasets to extract insights and build predictive machine learning models that drive business decisions.',
    marketDemand: 'VERY_HIGH',
    averageSalaryRange: { min: 800000, max: 2200000, currency: 'INR' },
  },
  {
    _id: 'career_003', title: 'DevOps Engineer', slug: 'devops-engineer',
    category: 'Infrastructure',
    overview: 'Bridge development and operations to automate software delivery, manage cloud infrastructure and ensure system reliability.',
    marketDemand: 'HIGH',
    averageSalaryRange: { min: 700000, max: 2000000, currency: 'INR' },
  },
  {
    _id: 'career_004', title: 'Product Manager', slug: 'product-manager',
    category: 'Product',
    overview: 'Lead product strategy, roadmap planning and cross-functional execution to bring customer-centric products from concept to launch.',
    marketDemand: 'HIGH',
    averageSalaryRange: { min: 900000, max: 2500000, currency: 'INR' },
  },
  {
    _id: 'career_005', title: 'UI/UX Designer', slug: 'ui-ux-designer',
    category: 'Design',
    overview: 'Create intuitive user interfaces and experiences through research, prototyping and iterative design for web and mobile products.',
    marketDemand: 'MEDIUM',
    averageSalaryRange: { min: 500000, max: 1500000, currency: 'INR' },
  },
  {
    _id: 'career_006', title: 'Machine Learning Engineer', slug: 'ml-engineer',
    category: 'AI & ML',
    overview: 'Design, train and deploy machine learning systems at scale. Work on cutting-edge AI research applied to production systems.',
    marketDemand: 'VERY_HIGH',
    averageSalaryRange: { min: 1000000, max: 3000000, currency: 'INR' },
  },
];

const MOCK_PROFILE = {
  targetCareer: { _id: 'career_001', title: 'Full Stack Developer' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function demandBadge(demand) {
  switch (demand) {
    case 'VERY_HIGH': return { text: T.emeraldText, bg: T.emeraldBg, label: 'Very High Demand' };
    case 'HIGH':      return { text: T.tealText,    bg: T.tealBg,    label: 'High Demand'      };
    case 'MEDIUM':    return { text: T.amberText,   bg: T.amberBg,   label: 'Medium Demand'    };
    default:          return { text: T.textMuted,   bg: T.border,    label: demand             };
  }
}

/** Format salary in lakhs: 600000 → '₹6L', 1800000 → '₹18L' */
function formatSalary(amount) {
  const lakh = amount / 100000;
  return `\u20b9${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ background: T.appBg, minHeight: '100vh', padding: '32px 40px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ background: T.border, height: 28, width: '25%', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
      <div style={{ background: T.border, height: 14, width: '40%', borderRadius: 6, marginBottom: 28, animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ flex: '1 1 calc(33.333% - 14px)', minWidth: 280, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24 }}>
            <div style={{ background: T.border, height: 18, width: '70%', borderRadius: 6, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />
            <div style={{ background: T.border, height: 12, width: '40%', borderRadius: 6, marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
            <div style={{ background: T.border, height: 12, width: '100%', borderRadius: 6, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
            <div style={{ background: T.border, height: 12, width: '80%', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Career Card ─────────────────────────────────────────────────────────────
function CareerCard({ career, isTarget, onSetTarget, onViewDetails, settingId }) {
  const demand  = demandBadge(career.marketDemand);
  const salary  = career.averageSalaryRange;
  const setting = settingId === career._id;

  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${isTarget ? T.blue : T.border}`,
      borderRadius: 10, padding: 22,
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: isTarget ? `0 0 0 2px ${T.blue}40, 0 0 20px ${T.blue}20` : 'none',
      transition: 'box-shadow 0.3s, border-color 0.3s',
      position: 'relative',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Current target ribbon */}
      {isTarget && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: T.blue, color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '3px 10px',
          borderRadius: '0 10px 0 8px', letterSpacing: '0.05em',
        }}>
          CURRENT TARGET
        </div>
      )}

      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: T.textPrimary }}>
          {career.title}
        </h3>
        <span style={{ fontSize: 12, color: T.textMuted, background: T.border, padding: '2px 8px', borderRadius: 12 }}>
          {career.category}
        </span>
      </div>

      {/* Demand badge */}
      <span style={{
        display: 'inline-block', alignSelf: 'flex-start',
        background: demand.bg, color: demand.text,
        fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
      }}>
        <TrendingUp size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
        {demand.label}
      </span>

      {/* Overview — 2-line clamp */}
      <p style={{
        margin: 0, color: T.textMuted, fontSize: 13, lineHeight: 1.55, flexGrow: 1,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {career.overview}
      </p>

      {/* Salary */}
      {salary && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <DollarSign size={13} color={T.textMuted} />
          <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
            {formatSalary(salary.min)} – {formatSalary(salary.max)}
          </span>
          <span style={{ fontSize: 12, color: T.textMuted }}>/ year</span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={() => onViewDetails(career._id)}
          style={{
            flex: 1, background: 'transparent', color: T.blue,
            padding: '9px 0', borderRadius: 8, border: `1px solid ${T.blue}`,
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = T.cobalt; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          View Details <ChevronRight size={14} />
        </button>
        <button
          onClick={() => !isTarget && onSetTarget(career._id)}
          disabled={isTarget || setting}
          style={{
            flex: 1,
            background: isTarget ? T.emeraldBg : setting ? T.cobalt : T.blue,
            color: isTarget ? T.emeraldText : '#fff',
            padding: '9px 0', borderRadius: 8,
            border: `1px solid ${isTarget ? T.emerald : setting ? T.border : T.blue}`,
            cursor: isTarget ? 'default' : setting ? 'wait' : 'pointer',
            fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            opacity: setting ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!isTarget && !setting) e.currentTarget.style.background = T.blueHover; }}
          onMouseLeave={e => { if (!isTarget && !setting) e.currentTarget.style.background = T.blue; }}
        >
          {isTarget
            ? <><CheckCircle size={14} /> Target Set</>
            : setting
              ? 'Setting…'
              : <><Target size={14} /> Set as Target</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: T.emeraldBg, border: `1px solid ${T.emerald}`,
      color: T.emeraldText, padding: '12px 20px', borderRadius: 10,
      fontWeight: 600, fontSize: 14,
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'slideIn 0.3s ease',
    }}>
      <CheckCircle size={16} /> {msg}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CareerList() {
  const navigate = useNavigate();

  const [careers,   setCareers]   = useState([]);
  const [targetId,  setTargetId]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [settingId, setSettingId] = useState(null);
  const [toast,     setToast]     = useState(null);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [careersRes, profileRes] = await Promise.all([
        studentApi.getCareers(),
        studentApi.getProfile(),
      ]);
      setCareers(careersRes.data || []);
      setTargetId(profileRes.data?.targetCareer?._id || null);
    } catch (err) {
      console.warn('API unavailable, using mock data:', err);
      setCareers(MOCK_CAREERS);
      setTargetId(MOCK_PROFILE.targetCareer?._id || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filtered careers ────────────────────────────────────────────────────────
  const filtered = careers.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── Set target ──────────────────────────────────────────────────────────────
  const handleSetTarget = useCallback(async (careerId) => {
    try {
      setSettingId(careerId);
      await studentApi.setTargetCareer(careerId);
      setTargetId(careerId);
      const career = careers.find(c => c._id === careerId);
      setToast(`"${career?.title}" set as your target career!`);
    } catch (err) {
      console.warn('setTargetCareer failed, applying locally:', err);
      setTargetId(careerId);
      const career = careers.find(c => c._id === careerId);
      setToast(`"${career?.title}" set as target (offline mode)`);
    } finally {
      setSettingId(null);
    }
  }, [careers]);

  // ── View details ────────────────────────────────────────────────────────────
  const handleViewDetails = useCallback((id) => {
    navigate(`/careers/${id}`);
  }, [navigate]);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return <LoadingSkeleton />;

  return (
    <div style={{ background: T.appBg, minHeight: '100vh', padding: '32px 40px', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes pulse   { 0%, 100% { opacity: 1 } 50% { opacity: .4 } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, background: T.cobalt, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={20} color={T.blue} />
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em' }}>
            Explore Careers
          </h1>
        </div>
        <p style={{ margin: '0 0 0 52px', color: T.textMuted, fontSize: 14 }}>
          Discover career paths, explore requirements and set your target — {careers.length} careers available
        </p>
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative', maxWidth: 480, marginBottom: 28 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search careers by title or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 10, color: T.textPrimary, fontSize: 14,
            padding: '11px 14px 11px 40px', outline: 'none', fontFamily: 'inherit',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = T.blue}
          onBlur={e  => e.target.style.borderColor = T.border}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, padding: 2,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      {search && (
        <p style={{ margin: '0 0 16px', color: T.textMuted, fontSize: 13 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {/* ── Career grid (flex-wrap: 3 cols desktop, 1 col mobile) ── */}
      {filtered.length === 0 ? (
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
          padding: 48, textAlign: 'center',
        }}>
          <Zap size={40} color={T.textMuted} style={{ marginBottom: 12 }} />
          <p style={{ color: T.textMuted, fontSize: 16, margin: 0 }}>No careers match your search</p>
          <p style={{ color: T.textMuted, fontSize: 13, margin: '6px 0 0' }}>Try a different keyword</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'stretch' }}>
          {filtered.map(career => (
            <div
              key={career._id}
              style={{ flex: '1 1 calc(33.333% - 14px)', minWidth: 280, display: 'flex' }}
            >
              <CareerCard
                career={career}
                isTarget={career._id === targetId}
                onSetTarget={handleSetTarget}
                onViewDetails={handleViewDetails}
                settingId={settingId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
