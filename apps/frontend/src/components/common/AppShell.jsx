import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3, BriefcaseBusiness, Building2, ClipboardCheck, Compass, FileText,
  FolderKanban, GraduationCap, LayoutDashboard, LogOut, Map, Menu, MessageSquare,
  User, Users, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = portal === 'admin' ? adminNavigation : studentNavigation;
  const portalLabel = portal === 'admin' ? 'Institution workspace' : 'Student workspace';

  /* Derive current page title from the pathname */
  const pageTitle = useMemo(() => {
    const { pathname } = location;
    /* Exact match first */
    if (routeLabels[pathname]) return routeLabels[pathname];
    /* Prefix match for dynamic routes like /careers/:id */
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
      {open && (
        <button
          className="shell-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}

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

        <div className="sidebar-user">
          {avatarContent}
          <div>
            <strong>{user?.name || 'CareerOS user'}</strong>
            <span>{portal === 'admin' ? 'Administrator' : 'Student'}</span>
          </div>
          <button onClick={handleLogout} aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

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
          <div className="header-profile">
            <span>{user?.name || 'CareerOS user'}</span>
            {avatarContent}
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
