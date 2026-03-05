'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { signIn, signUp } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';

const SIGNIN_KEY = 'draft_signin';
const SIGNUP_KEY = 'draft_signup';
const MODE_KEY = 'draft_mode';

function readDraft(key: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeDraft(key: string, data: Record<string, string>) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem(MODE_KEY);
    const activeMode = savedMode === 'signup' ? 'signup' : 'signin';
    setMode(activeMode);

    const draft = readDraft(activeMode === 'signin' ? SIGNIN_KEY : SIGNUP_KEY);
    if (draft.email) setEmail(draft.email);
    if (draft.username) setUsername(draft.username ?? '');
  }, []);

  useEffect(() => {
    if (mode === 'signin') {
      writeDraft(SIGNIN_KEY, { email });
    } else {
      writeDraft(SIGNUP_KEY, { email, username });
    }
  }, [mode, email, username]);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      router.push('/board');
    }
  }, [user, router]);

  const validateFields = () => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup') {
      if (!username) {
        errors.username = 'Username is required';
      } else if (username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!validateFields()) {
      return;
    }

    let result;
    if (mode === 'signin') {
      result = await dispatch(signIn({ email, password }));
    } else {
      result = await dispatch(signUp({ email, password, username }));
    }

    if (result.meta.requestStatus === 'fulfilled') {
      localStorage.removeItem(SIGNIN_KEY);
      localStorage.removeItem(SIGNUP_KEY);
      localStorage.removeItem(MODE_KEY);
    }
  };

  const switchMode = (next: 'signin' | 'signup') => {
    if (next === mode) return;

    localStorage.setItem(MODE_KEY, next);

    const draft = readDraft(next === 'signin' ? SIGNIN_KEY : SIGNUP_KEY);
    setEmail(draft.email ?? '');
    setUsername(draft.username ?? '');
    setPassword('');
    setShowPassword(false);
    setFieldErrors({});
    setMode(next);
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4">
      <div className="flex flex-col items-center mb-8 select-none">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_4px_24px_rgba(99,102,241,0.3)] mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-200">TaskBoard</h1>
        <p className="text-sm text-slate-500 mt-1">Organize your tasks with ease</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl px-8 py-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-100">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-0.5">Sign in to your account or create a new one</p>
          </div>

          <div className="flex items-center bg-white/6 border border-white/10 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              disabled={loading}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === 'signin'
                  ? 'bg-white/10 text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              disabled={loading}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-white/10 text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  disabled={loading}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.username
                      ? 'bg-red-950/20 border border-red-500/50 focus:ring-red-500/30'
                      : 'bg-white/6 border border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50'
                  }`}
                />
                {fieldErrors.username && (
                  <p className="text-xs text-red-400">{fieldErrors.username}</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.email
                    ? 'bg-red-950/20 border border-red-500/50 focus:ring-red-500/30'
                    : 'bg-white/6 border border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`w-full px-3.5 py-2.5 pr-11 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.password
                      ? 'bg-red-950/20 border border-red-500/50 focus:ring-red-500/30'
                      : 'bg-white/6 border border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              loading={loading}
              className="w-full mt-1"
            >
              {mode === 'signin' ? 'Login' : 'Register'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
