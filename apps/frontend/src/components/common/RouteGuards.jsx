import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

/**
 * Route guard ensuring the user is authenticated.
 * Redirects to /login if unauthenticated, preserving previous path in location state.
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-emerald-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-slate-300 font-medium text-sm tracking-wide">
            Verifying SkillBridge Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Route guard enforcing specific role permissions (e.g. STUDENT vs COLLEGE_ADMIN).
 */
export function RequireRole({ allowedRoles = [], children }) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    // If a student tries to view admin or vice versa, redirect them to their home portal
    const fallbackPath = role === 'COLLEGE_ADMIN' || role === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}