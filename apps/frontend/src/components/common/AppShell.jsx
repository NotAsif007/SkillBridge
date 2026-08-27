import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
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

const routeLabels = Object.fromEntries(
  [...studentNavigation, ...adminNavigation].map(([label, path]) => [path, label])
);

export default function AppShell({ portal }) {
  const [drawerState, setDrawerState] = useState('closed');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navRef = useRef(null);
  const [pill, setPill] = useState({ y: 0, h: 40, ready: false, animated: false });

  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = portal === 'admin' ? adminNavigation : studentNavigation;
  const portalLabel = portal === 'admin' ? 'Institution workspace' : 'Student workspace';

  const pageTitle = useMemo(() => {
    const { pathname } = location;
    if (routeLabels[pathname]) return routeLabels[pathname];
    const parent = Object.keys(routeLabels)
      .filter((p) => pathname.startsWith(p) && p !== '/')
      .sort((a, b) => b.length - a.length)[0];
    return parent ? routeLabels[parent] : '';
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (!navRef.current) return;
    const activeLink = navRef.current.querySelector('a.active');
    if (!activeLink) {
      setPill((p) => ({ ...p, ready: false }));
      return;
    }
    const navRect  = navRef.current.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const y = linkRect.top - navRect.top + navRef.current.scrollTop;
    setPill((prev) => ({
      y,
      h: linkRect.height,
      ready: true,
      animated: prev.ready,
    }));
  }, [location.pathname]);

  const openDrawer = () => {
    setDrawerState('opening');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerState('open'));
    });
  };

  const closeDrawer = () => {
    setDrawerState('closing');
    setTimeout(() => setDrawerState('closed'), 340);
  };

  useEffect(() => {
    if (drawerState === 'closed') return;
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerState]);

  useEffect(() => {
    if (drawerState !== 'closed') closeDrawer();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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

  const isDrawerVisible = drawerState !== 'closed';
  const isDrawerOpen   = drawerState === 'open';

  return (
    <div className="app-shell">
      <ProfileSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {isDrawerVisible && (
        <button
          className={`shell-backdrop${isDrawerOpen ? ' is-visible' : ''}`}
          onClick={closeDrawer}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={[
          'app-sidebar',
          isDrawerOpen ? 'is-open' : '',
          drawerState === 'closing' ? 'is-closing' : '',
        ].filter(Boolean).join(' ')}
      >
        <div className="brand-lockup">
          <span className="brand-mark"><GraduationCap size={19} /></span>
          <span>
            <strong>SkillBridge</strong>
            <small>{portalLabel}</small>
          </span>
          <button className="mobile-close" onClick={closeDrawer} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <nav className="shell-nav" ref={navRef} aria-label="Primary navigation">
          {pill.ready && (
            <div
              className={`nav-pill${pill.animated ? ' is-animated' : ''}`}
              style={{ transform: `translateY(${pill.y}px)`, height: pill.h }}
              aria-hidden="true"
            />
          )}

          {navigation.map(([label, to, Icon], index) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/admin'}
              style={isDrawerOpen ? { animationDelay: `${index * 28}ms` } : undefined}
              className={({ isActive }) =>
                [isActive ? 'active' : '', isDrawerOpen ? 'nav-item-enter' : '']
                  .filter(Boolean).join(' ') || undefined
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className="sidebar-user"
          onClick={() => setSettingsOpen(true)}
          style={{ cursor: 'pointer' }}
          title="Click to edit profile, adjust credentials, and toggle theme"
        >
          {avatarContent}
          <div>
            <strong>{user?.name || 'SkillBridge user'}</strong>
            <span>{portal === 'admin' ? 'Administrator' : 'Student'}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <section className={`app-main${isDrawerOpen ? ' drawer-open' : ''}`}>
        <header className="shell-header">
          <div className="header-breadcrumbs">
            <button
              className="header-icon-btn mobile-menu-btn"
              onClick={openDrawer}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
            <div className="header-context">
              <span className="header-dot" aria-hidden="true" />
              <span>{portalLabel}</span>
            </div>
            <span className="header-separator" aria-hidden="true">/</span>
            <span className="header-page">{pageTitle}</span>
          </div>

          <div className="header-actions">
            <button
              className="header-icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={17} style={{ color: '#FBBF24' }} /> : <Moon size={17} style={{ color: '#1D1D1F' }} />}
            </button>
            <button
              className="header-icon-btn"
              onClick={() => setSettingsOpen(true)}
              aria-label="Adjust Profile & Settings"
              title="Adjust Profile & Settings"
            >
              <Settings size={17} style={{ color: isDark ? '#94A3B8' : '#6E6E73' }} />
            </button>
            <div
              className="header-profile"
              onClick={() => setSettingsOpen(true)}
              style={{ cursor: 'pointer' }}
              title="Click to edit profile"
            >
              <span>{user?.name || 'SkillBridge user'}</span>
              {avatarContent}
            </div>
          </div>
        </header>

        <main className="app-content" key={location.key}>
          <Outlet />
        </main>
      </section>
    </div>
  );
}
