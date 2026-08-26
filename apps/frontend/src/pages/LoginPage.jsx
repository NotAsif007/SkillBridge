import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Check, GraduationCap, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { devLogin, loginWithGoogle, isLoading, authError } = useAuth();
  const [role, setRole] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const finishGoogleLogin = async (credential) => {
    setSubmitting(true); setError('');
    try {
      const result = await loginWithGoogle(credential);
      navigate(result.user?.role === 'COLLEGE_ADMIN' || result.user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) { setError(err.message || 'Google authentication failed.'); }
    finally { setSubmitting(false); }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const startGoogle = () => {
      const target = document.getElementById('googleSignInBtn');
      if (!clientId || !target || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: ({ credential }) => credential && finishGoogleLogin(credential) });
      window.google.accounts.id.renderButton(target, { theme: 'outline', size: 'large', shape: 'pill', width: target.offsetWidth || 360, text: 'continue_with' });
    };
    const timer = window.setTimeout(startGoogle, 250);
    return () => window.clearTimeout(timer);
  }, []);

  const signIn = async (payload) => {
    setSubmitting(true); setError('');
    try {
      await devLogin(payload);
      navigate(location.state?.from?.pathname || (payload.role === 'COLLEGE_ADMIN' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) { setError(err.message || 'Sign in failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const submit = (event) => {
    event.preventDefault();
    if (!email.trim()) return setError('Enter your institutional email address.');
    signIn({ email: email.trim().toLowerCase(), name: name.trim() || email.split('@')[0], role });
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-brand"><span><GraduationCap size={19} /></span><strong>CareerOS</strong></div>
        <div className="trust-label"><ShieldCheck size={15} /> Secure institutional access</div>
      </header>
      <main className="login-main">
        <section className="login-intro">
          <p className="eyebrow"><Sparkles size={14} /> Placement readiness, made clear</p>
          <h1>Every next step,<br /><em>in focus.</em></h1>
          <p className="intro-copy">A calm, practical workspace for career planning, skill evidence, and placement progress.</p>
          <ul className="value-list">
            <li><Check size={16} /> Deterministic career readiness</li>
            <li><Check size={16} /> Guided skill-building plans</li>
            <li><Check size={16} /> Private, role-based workspaces</li>
          </ul>
        </section>
        <section className="login-card" aria-label="Sign in to CareerOS">
          <div><p className="card-kicker">Welcome to CareerOS</p><h2>Sign in to continue</h2><p>Use your institution account or enter the demo workspace.</p></div>
          <div className="role-switch" role="tablist" aria-label="Workspace type">
            <button className={role === 'STUDENT' ? 'active' : ''} onClick={() => setRole('STUDENT')}><GraduationCap size={16} /> Student</button>
            <button className={role === 'COLLEGE_ADMIN' ? 'active' : ''} onClick={() => setRole('COLLEGE_ADMIN')}><Building2 size={16} /> Administrator</button>
          </div>
          {(error || authError) && <p className="login-error" role="alert">{error || authError}</p>}
          <div id="googleSignInBtn" className="google-signin" />
          <div className="divider"><span>or continue with email</span></div>
          <form onSubmit={submit} className="login-form">
            <label>Institutional email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@university.edu" autoComplete="email" /></label>
            <label>Name <span>optional</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" /></label>
            <button disabled={submitting || isLoading} type="submit">{submitting ? <Loader2 size={17} className="spin" /> : <>Continue <ArrowRight size={17} /></>}</button>
          </form>
          <button className="demo-entry" disabled={submitting || isLoading} onClick={() => signIn(role === 'STUDENT'
            ? { email: 'alex.chen@adtu.edu.in', name: 'Alex Chen', role: 'STUDENT' }
            : { email: 'admin@adtu.edu.in', name: 'Dr. Sarah Jenkins', role: 'COLLEGE_ADMIN' })}>
            Open {role === 'STUDENT' ? 'student' : 'administrator'} demo <ArrowRight size={15} />
          </button>
        </section>
      </main>
      <footer className="login-footer">CareerOS · A private placement readiness workspace</footer>
    </div>
  );
}
