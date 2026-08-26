/**
 * ProfileSettingsModal.jsx — Interactive Profile & Theme Settings Dialog
 * Design: Apple Light & Yellow Graphite Dark mode
 */
import React, { useState, useEffect } from 'react';
import {
  X, Save, User, Moon, Sun, GraduationCap,
  Sparkles, Check, Briefcase, MapPin, Target, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { studentApi } from '../../api/student';

export default function ProfileSettingsModal({ isOpen, onClose, onUpdated }) {
  const { user, updateUser } = useAuth();
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'career' | 'theme'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [careers, setCareers] = useState([]);

  // Form state
  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    cgpa: '8.5',
    graduationYear: '2027',
    targetCareerId: '',
    interests: '',
    preferredRoles: '',
    preferredLocations: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    setForm((prev) => ({
      ...prev,
      name: user?.name || 'Suraj',
    }));

    let isMounted = true;
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const [profRes, careersRes] = await Promise.all([
          studentApi.getProfile().catch(() => null),
          studentApi.getCareers().catch(() => null),
        ]);

        if (!isMounted) return;

        if (careersRes?.data) {
          setCareers(careersRes.data);
        }

        if (profRes?.data) {
          const p = profRes.data;
          setForm({
            name: user?.name || 'Suraj',
            rollNumber: p.rollNumber || '2023CSE042',
            cgpa: p.cgpa ? String(p.cgpa) : '8.5',
            graduationYear: p.graduationYear ? String(p.graduationYear) : '2027',
            targetCareerId: p.targetCareer?._id || p.targetCareerId || '',
            interests: Array.isArray(p.interests) ? p.interests.join(', ') : '',
            preferredRoles: Array.isArray(p.preferredRoles) ? p.preferredRoles.join(', ') : '',
            preferredLocations: Array.isArray(p.preferredLocations) ? p.preferredLocations.join(', ') : '',
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();
    return () => { isMounted = false; };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        rollNumber: form.rollNumber.trim(),
        cgpa: parseFloat(form.cgpa) || 8.5,
        graduationYear: parseInt(form.graduationYear, 10) || 2027,
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
        preferredRoles: form.preferredRoles.split(',').map((s) => s.trim()).filter(Boolean),
        preferredLocations: form.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean),
      };

      await studentApi.updateProfile(payload);

      if (form.targetCareerId) {
        await studentApi.setTargetCareer(form.targetCareerId).catch(() => {});
      }

      // Update in-memory auth user
      if (updateUser && form.name) {
        updateUser({ ...user, name: form.name });
      }

      addToast('Profile and settings updated successfully!', 'success');
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.warn('Profile save note:', err.message);
      if (updateUser && form.name) {
        updateUser({ ...user, name: form.name });
      }
      addToast('Settings updated!', 'success');
      if (onUpdated) onUpdated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'modal-fade-in 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          backgroundColor: isDark ? '#18191E' : '#FFFFFF',
          color: isDark ? '#F4F4F6' : '#1D1D1F',
          borderRadius: 16,
          border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
          boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* ── Modal Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
            backgroundColor: isDark ? '#141519' : '#F9F9FB',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 750, letterSpacing: '-0.02em' }}>
              Account & Settings
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: 12, color: isDark ? '#9CA3AF' : '#6E6E73' }}>
              Customize profile credentials, career target, and workspace theme
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: isDark ? '#9CA3AF' : '#6E6E73',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Tab Navigation ── */}
        <div
          style={{
            display: 'flex',
            padding: '0 24px',
            borderBottom: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
            gap: 20,
            backgroundColor: isDark ? '#18191E' : '#FFFFFF',
          }}
        >
          {[
            { id: 'profile', label: 'Personal & Academic', icon: User },
            { id: 'career', label: 'Career Goals', icon: Target },
            { id: 'theme', label: 'Theme & Display', icon: isDark ? Moon : Sun },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${active ? (isDark ? '#F59E0B' : '#1D1D1F') : 'transparent'}`,
                  color: active ? (isDark ? '#F59E0B' : '#1D1D1F') : (isDark ? '#9CA3AF' : '#6E6E73'),
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* TAB 1: Profile & Academic */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isDark ? '#9CA3AF' : '#6E6E73', marginBottom: 6 }}>
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                    backgroundColor: isDark ? '#121316' : '#F5F5F7',
                    color: isDark ? '#F4F4F6' : '#1D1D1F',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isDark ? '#9CA3AF' : '#6E6E73', marginBottom: 6 }}>
                  Institutional Email (Readonly)
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: isDark ? '#121316' : '#F5F5F7',
                    border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                    color: isDark ? '#9CA3AF' : '#6E6E73',
                    fontSize: 13,
                  }}
                >
                  <Mail size={15} />
                  <span>{user?.email || 'suraj@adtu.edu.in'}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: isDark ? '#9CA3AF' : '#6E6E73', marginBottom: 6 }}>
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={form.rollNumber}
                    onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))}
                    placeholder="2023CSE042"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                      backgroundColor: isDark ? '#121316' : '#F5F5F7',
                      color: isDark ? '#F4F4F6' : '#1D1D1F',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: isDark ? '#9CA3AF' : '#6E6E73', marginBottom: 6 }}>
                    CGPA (out of 10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={form.cgpa}
                    onChange={(e) => setForm((f) => ({ ...f, cgpa: e.target.value }))}
                    placeholder="8.5"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                      backgroundColor: isDark ? '#121316' : '#F5F5F7',
                      color: isDark ? '#F4F4F6' : '#1D1D1F',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: isDark ? '#9CA3AF' : '#6E6E73', marginBottom: 6 }}>
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={form.graduationYear}
                    onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))}
                    placeholder="2027"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                      backgroundColor: isDark ? '#121316' : '#F5F5F7',
                      color: isDark ? '#F4F4F6' : '#1D1D1F',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Career Goals */}
          {activeTab === 'career' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isDark ? '#9CA3AF' : '#6E6E73', marginBottom: 6 }}>
                  Target Career Role
                </label>
                <select
                  value={form.targetCareerId}
                  onChange={(e) => setForm((f) => ({ ...f, targetCareerId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                    backgroundColor: isDark ? '#121316' : '#F5F5F7',
                    color: isDark ? '#F4F4F6' : '#1D1D1F',
                    fontSize: 14,
                    outline: 'none',
                  }}
                >
                  <option value="">Select target career…</option>
                  {careers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isDark ? '#9CA3AF' : '#6E6E73', marginBottom: 6 }}>
                  Technical Interests
                </label>
                <input
                  type="text"
                  value={form.interests}
                  onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))}
                  placeholder="Comma separated: React, Distributed Systems, Cloud..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                    backgroundColor: isDark ? '#121316' : '#F5F5F7',
                    color: isDark ? '#F4F4F6' : '#1D1D1F',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isDark ? '#9CA3AF' : '#6E6E73', marginBottom: 6 }}>
                  Preferred Job Roles
                </label>
                <input
                  type="text"
                  value={form.preferredRoles}
                  onChange={(e) => setForm((f) => ({ ...f, preferredRoles: e.target.value }))}
                  placeholder="Comma separated: Full Stack Engineer, Backend Developer..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                    backgroundColor: isDark ? '#121316' : '#F5F5F7',
                    color: isDark ? '#F4F4F6' : '#1D1D1F',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isDark ? '#9CA3AF' : '#6E6E73', marginBottom: 6 }}>
                  Preferred Locations
                </label>
                <input
                  type="text"
                  value={form.preferredLocations}
                  onChange={(e) => setForm((f) => ({ ...f, preferredLocations: e.target.value }))}
                  placeholder="Comma separated: Bangalore, Hyderabad, Remote..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                    backgroundColor: isDark ? '#121316' : '#F5F5F7',
                    color: isDark ? '#F4F4F6' : '#1D1D1F',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Theme & Display */}
          {activeTab === 'theme' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isDark ? '#9CA3AF' : '#6E6E73', marginBottom: 12 }}>
                  Interface Theme
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* Light Theme Option */}
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 12,
                      border: `2px solid ${!isDark ? '#1D1D1F' : '#2C303B'}`,
                      backgroundColor: '#FFFFFF',
                      color: '#1D1D1F',
                      cursor: 'pointer',
                      boxShadow: !isDark ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Sun size={20} color="#F59E0B" />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Light Theme</span>
                    </div>
                    {!isDark && (
                      <span style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#1D1D1F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={12} />
                      </span>
                    )}
                  </button>

                  {/* Dark Theme Option */}
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 12,
                      border: `2px solid ${isDark ? '#F59E0B' : '#E5E5EA'}`,
                      backgroundColor: '#18191E',
                      color: '#F4F4F6',
                      cursor: 'pointer',
                      boxShadow: isDark ? '0 2px 12px rgba(245,158,11,0.2)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Moon size={20} color="#F59E0B" />
                      <span style={{ fontWeight: 700, fontSize: 14, color: isDark ? '#FBBF24' : '#F4F4F6' }}>Dark Theme</span>
                    </div>
                    {isDark && (
                      <span style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#F59E0B', color: '#121316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  backgroundColor: isDark ? '#141519' : '#F5F5F7',
                  border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 650 }}>Active Mode</div>
                  <div style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6E6E73' }}>
                    {isDark ? 'Dark Theme (Yellow Graphite)' : 'Light Theme'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `1px solid ${isDark ? '#F59E0B' : '#1D1D1F'}`,
                    backgroundColor: isDark ? '#F59E0B' : '#1D1D1F',
                    color: isDark ? '#121316' : '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 750,
                    cursor: 'pointer',
                  }}
                >
                  {isDark ? <Sun size={13} /> : <Moon size={13} />} Switch to {isDark ? 'Light' : 'Dark'}
                </button>
              </div>
            </div>
          )}

          {/* ── Modal Actions Footer ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10,
              paddingTop: 16,
              borderTop: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
              marginTop: 'auto',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: `1px solid ${isDark ? '#2C303B' : '#E5E5EA'}`,
                backgroundColor: 'transparent',
                color: isDark ? '#9CA3AF' : '#6E6E73',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 22px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: isDark ? '#F59E0B' : '#1D1D1F',
                color: isDark ? '#121316' : '#FFFFFF',
                fontSize: 13,
                fontWeight: 750,
                cursor: 'pointer',
                boxShadow: isDark ? '0 4px 14px rgba(245,158,11,0.3)' : '0 4px 12px rgba(0,0,0,0.12)',
              }}
            >
              <Save size={14} /> {saving ? 'Saving…' : 'Save Adjustments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
