/**
 * AdminLayout.jsx
 *
 * The visual shell for all admin portal pages.
 * Renders:  fixed sidebar (260px desktop) + top header + <Outlet /> content area.
 *
 * Design source: docs/DESIGN.md
 * API source:    docs/API_CONTRACT.md  (auth/me response shape)
 *
 * ─── Extraction note ────────────────────────────────────────────────────────
 * The AdminSidebar and AdminHeader sub-components defined below are intentionally
 * local to this file.  When shared components (src/components/common/Sidebar.jsx
 * and Navbar.jsx) are implemented by the shared-component owner, replace:
 *
 *   import AdminSidebar from './AdminSidebar'; // local
 *   →  import Sidebar from '../components/common/Sidebar';
 *
 *   import AdminHeader  from './AdminHeader';  // local
 *   →  import Navbar   from '../components/common/Navbar';
 *
 * The page structure (<div> shell, <Outlet />) does NOT change.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Auth integration note:
 * This layout currently accepts an optional `user` prop for forward-compatibility.
 * Once providers.jsx delivers AuthContext, swap the prop for:
 *   const { user, logout } = useAuth();
 * No structural changes to the layout are required.
 */

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  ClipboardList,
  MessageSquare,
  Briefcase,
  Menu,
  X,
  LogOut,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

// ─── Design tokens (from docs/DESIGN.md) ────────────────────────────────────
// Using Tailwind arbitrary values so this layout works before tailwind.config.js
// custom theme extensions are in place.  Once the config is set up, these can
// be replaced with semantic class names (bg-app, bg-surface, etc.).

const COLORS = {
  appBg:       '#0B0F17',   // Deep Obsidian
  surface:     '#111827',   // Card Dark
  border:      '#1F2937',   // Dark Border
  textPrimary: '#F9FAFB',
  textMuted:   '#9CA3AF',
  blue:        '#2563EB',   // Interactive Blue
  blueHover:   '#1D4ED8',
  cobalt:      '#1E3A8A',   // Institutional Primary
  emerald:     '#059669',
};

// ─── Navigation items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/admin',              icon: LayoutDashboard, end: true },
  { label: 'Students',     href: '/admin/students',     icon: Users },
  { label: 'Departments',  href: '/admin/departments',  icon: Building2 },
  { label: 'Analytics',    href: '/admin/analytics',    icon: BarChart3 },
  { label: 'Assessments',  href: '/admin/assessments',  icon: ClipboardList },
  { label: 'Interviews',   href: '/admin/interviews',   icon: MessageSquare },
  { label: 'Jobs',         href: '/admin/jobs',         icon: Briefcase },
];

