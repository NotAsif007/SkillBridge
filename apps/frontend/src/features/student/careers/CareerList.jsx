import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Target, ChevronRight, CheckCircle, TrendingUp,
  DollarSign, Briefcase, Zap
} from 'lucide-react';
import { studentApi } from '../../../api/student';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

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

function formatSalary(amount) {
  const lakh = amount / 100000;
  return `\u20b9${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
}

function CareerCard({ career, isTarget, onSetTarget, onViewDetails, settingId, T }) {
  const setting = settingId === career._id;
  const demandCfg = career.marketDemand === 'VERY_HIGH'
    ? { text: T.emeraldText, bg: T.emeraldBg, border: T.emeraldBorder, label: 'Very High Demand' }
    : career.marketDemand === 'HIGH'
    ? { text: T.tealText, bg: T.tealBg, border: T.tealBorder, label: 'High Demand' }
    : { text: T.yellowText, bg: T.yellowBg, border: T.yellowBorder, label: 'Medium Demand' };

  return (
    <div
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${isTarget ? T.yellow : T.border}`,
        borderRadius: 14,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isTarget ? `0 0 0 1px ${T.yellow}` : '0 2px 8px rgba(0,0,0,0.02)',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: T.indigoText }}>
            {career.category}
          </span>
          <h3 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 750, color: T.textPrimary }}>
            {career.title}
          </h3>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: demandCfg.text,
            backgroundColor: demandCfg.bg,
            border: `1px solid ${demandCfg.border}`,
            padding: '3px 9px',
            borderRadius: 9999,
          }}
        >
          {demandCfg.label}
        </span>
      </div>

      <p style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.55, margin: '0 0 16px', flex: 1 }}>
        {career.overview}
      </p>

      {career.averageSalaryRange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, color: T.textMuted, fontSize: 12 }}>
          <DollarSign size={14} color={T.yellow} />
          <span>Average Package: <strong style={{ color: T.textPrimary }}>{formatSalary(career.averageSalaryRange.min)} – {formatSalary(career.averageSalaryRange.max)}</strong></span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
        <button
          onClick={() => onViewDetails(career._id)}
          style={{
            flex: 1,
            padding: '9px 0',
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            backgroundColor: 'transparent',
            color: T.textPrimary,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          Details <ChevronRight size={14} />
        </button>

        <button
          onClick={() => !isTarget && onSetTarget(career._id)}
          disabled={isTarget || setting}
          style={{
            flex: 1,
            padding: '9px 0',
            borderRadius: 8,
            border: 'none',
            backgroundColor: isTarget ? T.emeraldBg : T.buttonPrimaryBg,
            color: isTarget ? T.emeraldText : T.buttonPrimaryText,
            fontSize: 13,
            fontWeight: 700,
            cursor: isTarget ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          {isTarget ? (
            <><CheckCircle size={14} /> Target Set</>
          ) : setting ? (
            'Setting…'
          ) : (
            <><Target size={14} /> Set as Target</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function CareerList() {
  const { isDark } = useTheme();
  const T = getTokens(isDark);
  const navigate = useNavigate();

  const [careers, setCareers] = useState(MOCK_CAREERS);
  const [targetId, setTargetId] = useState('career_001');
  const [search, setSearch] = useState('');
  const [settingId, setSettingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [careersRes, profileRes] = await Promise.all([
        studentApi.getCareers(),
        studentApi.getProfile(),
      ]);
      if (careersRes?.data) setCareers(careersRes.data);
      if (profileRes?.data?.targetCareer?._id) setTargetId(profileRes.data.targetCareer._id);
    } catch {
      // Retain mock data
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = careers.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSetTarget = async (careerId) => {
    try {
      setSettingId(careerId);
      await studentApi.setTargetCareer(careerId);
      setTargetId(careerId);
    } catch {
      setTargetId(careerId);
    } finally {
      setSettingId(null);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 1120, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
            Explore Careers
          </h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 4, margin: '4px 0 0 0' }}>
            Discover career paths, compare industry requirements, and set your active target role
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
          <input
            type="text"
            placeholder="Search by role or track…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              backgroundColor: T.surface,
              color: T.textPrimary,
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {filtered.map((career) => (
          <CareerCard
            key={career._id}
            career={career}
            isTarget={career._id === targetId}
            onSetTarget={handleSetTarget}
            onViewDetails={(id) => navigate(`/careers/${id}`)}
            settingId={settingId}
            T={T}
          />
        ))}
      </div>
    </div>
  );
}
