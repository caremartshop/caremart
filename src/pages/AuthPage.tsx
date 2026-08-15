import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { Logo } from '../components/common/Logo';
import { GoogleGLogo } from '../components/common/PaymentLogos';
import { ShieldCheck, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot-password';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  const { navigateTo, addToast } = useShop();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnauthorizedDomain(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        addToast('Welcome Back!', 'Logged in securely to your private account.');
        navigateTo('profile');
      } else if (mode === 'register') {
        await register(email, password, name);
        addToast('Account Created!', 'Your confidential member profile is active.');
        navigateTo('profile');
      } else if (mode === 'forgot-password') {
        await resetPassword(email);
        addToast('Password Reset Sent', 'Check your confidential email inbox for instructions.');
        setMode('login');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('auth/unauthorized-domain') || errMsg.includes('unauthorized-domain')) {
        setUnauthorizedDomain(window.location.hostname);
        setError('This domain is not authorized in your Firebase Console for OAuth popup operations.');
      } else {
        setError(errMsg || 'Authentication failed. Check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Logo size="lg" className="justify-center" />
        <h1 className="text-2xl font-extrabold text-slate-900 pt-2">
          {mode === 'login' && 'Sign In to Your Account'}
          {mode === 'register' && 'Create Confidential Profile'}
          {mode === 'forgot-password' && 'Reset Account Password'}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Encrypted authentication with zero data sharing.
        </p>
      </div>

      {/* Form Container */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 space-y-6 shadow-sm">
        
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium space-y-1.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-bold">{error}</span>
            </div>
            {unauthorizedDomain && (
              <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-[11px] text-slate-700 space-y-1 mt-2">
                <p className="font-bold text-slate-900">How to fix Google Sign-In:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-slate-600">
                  <li>Go to <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong>.</li>
                  <li>Add <code>{unauthorizedDomain}</code> to the allowed domains list.</li>
                </ol>
                <p className="pt-1 text-slate-500 italic">
                  💡 Tip: You can sign in right now using <strong>Email & Password</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-900">
          
          {mode === 'register' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-red-600"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-red-600"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {mode !== 'forgot-password' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-slate-700 font-bold">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-red-600 hover:underline text-[11px] font-bold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-red-600"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Account'
                : 'Send Password Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Google Auth Button */}
        {mode !== 'forgot-password' && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <button
              onClick={async () => {
                setError(null);
                setUnauthorizedDomain(null);
                try {
                  await loginWithGoogle();
                  addToast('Google Sign In Success', 'Logged in via Google Authentication.');
                  navigateTo('profile');
                } catch (e: any) {
                  console.error('Google Auth error:', e);
                  const errMsg = e?.message || String(e);
                  if (errMsg.includes('auth/unauthorized-domain') || errMsg.includes('unauthorized-domain')) {
                    setUnauthorizedDomain(window.location.hostname);
                    setError(`Google Sign-In is blocked because domain "${window.location.hostname}" is not authorized in Firebase.`);
                  } else {
                    setError(errMsg || 'Google Auth failed');
                  }
                }
              }}
              className="w-full py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2.5 shadow-xs"
            >
              <GoogleGLogo className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Toggle Mode Footer */}
        <div className="text-center text-xs text-slate-500 pt-2 font-medium">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="text-red-600 font-bold hover:underline">
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-red-600 font-bold hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
