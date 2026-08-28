import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Target, ChevronRight, CheckCircle, TrendingUp,
  DollarSign, Briefcase, Zap, Loader2
} from 'lucide-react';
import { studentApi } from '../../../api/student';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

function formatSalary(amount) {
  if (!amount) return '₹6L – ₹18L';
  const lakh = amount / 100000;
  return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
}

function CareerSkeletonCard({ T, isDark }) {
  return (
    <div
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minHeight: 220,
      }}
      className="animate-pulse"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '60%' }}>
          <div style={{ height: 12, width: '40%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 4 }} />
          <div style={{ height: 18, width: '80%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 4 }} />
        </div>
        <div style={{ height: 22, width: 80, backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 999 }} />
      </div>
      <div style={{ height: 40, width: '100%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 6 }} />
      <div style={{ height: 14, width: '50%', backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 4 }} />
      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <div style={{ height: 36, flex: 1, backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 8 }} />
        <div style={{ height: 36, flex: 1, backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 8 }} />
      </div>
    </div>
  );
}

function CareerCard({ career, isTarget, onSetTarget, onViewDetails, settingId, T }) {
  const setting = settingId === career._id;
  const demandCfg = career.marketDemand === 'VERY_HIGH'
    ? { text: T.emeraldText, bg: T.emeraldBg, border: T.emeraldBorder, label: 'Very High Demand' }
    : career.marketDemand === 'HIGH'
    ? { text: T.tealText, bg: T.tealBg, border: T.tealBorder, label: 'High Demand' }
    : { text: T.yellowText, bg: T.yellowBg, border: T.yellowBorder, label: 'Medium Demand' };

  const minSal = career.averageSalaryRange?.min ? formatSalary(career.averageSalaryRange.min) : '₹6L';
  const maxSal = career.averageSalaryRange?.max ? formatSalary(career.averageSalaryRange.max) : '₹18L';

  return (
    <div
      className="card-hover"
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${isTarget ? T.yellow : T.border}`,
        borderRadius: 14,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        outline: isTarget ? `1px solid ${T.yellow}` : 'none',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: T.indigoText }}>
            {career.category || 'Software Engineering'}
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
            whiteSpace: 'nowrap',
          }}
        >
          {demandCfg.label}
        </span>
      </div>

      <p
        style={{
          fontSize: 13,
          color: T.textMuted,
          lineHeight: 1.5,
          margin: '0 0 14px 0',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {career.overview || career.description || 'Explore career requirements and roadmap paths.'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <DollarSign size={14} style={{ color: T.yellow }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>
          Average Package: <strong style={{ color: T.textPrimary }}>{minSal} – {maxSal}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <button
          onClick={() => onViewDetails(career._id)}
          style={{
            flex: 1,
            padding: '9px 0',
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            backgroundColor: T.surfaceSubtle,
            color: T.textPrimary,
            fontSize: 13,
            fontWeight: 650,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            transition: 'background-color 0.15s ease',
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
            transition: 'all 0.15s ease',
          }}
        >
          {isTarget ? (
            <><CheckCircle size={14} /> Target Set</>
          ) : setting ? (
            <><Loader2 size={14} className="animate-spin" /> Setting…</>
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

  const [careers, setCareers] = useState([]);
  const [targetId, setTargetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [settingId, setSettingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [careersRes, profileRes] = await Promise.all([
        studentApi.getCareers(),
        studentApi.getProfile(),
      ]);

      const careerList = Array.isArray(careersRes) ? careersRes : careersRes?.data || [];
      const userProfile = profileRes?.data || profileRes;
      
      setCareers(careerList);
      if (userProfile?.targetCareer?._id) {
        setTargetId(userProfile.targetCareer._id);
      } else if (userProfile?.targetCareerId) {
        setTargetId(userProfile.targetCareerId);
      } else if (careerList.length > 0) {
        // Fallback target: match by title or default to first
        const matchedTarget = careerList.find((c) => c.title === 'Full Stack Developer') || careerList[0];
        setTargetId(matchedTarget?._id);
      }
    } catch (err) {
      console.warn('Career list fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = careers.filter((c) =>
    (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(search.toLowerCase())
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
          <p style={{ color: T.textMuted, fontSize: 14, margin: '4px 0 0 0' }}>
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
        {loading && careers.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <CareerSkeletonCard key={i} T={T} isDark={isDark} />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((career) => (
            <CareerCard
              key={career._id}
              career={career}
              isTarget={career._id === targetId || (career.title === 'Full Stack Developer' && !targetId)}
              onSetTarget={handleSetTarget}
              onViewDetails={(id) => navigate(`/careers/${id}`)}
              settingId={settingId}
              T={T}
            />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: T.textMuted }}>
            No careers found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