// ─── AdminSidebar ─────────────────────────────────────────────────────────────
// Extract to src/components/common/Sidebar.jsx when shared component is ready.
function AdminSidebar({ isOpen, onClose, user, onLogout }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        role="navigation"
        aria-label="Admin navigation"
        className={[
          'fixed top-0 left-0 z-30 h-full flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          width: '260px',
          backgroundColor: COLORS.surface,
          borderRight: `1px solid ${COLORS.border}`,
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: `1px solid ${COLORS.border}` }}
        >
          <div
            className="flex items-center justify-center rounded-lg w-8 h-8 flex-shrink-0"
            style={{ backgroundColor: COLORS.blue }}
          >
            <GraduationCap size={18} color="#ffffff" strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <span
              className="font-bold tracking-tight text-sm leading-none"
              style={{ color: COLORS.textPrimary, fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif' }}
            >
              CareerOS
            </span>
            <p
              className="text-xs mt-0.5"
              style={{ color: COLORS.textMuted, letterSpacing: '0.01em' }}
            >
              Admin Portal
            </p>
          </div>

          {/* Close button — mobile only */}
          <button
            className="ml-auto lg:hidden rounded-lg p-1 transition-colors"
            style={{ color: COLORS.textMuted }}
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main admin menu">
          <ul role="list" className="space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon, end }) => (
              <li key={href}>
                <NavLink
                  to={href}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2',
                      isActive
                        ? 'text-white'
                        : 'hover:text-white',
                    ].join(' ')
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? COLORS.blue : 'transparent',
                    color: isActive ? '#ffffff' : COLORS.textMuted,
                    fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif',
                  })}
                  aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2 : 1.75}
                        aria-hidden="true"
                        style={{ color: isActive ? '#ffffff' : COLORS.textMuted, flexShrink: 0 }}
                      />
                      <span className="flex-1">{label}</span>
                      {isActive && (
                        <ChevronRight size={14} aria-hidden="true" style={{ color: 'rgba(255,255,255,0.6)' }} />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Profile / Logout footer */}
        {/*
         * Auth integration point:
         * `user` is currently passed as a prop.  Replace with `const { user, logout } = useAuth()`
         * inside AdminLayout once providers.jsx is ready — no changes needed here.
         */}
        <div
          className="px-3 py-4"
          style={{ borderTop: `1px solid ${COLORS.border}` }}
        >
          {user ? (
            <div className="flex items-center gap-3 px-3 py-2">
              {/* Avatar */}
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                  style={{ backgroundColor: COLORS.cobalt, color: '#ffffff' }}
                  aria-hidden="true"
                >
                  {user.name?.charAt(0)?.toUpperCase() ?? 'A'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: COLORS.textPrimary, fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {user.name}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: COLORS.textMuted }}
                >
                  {user.organization?.name ?? 'College Admin'}
                </p>
              </div>
            </div>
          ) : (
            /* Skeleton placeholder — shown while auth loads */
            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className="w-8 h-8 rounded-full animate-pulse flex-shrink-0"
                style={{ backgroundColor: COLORS.border }}
                aria-hidden="true"
              />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded animate-pulse" style={{ backgroundColor: COLORS.border, width: '70%' }} />
                <div className="h-2.5 rounded animate-pulse" style={{ backgroundColor: COLORS.border, width: '50%' }} />
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="mt-2 flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors duration-150"
            style={{
              color: COLORS.textMuted,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.08)';
              e.currentTarget.style.color = '#F87171';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = COLORS.textMuted;
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── AdminHeader ──────────────────────────────────────────────────────────────
// Extract to src/components/common/Navbar.jsx when shared component is ready.
function AdminHeader({ onMenuOpen, pageTitle }) {
  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-4 px-4 sm:px-6 lg:px-8"
      style={{
        height: '56px',
        backgroundColor: COLORS.appBg,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
      role="banner"
    >
      {/* Mobile hamburger */}
      <button
        className="lg:hidden rounded-lg p-1.5 transition-colors"
        style={{ color: COLORS.textMuted }}
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
        aria-expanded="false"
        aria-controls="admin-sidebar"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* Page title — populated via pageTitle prop (future: from route meta) */}
      {pageTitle && (
        <h1
          className="text-sm font-semibold hidden sm:block"
          style={{
            color: COLORS.textPrimary,
            fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          {pageTitle}
        </h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right-side header actions placeholder.
          When auth is wired, add notification bell, user avatar menu here. */}
      <div className="flex items-center gap-2">
        <div
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{
            backgroundColor: 'rgba(30,58,138,0.25)',
            color: '#93C5FD',
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.01em',
          }}
          aria-label="User role"
        >
          Admin
        </div>
      </div>
    </header>
  );
}

// ─── AdminLayout (main export) ────────────────────────────────────────────────
/**
 * @param {object} props
 * @param {object|null} [props.user]    - Authenticated user object from /auth/me.
 *                                        Shape: { name, email, profileImage, organization: { name } }
 *                                        Pass null / undefined while auth is loading.
 * @param {Function}   [props.onLogout] - Logout handler.  Pass authApi.logout or useAuth().logout.
 * @param {string}     [props.pageTitle] - Optional current page title for the header.
 *
 * Once useAuth() is available, call this component without props and read auth
 * state internally. See inline "Auth integration point" comments.
 */
export default function AdminLayout({ user = null, onLogout, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // ── Logout handler ──────────────────────────────────────────────────────────
  // Replace with useAuth().logout once providers.jsx is ready.
  async function handleLogout() {
    try {
      if (typeof onLogout === 'function') {
        await onLogout();
      }
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundColor: COLORS.appBg,
        fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif',
        color: COLORS.textPrimary,
      }}
    >
      {/* ── Sidebar ── */}
      <AdminSidebar
        id="admin-sidebar"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* ── Main column (offset by sidebar on desktop) ── */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ paddingLeft: '0' }}
      >
        {/* Apply sidebar offset only on lg+ */}
        <style>{`
          @media (min-width: 1024px) {
            .admin-main-column { padding-left: 260px; }
          }
        `}</style>

        <div className="admin-main-column flex flex-col flex-1 min-w-0">
          {/* ── Header ── */}
          <AdminHeader
            onMenuOpen={() => setSidebarOpen(true)}
            pageTitle={pageTitle}
          />

          {/* ── Page content ── */}
          <main
            className="flex-1 px-4 sm:px-6 lg:px-8 py-6"
            id="main-content"
            role="main"
            style={{ maxWidth: '1440px', width: '100%', alignSelf: 'center' }}
          >
            {/*
             * <Outlet /> renders the matched child route component.
             * Each admin page (AdminDashboard, StudentList, etc.) is rendered here.
             */}
            <Outlet />
          </main>

          {/* ── Footer ── */}
          <footer
            className="px-4 sm:px-6 lg:px-8 py-4 text-xs"
            style={{
              borderTop: `1px solid ${COLORS.border}`,
              color: COLORS.textMuted,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            role="contentinfo"
          >
            CareerOS &copy; {new Date().getFullYear()} &mdash; Admin Portal
          </footer>
        </div>
      </div>
    </div>
  );
}
