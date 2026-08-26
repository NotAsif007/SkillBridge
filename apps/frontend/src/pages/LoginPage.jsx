import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Target,
  BarChart3,
  Loader2,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { devLogin, loginWithGoogle, isLoading, authError } = useAuth();

  const [activeTab, setActiveTab] = useState('STUDENT'); // 'STUDENT' | 'COLLEGE_ADMIN'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasGoogleClient, setHasGoogleClient] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId) {
      setHasGoogleClient(true);
    }

    const checkGSI = () => {
      if (clientId && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response?.credential) {
                setIsSubmitting(true);
                setLocalError('');
                try {
                  const res = await loginWithGoogle(response.credential);
                  const redirectPath =
                    res.user?.role === 'COLLEGE_ADMIN' || res.user?.role === 'SUPER_ADMIN'
                      ? '/admin'
                      : '/dashboard';
                  navigate(redirectPath, { replace: true });
                } catch (err) {
                  setLocalError(err.message || 'Google authentication failed');
                } finally {
                  setIsSubmitting(false);
                }
              }
            },
          });

          const googleBtnEl = document.getElementById('googleSignInBtn');
          if (googleBtnEl) {
            window.google.accounts.id.renderButton(googleBtnEl, {
              theme: 'filled_black',
              size: 'large',
              shape: 'rectangular',
              width: googleBtnEl.offsetWidth || 340,
              text: 'continue_with',
            });
          }
        } catch (err) {
          console.warn('Google GSI init notice:', err);
        }
      }
    };

    const timer = setTimeout(checkGSI, 500);
    return () => clearTimeout(timer);
  }, [loginWithGoogle, navigate]);

  const handleQuickDemo = async (role) => {
    setIsSubmitting(true);
    setLocalError('');
    try {
      if (role === 'STUDENT') {
        await devLogin({
          email: 'alex.chen@adtu.edu.in',
          name: 'Alex Chen',
          role: 'STUDENT',
        });
        navigate('/dashboard', { replace: true });
      } else {
        await devLogin({
          email: 'admin@adtu.edu.in',
          name: 'Dr. Sarah Jenkins',
          role: 'COLLEGE_ADMIN',
        });
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setLocalError('Please enter your institutional email address');
      return;
    }

    setIsSubmitting(true);
    setLocalError('');
    try {
      await devLogin({
        email: email.trim().toLowerCase(),
        name: name.trim() || email.split('@')[0],
        role: activeTab,
      });

      const redirectPath = location.state?.from?.pathname || (activeTab === 'COLLEGE_ADMIN' ? '/admin' : '/dashboard');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300 font-sans">
      {/* ─── Top Institutional Navigation Bar ─── */}
      <header className="border-b border-slate-800/80 bg-[#0B0F17]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-1 ring-white/10">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">SkillBridge</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ADTU
                </span>
              </div>
              <p className="text-xs text-slate-400">Institutional Placement Readiness Platform</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SOC-2 & FERPA Certified</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Hero & Interactive Login Section ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Value Proposition & Diagnostics Showcase */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Placement Engine & Multi-Tenant Portal</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Elevate University <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                Placement Velocity
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
              Equip students with deterministic career gap diagnostics, personalized AI roadmaps, ATS resume optimization, and multi-turn technical mock interviews.
            </p>
          </div>

          {/* 4 Feature Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-200">Skill Gap Diagnostics</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic readiness scores against 100+ standardized industry job profiles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-200">ATS Resume Benchmark</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Section-by-section ATS diagnostic scoring with actionable keyword optimization.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-200">AI Mock Interviews</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-turn technical evaluation state machine with instant rubric feedback.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-200">Admin Analytics</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cohort readiness distribution, departmental insights, and placement forecast.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Unified Access Portal Panel */}
        <div className="lg:col-span-5">
          <div className="bg-[#111827] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden ring-1 ring-white/5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500"></div>

            {/* Role Switcher Tabs */}
            <div className="flex p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('STUDENT');
                  setLocalError('');
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'STUDENT'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('COLLEGE_ADMIN');
                  setLocalError('');
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'COLLEGE_ADMIN'
                    ? 'bg-blue-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>College Admin</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {(localError || authError) && (
              <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                <span>{localError || authError}</span>
              </div>
            )}

            {/* Google OAuth Single Sign-On */}
            <div className="mb-6">
              <div id="googleSignInBtn" className="w-full flex justify-center min-h-[40px]"></div>

              {!hasGoogleClient && (
                <div className="text-center p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center justify-center space-x-2 text-slate-300 font-medium mb-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Google OAuth 2.0 Ready</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Add <code className="text-emerald-400">VITE_GOOGLE_CLIENT_ID</code> to frontend .env to enable instant Google One-Tap
                  </span>
                </div>
              )}
            </div>

            {/* Quick Sandbox Demo Login Action */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Instant Demo Sandbox
                </span>
                <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Pre-configured
                </span>
              </div>

              {activeTab === 'STUDENT' ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickDemo('STUDENT')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-850 hover:to-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-left group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      AC
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        Alex Chen
                      </p>
                      <p className="text-xs text-slate-400">CS Senior • Assam Down Town University</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-emerald-400 font-medium">
                    <span>Enter Portal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickDemo('COLLEGE_ADMIN')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-850 hover:to-slate-800 border border-slate-700/80 hover:border-blue-500/50 text-left group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                      SJ
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                        Dr. Sarah Jenkins
                      </p>
                      <p className="text-xs text-slate-400">Placement Dean • Assam Down Town University</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-blue-400 font-medium">
                    <span>Admin View</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              )}
            </div>

            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                Or Sign In with Email
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Custom Email Form */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  placeholder={activeTab === 'STUDENT' ? 'student@adtu.edu.in' : 'admin@adtu.edu.in'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name (Optional for new users)
                </label>
                <input
                  type="text"
                  placeholder={activeTab === 'STUDENT' ? 'Your Name' : 'Administrator Name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-950" />
                    <span>Sign In to {activeTab === 'STUDENT' ? 'Student Workspace' : 'College Console'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Single Sign-On (SSO) Active</span>
              </span>
              <span className="text-slate-400">Assam Down Town University v1.0.4</span>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F17] py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span>© 2026 SkillBridge Technologies Inc.</span>
            <span>•</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </a>
            <a href="#security" className="hover:text-slate-400 transition-colors">
              Security Architecture
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}