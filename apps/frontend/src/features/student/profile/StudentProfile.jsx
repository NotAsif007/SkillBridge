/**
 * StudentProfile.jsx — Academic Info, Skills, Target Career
 * APIs: GET /profile | PUT /profile | POST /profile/skills | GET /skills
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, X, Plus, CheckCircle2, Target } from 'lucide-react';
import { studentApi } from '../../../api/student';

const T = {
  appBg:'#F5F5F7', surface:'#FFFFFF', border:'#E5E5EA',
  textPrimary:'#1D1D1F', textMuted:'#6E6E73',
  blue:'#1D1D1F', cobalt:'#1D1D1F',
  emerald:'#059669', emeraldBg:'rgba(5,150,105,0.12)', emeraldText:'#059669',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.12)', amberText:'#D97706',
};

const MOCK_PROFILE = {
  _id: 'p1', userId: 'u1', rollNumber: '2023CSE042', graduationYear: 2027, cgpa: 8.45,
  targetCareer: { _id: 'c1', title: 'Full Stack Developer', slug: 'full-stack-developer' },
  skills: [
    { skillId: 's1', skillName: 'JavaScript', proficiencyLevel: 4, verified: true },
    { skillId: 's2', skillName: 'React', proficiencyLevel: 3, verified: false },
    { skillId: 's3', skillName: 'Node.js', proficiencyLevel: 3, verified: true },
    { skillId: 's4', skillName: 'MongoDB', proficiencyLevel: 2, verified: false },
  ],
  interests: ['Web Development', 'Cloud Architecture'],
  preferredRoles: ['Frontend Engineer', 'Full Stack Developer'],
  preferredLocations: ['Bangalore', 'Hyderabad', 'Remote'],
};

function ProficiencyDots({ level, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ fontSize: 12, color: i < level ? T.blue : T.border }}>●</span>
      ))}
    </div>
  );
}

function TagPill({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.textPrimary, background: T.border, padding: '3px 10px', borderRadius: 9999 }}>
      {label}
      {onRemove && <X size={11} style={{ cursor: 'pointer', color: T.textMuted }} onClick={onRemove} />}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24, marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, margin: '0 0 16px' }}>{title}</h2>
      {children}
    </div>
  );
}

function LabeledField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      {children}
    </div>
  );
}

function ReadonlyValue({ value }) {
  return <div style={{ color: T.textPrimary, fontSize: 14 }}>{value || '—'}</div>;
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: T.appBg, border: `1px solid ${T.border}`, borderRadius: 7, padding: '9px 12px', color: T.textPrimary, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
  );
}

export default function StudentProfile() {
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
      const [profileRes, skillsRes] = await Promise.all([studentApi.getProfile(), studentApi.getSkills()]);
      setProfile(profileRes.data);
      setAllSkills(skillsRes.data || []);
    } catch {
      setProfile(MOCK_PROFILE);
      setAllSkills([
        { _id: 's5', name: 'Docker' }, { _id: 's6', name: 'AWS' },
        { _id: 's7', name: 'System Design' }, { _id: 's8', name: 'DSA' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startEdit = () => {
    if (!profile) return;
    setForm({
      cgpa: profile.cgpa, graduationYear: profile.graduationYear,
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
        cgpa: parseFloat(form.cgpa),
        graduationYear: parseInt(form.graduationYear),
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
        preferredRoles: form.preferredRoles.split(',').map(s => s.trim()).filter(Boolean),
        preferredLocations: form.preferredLocations.split(',').map(s => s.trim()).filter(Boolean),
      };
      await studentApi.updateProfile(payload);
      await fetchData();
      setEditing(false);
    } catch {
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

  const filteredSkills = allSkills.filter(s => s.name?.toLowerCase().includes(skillSearch.toLowerCase()));

  if (loading) {
    return (
      <div style={{ padding: '32px 40px' }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 120, background: T.surface, borderRadius: 10, marginBottom: 16, opacity: 0.6 }} />)}
      </div>
    );
  }
  if (!profile) return null;

  return (
    <div style={{ padding: '32px 40px', background: T.appBg, minHeight: '100vh', maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>Student Profile</h1>
        {!editing ? (
          <button onClick={startEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textPrimary, cursor: 'pointer', fontSize: 14 }}>
            <Edit2 size={14} /> Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textMuted, cursor: 'pointer', fontSize: 14 }}>
              <X size={14} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: 'none', borderRadius: 8, background: T.blue, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Academic Info */}
      <Section title="Academic Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          <LabeledField label="Roll Number"><ReadonlyValue value={profile.rollNumber} /></LabeledField>
          <LabeledField label="CGPA">
            {editing ? <TextInput type="number" value={form.cgpa} onChange={v => setForm(f => ({...f, cgpa: v}))} /> : <ReadonlyValue value={profile.cgpa} />}
          </LabeledField>
          <LabeledField label="Graduation Year">
            {editing ? <TextInput type="number" value={form.graduationYear} onChange={v => setForm(f => ({...f, graduationYear: v}))} /> : <ReadonlyValue value={profile.graduationYear} />}
          </LabeledField>
        </div>
      </Section>

      {/* Target Career */}
      <Section title="Target Career">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {profile.targetCareer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: `${T.blue}20`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={18} color={T.blue} />
              </div>
              <div>
                <div style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600 }}>{profile.targetCareer.title}</div>
                <div style={{ color: T.textMuted, fontSize: 12 }}>Currently targeting</div>
              </div>
            </div>
          ) : (
            <div style={{ color: T.textMuted, fontSize: 14 }}>No target career set</div>
          )}
          <button onClick={() => navigate('/careers')} style={{ padding: '8px 14px', border: `1px solid ${T.border}`, borderRadius: 7, background: 'transparent', color: T.textMuted, cursor: 'pointer', fontSize: 13 }}>
            Change Career
          </button>
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <LabeledField label="Interests">
          {editing
            ? <TextInput value={form.interests} onChange={v => setForm(f => ({...f, interests: v}))} placeholder="Comma separated: Web Development, AI..." />
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(profile.interests || []).map(t => <TagPill key={t} label={t} />)}</div>
          }
        </LabeledField>
        <LabeledField label="Preferred Roles">
          {editing
            ? <TextInput value={form.preferredRoles} onChange={v => setForm(f => ({...f, preferredRoles: v}))} placeholder="Frontend Engineer, Full Stack Developer..." />
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(profile.preferredRoles || []).map(t => <TagPill key={t} label={t} />)}</div>
          }
        </LabeledField>
        <LabeledField label="Preferred Locations">
          {editing
            ? <TextInput value={form.preferredLocations} onChange={v => setForm(f => ({...f, preferredLocations: v}))} placeholder="Bangalore, Remote..." />
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(profile.preferredLocations || []).map(t => <TagPill key={t} label={t} />)}</div>
          }
        </LabeledField>
      </Section>

      {/* Skills */}
      <Section title={`Skills (${profile.skills?.length || 0})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {(profile.skills || []).map(skill => (
            <div key={skill.skillId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: T.appBg, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: T.textPrimary, fontSize: 14, fontWeight: 500 }}>{skill.skillName}</span>
                {skill.verified && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: T.emeraldText, background: T.emeraldBg, padding: '2px 8px', borderRadius: 9999 }}>
                    <CheckCircle2 size={10} /> Verified
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ProficiencyDots level={skill.proficiencyLevel} />
                <span style={{ color: T.textMuted, fontSize: 12 }}>L{skill.proficiencyLevel}</span>
              </div>
            </div>
          ))}
        </div>

        {!showAddSkill ? (
          <button onClick={() => setShowAddSkill(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: `1px dashed ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textMuted, cursor: 'pointer', fontSize: 14, width: '100%', justifyContent: 'center' }}>
            <Plus size={14} /> Add Skill
          </button>
        ) : (
          <div style={{ background: T.appBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <input value={skillSearch} onChange={e => setSkillSearch(e.target.value)} placeholder="Search skill…"
                style={{ width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: '8px 12px', color: T.textPrimary, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
              <select value={selectedSkillId} onChange={e => setSelectedSkillId(e.target.value)}
                style={{ width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: '8px 12px', color: T.textPrimary, fontSize: 14, outline: 'none' }}>
                <option value="">Select a skill…</option>
                {filteredSkills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Proficiency Level: {proficiencyLevel}/5</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4,5].map(l => (
                  <button key={l} onClick={() => setProficiencyLevel(l)} style={{ width: 36, height: 36, borderRadius: 6, border: `1px solid ${l <= proficiencyLevel ? T.blue : T.border}`, background: l <= proficiencyLevel ? `${T.blue}20` : 'transparent', color: l <= proficiencyLevel ? T.blue : T.textMuted, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAddSkill} disabled={!selectedSkillId || addingSkill} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 7, background: T.blue, color: '#fff', fontWeight: 600, cursor: selectedSkillId ? 'pointer' : 'not-allowed', fontSize: 14, opacity: selectedSkillId ? 1 : 0.5 }}>
                {addingSkill ? 'Adding…' : 'Add Skill'}
              </button>
              <button onClick={() => setShowAddSkill(false)} style={{ padding: '9px 16px', border: `1px solid ${T.border}`, borderRadius: 7, background: 'transparent', color: T.textMuted, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
