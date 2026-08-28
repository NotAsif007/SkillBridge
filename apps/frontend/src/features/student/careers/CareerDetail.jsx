import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Target, BarChart2, CheckCircle, AlertCircle,
  TrendingUp, Briefcase, BookOpen, ChevronRight, DollarSign
} from 'lucide-react';
import { studentApi } from '../../../api/student';
import { useTheme } from '../../../context/ThemeContext';
import { getTokens } from '../../../styles/themeTokens';

const MOCK_CAREER_DETAIL = {
  _id: 'career_001',
  title: 'Full Stack Developer',
  description: `Full Stack Developers design, build, and maintain both the frontend and backend of web applications. They are proficient in a range of technologies and frameworks across the entire software stack, from database management to creating responsive user interfaces. They collaborate closely with designers, product managers and backend engineers to deliver high-quality, scalable web solutions.`,
  requirements: [
    { skillId: 'sk_001', skillName: 'JavaScript', importance: 'Critical', requiredProficiency: 5, weight: 25 },
    { skillId: 'sk_002', skillName: 'React', importance: 'Critical', requiredProficiency: 4, weight: 20 },
    { skillId: 'sk_003', skillName: 'Node.js', importance: 'High', requiredProficiency: 4, weight: 18 },
    { skillId: 'sk_005', skillName: 'SQL', importance: 'High', requiredProficiency: 3, weight: 15 },
    { skillId: 'sk_010', skillName: 'MongoDB', importance: 'Medium', requiredProficiency: 3, weight: 10 },
    { skillId: 'sk_006', skillName: 'TypeScript', importance: 'High', requiredProficiency: 3, weight: 8 },
    { skillId: 'sk_007', skillName: 'Docker', importance: 'Medium', requiredProficiency: 2, weight: 4 },
  ],
};

function ProficiencyDots({ level, max = 5, T }) {
  return (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: i < level ? T.yellow : T.border,
            transition: 'all 0.2s',
          }}
        />
      ))}
    </span>
  );
}

export default function CareerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const T = getTokens(isDark);

  const [career, setCareer] = useState(MOCK_CAREER_DETAIL);
  const [isTarget, setIsTarget] = useState(true);
  const [loading, setLoading] = useState(false);
  const [setting, setSetting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [careerRes, profileRes] = await Promise.all([
        studentApi.getCareerById(id),
        studentApi.getProfile(),
      ]);
      if (careerRes?.data) setCareer(careerRes.data);
      if (profileRes?.data?.targetCareer?._id === id) setIsTarget(true);
    } catch {
      // Retain mock fallback
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetTarget = async () => {
    try {
      setSetting(true);
      await studentApi.setTargetCareer(id);
      setIsTarget(true);
    } catch {
      setIsTarget(true);
    } finally {
      setSetting(false);
    }
  };

  const totalWeight = (career.requirements || []).reduce((sum, r) => sum + (r.weight || 0), 0);

  return (
    <div style={{ width: '100%', maxWidth: 960, margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/careers')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: T.textMuted,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 20,
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back to Careers Catalog
      </button>

      {/* Header Card */}
      <div
        className="card-hover"
        style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 28,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: T.indigoText, letterSpacing: '0.04em' }}>
              Career Track
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.02em', margin: '4px 0 0' }}>
              {career.title}
            </h1>
          </div>

          <button
            onClick={handleSetTarget}
            disabled={isTarget || setting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: isTarget ? T.emeraldBg : T.buttonPrimaryBg,
              color: isTarget ? T.emeraldText : T.buttonPrimaryText,
              fontWeight: 750,
              fontSize: 14,
              cursor: isTarget ? 'default' : 'pointer',
              boxShadow: isTarget ? 'none' : '0 4px 12px rgba(245,158,11,0.25)',
            }}
          >
            {isTarget ? <><CheckCircle size={16} /> Current Target Career</> : <><Target size={16} /> Set as Target Career</>}
          </button>
        </div>

        <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.65, margin: 0 }}>
          {career.description || career.overview}
        </p>
      </div>

      {/* Skill Requirements Table */}
      <div
        className="card-hover"
        style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}`, backgroundColor: T.surfaceSubtle }}>
          <h2 style={{ fontSize: 16, fontWeight: 750, color: T.textPrimary, margin: 0 }}>
            Required Competencies & Weightage
          </h2>
        </div>

        {/* Requirements List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {(career.requirements || []).map((req, idx) => {
            const impColor = req.importance === 'Critical' ? T.roseText : req.importance === 'High' ? T.yellowText : T.tealText;
            const impBg = req.importance === 'Critical' ? T.roseBg : req.importance === 'High' ? T.yellowBg : T.tealBg;
            const isLast = idx === career.requirements.length - 1;

            return (
              <div
                key={req.skillId || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: isLast ? 'none' : `1px solid ${T.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: impColor }} />
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 650, color: T.textPrimary }}>
                      {req.skillName}
                    </span>
                    <span
                      style={{
                        marginLeft: 10,
                        fontSize: 11,
                        fontWeight: 700,
                        color: impColor,
                        backgroundColor: impBg,
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {req.importance}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ProficiencyDots level={req.requiredProficiency} T={T} />
                    <span style={{ fontSize: 12, color: T.textMuted }}>L{req.requiredProficiency}/5</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 750, color: T.textPrimary, minWidth: 44, textAlign: 'right' }}>
                    {req.weight}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
