'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { signIn, signUp } from '@/src/store/slices/authSlice';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-200">
      <div className="flex flex-col items-center mb-6 select-none">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-3">
          <span className="text-white text-xl font-bold tracking-tight">TL</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">TechLint</h1>
        <p className="text-sm text-gray-500 mt-1">Organize your tasks with ease</p>
      </div>

      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Welcome</h2>
            <p className="text-sm text-gray-500 mt-0.5">Login to your account or create a new one</p>
          </div>

          <div className="flex items-center bg-gray-100 rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              disabled={loading}
              className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                mode === 'signin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              disabled={loading}
              className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  disabled={loading}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white ${
                    fieldErrors.username ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.username}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className={`w-full px-4 py-2.5 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white ${
                  fieldErrors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`w-full px-4 py-2.5 pr-11 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white ${
                    fieldErrors.password ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gray-900 hover:bg-gray-800 active:bg-black text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {mode === 'signin' ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </div>

      <button
        type="button"
        className="fixed bottom-6 right-6 w-9 h-9 rounded-full bg-gray-800 text-white text-sm font-semibold flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
        aria-label="Help"
      >
        ?
      </button>
    </div>
  );
}
