'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { signOut } from '@/src/store/slices/authSlice';
import { NotificationSettings } from '@/src/components/notifications/NotificationSettings';
import { getExpiryStatus } from '@/src/lib/notifications';

export function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const tickets = useAppSelector((state) => state.tickets.tickets);
  const daysBefore = useAppSelector((state) => state.notifications.notificationSettings.daysBefore);
  const [showSettings, setShowSettings] = useState(false);

  const handleSignOut = () => {
    dispatch(signOut());
  };

  const hasUrgentTickets = tickets.some((ticket) => {
    if (!ticket.expiryDate) return false;
    const { status } = getExpiryStatus(ticket.expiryDate, daysBefore);
    return status === 'warning' || status === 'danger' || status === 'overdue';
  });

  return (
    <nav className="h-14 bg-blue-600 flex items-center justify-between px-6 shadow-md flex-shrink-0">
      <span className="text-white text-xl font-bold tracking-tight">TaskBoard</span>
      <div className="flex items-center gap-4">
        <span className="text-blue-100 text-sm font-medium">{user?.username}</span>

        <div className="relative">
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className="relative p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-blue-500 transition-colors"
            aria-label="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {hasUrgentTickets && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          {showSettings && (
            <NotificationSettings onClose={() => setShowSettings(false)} />
          )}
        </div>

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
