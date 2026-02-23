'use client';

import { useState, FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { signIn, signOut } from '@/src/store/slices/authSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const { user, token, loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await dispatch(signIn({ email, password }));
  };

  const handleSignOut = async () => {
    await dispatch(signOut());
  };

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
          <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Welcome Back!
          </h1>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Username</p>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {user.username}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Email</p>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {user.email}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Token Status</p>
              <p className="text-lg font-medium text-green-600">
                {token ? 'Active' : 'None'}
              </p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Sign In
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
            />
          </div>
          
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
