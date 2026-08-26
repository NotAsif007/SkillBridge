import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3, BriefcaseBusiness, Building2, ClipboardCheck, Compass, FileText,
  FolderKanban, GraduationCap, LayoutDashboard, LogOut, Map, Menu, MessageSquare,
  User, Users, X, Settings, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ProfileSettingsModal from '../common/ProfileSettingsModal';

const studentNavigation = [
  ['Overview', '/dashboard', LayoutDashboard],
  ['Profile', '/profile', User],
  ['Career paths', '/careers', Compass],
  ['Readiness', '/career-analysis', BarChart3],
  ['Assessments', '/assessments', ClipboardCheck],
  ['Roadmap', '/roadmap', Map],
  ['Projects', '/projects', FolderKanban],
  ['Resume', '/resume', FileText],
  ['Interview practice', '/interview', MessageSquare],
  ['Opportunities', '/jobs', BriefcaseBusiness],
];

const adminNavigation = [
  ['Overview', '/admin', LayoutDashboard],
  ['Students', '/admin/students', Users],
  ['Departments', '/admin/departments', Building2],
  ['Placement analytics', '/admin/analytics', BarChart3],
  ['Assessments', '/admin/assessments', ClipboardCheck],
  ['Interviews', '/admin/interviews', MessageSquare],
  ['Opportunities', '/admin/jobs', BriefcaseBusiness],
];

/* Build a flat route→label lookup for the breadcrumb header */
const routeLabels = Object.fromEntries(
  [...studentNavigation, ...adminNavigation].map(([label, path]) => [path, label])
);

export default function AppShell({ portal }) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = portal === 'admin' ? adminNavigation : studentNavigation;
  const portalLabel = portal === 'admin' ? 'Institution workspace' : 'Student workspace';

  /* Derive current page title from the pathname */
  const pageTitle = useMemo(() => {
    const { pathname } = location;
    if (routeLabels[pathname]) return routeLabels[pathname];
    const parent = Object.keys(routeLabels)
      .filter((p) => pathname.startsWith(p) && p !== '/')
      .sort((a, b) => b.length - a.length)[0];
    return parent ? routeLabels[parent] : '';
  }, [location.pathname]);

  /* Close mobile drawer on Escape key */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /* Close mobile drawer on route change */
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  /* Profile image or initial */
  const avatarContent = user?.profileImage ? (
    <img
      src={user.profileImage}
      alt={user.name || 'User'}
      className="avatar"
      style={{ objectFit: 'cover' }}
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'C'}</div>
  );

  return (
    <div className="app-shell">
      {/* ── Settings & Profile Modal ── */}
      <ProfileSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {open && (
        <button
          className="shell-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`app-sidebar ${open ? 'is-open' : ''}`}>
        <div className="brand-lockup">
          <span className="brand-mark">
            <GraduationCap size={19} />
          </span>
          <span>
            <strong>CareerOS</strong>
            <small>{portalLabel}</small>
          </span>
          <button
            className="mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="shell-nav" aria-label="Primary navigation">
          {navigation.map(([label, to, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/admin'}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom-Left User Card (Clickable to Edit Profile & Theme) ── */}
        <div
          className="sidebar-user"
          onClick={() => setSettingsOpen(true)}
          style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
          title="Click to edit profile, adjust credentials, and toggle theme"
        >
          {avatarContent}
          <div>
            <strong>{user?.name || 'CareerOS user'}</strong>
            <span>{portal === 'admin' ? 'Administrator' : 'Student'}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* ── Main App Content ── */}
      <section className="app-main">
        <header className="shell-header">
          <button
            className="menu-trigger"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="header-context">
            <span className="header-dot" />
            {pageTitle ? (
              <>
                {portalLabel}
                <span className="header-sep">/</span>
                <span className="header-page">{pageTitle}</span>
              </>
            ) : (
              portalLabel
            )}
          </div>

          {/* ── Top-Right Header Actions (Theme Toggle, Settings Gear & Clickable Profile) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            {/* Quick 1-Click Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="header-icon-btn"
              aria-label="Toggle theme"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            >
              {isDark ? <Sun size={17} style={{ color: '#F59E0B' }} /> : <Moon size={17} style={{ color: '#6E6E73' }} />}
            </button>

            {/* Quick Settings Gear Button */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="header-icon-btn"
              aria-label="Profile and Settings"
              title="Adjust Profile & Settings"
            >
              <Settings size={17} style={{ color: isDark ? '#94A3B8' : '#6E6E73' }} />
            </button>

            {/* Clickable Profile Badge */}
            <div
              className="header-profile"
              onClick={() => setSettingsOpen(true)}
              style={{ cursor: 'pointer' }}
              title="Click to edit profile"
            >
              <span>{user?.name || 'CareerOS user'}</span>
              {avatarContent}
            </div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
