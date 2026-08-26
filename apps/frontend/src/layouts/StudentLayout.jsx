/**
 * StudentLayout.jsx
 * Visual shell for all student portal pages.
 * Fixed 260px sidebar + top header + <Outlet /> content area.
 * Design: docs/DESIGN.md | Auth: swap user prop for useAuth() when providers.jsx is ready.
 */
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Compass, BarChart2, ClipboardCheck,
  Map, FolderOpen, FileText, MessageSquare, Briefcase,
  Menu, X, LogOut, GraduationCap, ChevronRight,
} from 'lucide-react';

const COLORS = {
  appBg: '#0B0F17', surface: '#111827', border: '#1F2937',
  textPrimary: '#F9FAFB', textMuted: '#9CA3AF',
  blue: '#2563EB', blueHover: '#1D4ED8', cobalt: '#1E3A8A', emerald: '#059669',
};

const NAV_ITEMS = [
  { label: 'Dashboard',        href: '/dashboard',       icon: LayoutDashboard, end: true },
  { label: 'Profile',          href: '/profile',          icon: User },
  { label: 'Careers',          href: '/careers',          icon: Compass },
  { label: 'Career Analysis',  href: '/career-analysis',  icon: BarChart2 },
  { label: 'Assessments',      href: '/assessments',      icon: ClipboardCheck },
  { label: 'Roadmap',          href: '/roadmap',          icon: Map },
  { label: 'Projects',         href: '/projects',         icon: FolderOpen },
  { label: 'Resume',           href: '/resume',           icon: FileText },
  { label: 'AI Interview',     href: '/interview',        icon: MessageSquare },
  { label: 'Jobs',             href: '/jobs',             icon: Briefcase },
];

function StudentSidebar({ isOpen, onClose, user, onLogout }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 260, background: COLORS.surface,
        borderRight: `1px solid ${COLORS.border}`,
        display: 'flex', flexDirection: 'column',
        zIndex: 50,
        transform: isOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.2s ease',
      }}
        className="hidden lg:flex"
      >
        <SidebarContent user={user} onLogout={onLogout} onClose={onClose} />
      </aside>

      {/* Mobile sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 260, background: COLORS.surface,
        borderRight: `1px solid ${COLORS.border}`,
        display: 'flex', flexDirection: 'column',
        zIndex: 50,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
      }}
        className="lg:hidden"
      >
        <SidebarContent user={user} onLogout={onLogout} onClose={onClose} showClose />
      </aside>
    </>
  );
}

function SidebarContent({ user, onLogout, onClose, showClose }) {
  return (
    <>
      {/* Brand */}
      <div style={{
        padding: '20px 16px', borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: COLORS.cobalt,
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 15 }}>CareerOS</div>
            <div style={{ color: COLORS.textMuted, fontSize: 11 }}>Student Portal</div>
          </div>
        </div>
        {showClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textMuted, padding: 4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: isActive ? '#fff' : COLORS.textMuted,
              background: isActive ? COLORS.blue : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: COLORS.cobalt, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Student'}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || ''}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 6, border: 'none',
            background: 'transparent', color: COLORS.textMuted,
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}
          onMouseOver={e => { e.currentTarget.style.background = COLORS.border; e.currentTarget.style.color = COLORS.textPrimary; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textMuted; }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </>
  );
}

function StudentHeader({ onMenuClick, user }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
      padding: '0 24px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button
        onClick={onMenuClick}
        className="lg:hidden"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textMuted, padding: 4 }}
      >
        <Menu size={22} />
      </button>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: COLORS.cobalt, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 13,
        }}>
          {user?.name ? user.name[0].toUpperCase() : 'S'}
        </div>
        <span style={{ color: COLORS.textMuted, fontSize: 13 }}>{user?.name || 'Student'}</span>
      </div>
    </header>
  );
}

export default function StudentLayout({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { authApi } = await import('../api/auth');
      await authApi.logout();
    } catch (_) {}
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.appBg }}>
      <StudentSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} user={user} onLogout={handleLogout} />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="lg:ml-[260px] ml-0">
        <StudentHeader onMenuClick={() => setMobileOpen(true)} user={user} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
