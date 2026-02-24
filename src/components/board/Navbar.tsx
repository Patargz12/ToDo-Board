'use client';

import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { signOut } from '@/src/store/slices/authSlice';

export function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleSignOut = () => {
    dispatch(signOut());
  };

  return (
    <nav className="h-14 bg-blue-600 flex items-center justify-between px-6 shadow-md flex-shrink-0">
      <span className="text-white text-xl font-bold tracking-tight">TaskBoard</span>
      <div className="flex items-center gap-4">
        <span className="text-blue-100 text-sm font-medium">{user?.username}</span>
        <button
          onClick={handleSignOut}
          className="text-sm bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
