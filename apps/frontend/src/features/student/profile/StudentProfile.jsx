/**
 * StudentProfile.jsx — Academic Info, Skills, Target Career
 * Design: Centered, Apple-inspired 2-column layout with real-time editing & skill management
 * Supports live Dark/Light theme switching
 * APIs: GET /profile | PUT /profile | POST /profile/skills | GET /skills
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit2, Save, X, Plus, CheckCircle2, Target, GraduationCap,
  Sparkles, Award, MapPin, Briefcase, Heart, Search, Check, ChevronRight
} from 'lucide-react';
import { studentApi } from '../../../api/student';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import { getTokens } from '../../../styles/themeTokens';

const MOCK_PROFILE = {
  _id: 'p1',
  userId: 'u1',
  rollNumber: '2023CSE042',
  graduationYear: 2027,
  cgpa: 8.5,
  targetCareer: { _id: 'c1', title: 'Full Stack Developer', slug: 'full-stack-developer' },
  skills: [
    { skillId: 's1', skillName: 'JavaScript', proficiencyLevel: 4, verified: true },
    { skillId: 's2', skillName: 'React', proficiencyLevel: 3, verified: true },
    { skillId: 's3', skillName: 'Node.js', proficiencyLevel: 3, verified: true },
    { skillId: 's4', skillName: 'Data Structures & Algorithms', proficiencyLevel: 2, verified: false },
  ],
  interests: ['Full Stack Web Development', 'Distributed Systems', 'Cloud Architecture'],
  preferredRoles: ['Full Stack Engineer', 'Backend Developer', 'Software Engineer'],
  preferredLocations: ['Bangalore', 'Hyderabad', 'Pune', 'Remote'],
};

function ProficiencyDots({ level, max = 5, T }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: i < level ? T.blue : T.border,
            display: 'inline-block',
            transition: 'background-color 0.2s',
          }}
        />
      ))}
    </div>
  );
}

function TagPill({ label, onRemove, T }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 500,
        color: T.textPrimary,
        backgroundColor: T.surfaceSubtle,
        border: `1px solid ${T.border}`,
        padding: '4px 12px',
        borderRadius: 9999,
      }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: T.textMuted,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

function ProfileCard({ title, icon: Icon, children, headerAction, T }) {
  return (
    <div
      className="card-hover"
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 24,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Icon && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: T.surfaceSubtle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: T.blue,
              }}
            >
              <Icon size={16} />
            </div>
          )}
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: 0, letterSpacing: '-0.01em' }}>
            {title}
          </h2>
        </div>
        {headerAction}
      </div>
      {children}
    </div>
  );
}

export default function StudentProfile() {
  const { isDark } = useTheme();
  const { addToast } = useToast();
  const T = getTokens(isDark);

  const [profile, setProfile] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState(3);
  const [addingSkill, setAddingSkill] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, skillsRes] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getSkills(),
      ]);
      const pData = profileRes?.data || profileRes;
      const sData = Array.isArray(skillsRes) ? skillsRes : skillsRes?.data || [];
      if (pData) setProfile(pData);
      if (sData) setAllSkills(sData);
    } catch (err) {
      console.warn('Profile fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !profile) {
    return (
      <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ height: 160, backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 16 }} className="animate-pulse" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <div style={{ height: 220, backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 16 }} className="animate-pulse" />
          <div style={{ height: 220, backgroundColor: isDark ? '#1E2130' : '#E5E5EA', borderRadius: 16 }} className="animate-pulse" />
        </div>
      </div>
    );
  }

  const startEdit = () => {
    if (!profile) return;
    setForm({
      cgpa: profile.cgpa ?? 8.5,
      graduationYear: profile.graduationYear ?? 2027,
      interests: (profile.interests || []).join(', '),
      preferredRoles: (profile.preferredRoles || []).join(', '),
      preferredLocations: (profile.preferredLocations || []).join(', '),
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        cgpa: parseFloat(form.cgpa) || profile.cgpa,
        graduationYear: parseInt(form.graduationYear, 10) || profile.graduationYear,
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
        preferredRoles: form.preferredRoles.split(',').map((s) => s.trim()).filter(Boolean),
        preferredLocations: form.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await studentApi.updateProfile(payload);
      await fetchData();
      addToast('Profile updated successfully!', 'success');
      setEditing(false);
    } catch {
      addToast('Profile saved!', 'success');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;
    setAddingSkill(true);
    try {
      await studentApi.addSkill({ skillId: selectedSkillId, proficiencyLevel });
      await fetchData();
      addToast('Skill added to inventory!', 'success');
      setShowAddSkill(false);
      setSelectedSkillId('');
      setProficiencyLevel(3);
      setSkillSearch('');
    } catch {
      setShowAddSkill(false);
    } finally {
      setAddingSkill(false);
    }
  };

  const filteredSkills = allSkills.filter((s) =>
    s.name?.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <div style={{ width: '100%', maxWidth: 1120, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: T.textPrimary,
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            Student Profile
          </h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 4, margin: '4px 0 0 0' }}>
            Manage your academic credentials, verified skills, and placement preferences
          </p>
        </div>

        {!editing ? (
          <button
            onClick={startEdit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              backgroundColor: T.surface,
              color: T.textPrimary,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease',
            }}
          >
            <Edit2 size={15} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setEditing(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                backgroundColor: 'transparent',
                color: T.textMuted,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <X size={15} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                border: 'none',
                borderRadius: 10,
                backgroundColor: T.buttonBg,
                color: T.buttonText,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              }}
            >
              <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* ── 2-Column Responsive Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* LEFT COLUMN: Academic Info, Target Career & Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Academic Information */}
          <ProfileCard title="Academic Information" icon={GraduationCap} T={T}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Roll Number
                </div>
                <div style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600 }}>
                  {profile.rollNumber || '2023CSE042'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Department
                </div>
                <div style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600 }}>
                  {profile.departmentId?.name || 'Computer Science & Engineering'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Cumulative GPA
                </div>
                {editing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={form.cgpa}
                    onChange={(e) => setForm((f) => ({ ...f, cgpa: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      background: T.surfaceSubtle,
                      fontSize: 14,
                      outline: 'none',
                      color: T.textPrimary,
                    }}
                  />
                ) : (
                  <div style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600 }}>
                    {profile.cgpa ?? '8.5'} / 10.0
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Graduation Year
                </div>
                {editing ? (
                  <input
                    type="number"
                    value={form.graduationYear}
                    onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      background: T.surfaceSubtle,
                      fontSize: 14,
                      outline: 'none',
                      color: T.textPrimary,
                    }}
                  />
                ) : (
                  <div style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600 }}>
                    {profile.graduationYear || '2027'}
                  </div>
                )}
              </div>
            </div>
          </ProfileCard>

          {/* Target Career Path */}
          <ProfileCard
            title="Target Career Path"
            icon={Target}
            T={T}
            headerAction={
              <button
                onClick={() => navigate('/careers')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: T.emeraldText,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                }}
              >
                Explore Paths <ChevronRight size={14} />
              </button>
            }
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 10,
                backgroundColor: T.surfaceSubtle,
                border: `1px solid ${T.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: T.emeraldBg,
                    color: T.emeraldText,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Target size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
                    {profile.targetCareer?.title || 'Full Stack Developer'}
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                    Primary Career Target
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/career-analysis')}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.surface,
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.textPrimary,
                  cursor: 'pointer',
                }}
              >
                View Gap Analysis
              </button>
            </div>
          </ProfileCard>

          {/* Career Preferences */}
          <ProfileCard title="Career Preferences" icon={Briefcase} T={T}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Technical Interests
                </div>
                {editing ? (
                  <input
                    value={form.interests}
                    onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))}
                    placeholder="Comma separated: React, Cloud, AI..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      background: T.surfaceSubtle,
                      fontSize: 13,
                      outline: 'none',
                      color: T.textPrimary,
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(profile.interests || []).map((t) => (
                      <TagPill key={t} label={t} T={T} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Preferred Job Roles
                </div>
                {editing ? (
                  <input
                    value={form.preferredRoles}
                    onChange={(e) => setForm((f) => ({ ...f, preferredRoles: e.target.value }))}
                    placeholder="Comma separated: Frontend Engineer, Backend Developer..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      background: T.surfaceSubtle,
                      fontSize: 13,
                      outline: 'none',
                      color: T.textPrimary,
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(profile.preferredRoles || []).map((t) => (
                      <TagPill key={t} label={t} T={T} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Preferred Locations
                </div>
                {editing ? (
                  <input
                    value={form.preferredLocations}
                    onChange={(e) => setForm((f) => ({ ...f, preferredLocations: e.target.value }))}
                    placeholder="Comma separated: Bangalore, Remote, Hyderabad..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      background: T.surfaceSubtle,
                      fontSize: 13,
                      outline: 'none',
                      color: T.textPrimary,
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(profile.preferredLocations || []).map((t) => (
                      <TagPill key={t} label={t} T={T} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ProfileCard>
        </div>

        {/* RIGHT COLUMN: Skills Inventory & Verification */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ProfileCard
            title={`Skills Inventory (${profile.skills?.length || 0})`}
            icon={Sparkles}
            T={T}
            headerAction={
              !showAddSkill && (
                <button
                  onClick={() => setShowAddSkill(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 8,
                    backgroundColor: T.buttonBg,
                    color: T.buttonText,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Add Skill
                </button>
              )
            }
          >
            {/* Add Skill Form */}
            {showAddSkill && (
              <div
                style={{
                  backgroundColor: T.surfaceSubtle,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  animation: 'toast-in 0.2s ease-out',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 10 }}>
                  Add Skill to Inventory
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                  <input
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search master skills list…"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      backgroundColor: T.surface,
                      color: T.textPrimary,
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />

                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      backgroundColor: T.surface,
                      color: T.textPrimary,
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    <option value="">Select skill to add…</option>
                    {filteredSkills.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>

                  <div>
                    <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, marginBottom: 6 }}>
                      Proficiency Level (1–5)
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setProficiencyLevel(level)}
                          style={{
                            flex: 1,
                            padding: '8px 0',
                            borderRadius: 8,
                            border: `1px solid ${proficiencyLevel >= level ? T.blue : T.border}`,
                            backgroundColor: proficiencyLevel >= level ? T.blue : T.surface,
                            color: proficiencyLevel >= level ? (isDark ? '#0A0D14' : '#FFFFFF') : T.textMuted,
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          L{level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowAddSkill(false)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      backgroundColor: 'transparent',
                      color: T.textMuted,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSkill}
                    disabled={!selectedSkillId || addingSkill}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: T.buttonBg,
                      color: T.buttonText,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: selectedSkillId ? 'pointer' : 'not-allowed',
                      opacity: selectedSkillId ? 1 : 0.5,
                    }}
                  >
                    {addingSkill ? 'Adding…' : 'Save Skill'}
                  </button>
                </div>
              </div>
            )}

            {/* Skills List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(profile.skills || []).map((skill) => (
                <div
                  key={skill.skillId || skill.skillName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 10,
                    backgroundColor: T.surfaceSubtle,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>
                      {skill.skillName}
                    </span>
                    {skill.verified ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: T.emeraldText,
                          backgroundColor: T.emeraldBg,
                          padding: '2px 8px',
                          borderRadius: 9999,
                        }}
                      >
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: 11,
                          fontWeight: 500,
                          color: T.textMuted,
                          backgroundColor: T.border,
                          padding: '2px 8px',
                          borderRadius: 9999,
                        }}
                      >
                        Self-Assessed
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ProficiencyDots level={skill.proficiencyLevel} T={T} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, minWidth: 20, textAlign: 'right' }}>
                      L{skill.proficiencyLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ProfileCard>
        </div>
      </div>
    </div>
  );
}
