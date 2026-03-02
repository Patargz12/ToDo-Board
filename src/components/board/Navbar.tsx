'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { signOut } from '@/src/store/slices/authSlice';
import { NotificationSettings } from '@/src/components/notifications/NotificationSettings';
import { getExpiryStatus } from '@/src/lib/notifications';

interface NavbarProps {
  onOpenHistory?: () => void;
}

export function Navbar({ onOpenHistory }: NavbarProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const tickets = useAppSelector((state) => state.tickets.tickets);
  const daysBefore = useAppSelector((state) => state.notifications.notificationSettings.daysBefore);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = () => {
    dispatch(signOut());
  };

  const hasUrgentTickets = tickets.some((ticket) => {
    if (!ticket.expiryDate) return false;
    const { status } = getExpiryStatus(ticket.expiryDate, daysBefore);
    return status === 'warning' || status === 'danger' || status === 'overdue';
  });

  return (
    <nav
      className="h-14 bg-blue-600 flex items-center justify-between px-4 sm:px-6 shadow-md shrink-0 relative">
      <span className="text-white text-xl font-bold tracking-tight">TaskBoard</span>

      <div className="hidden sm:flex items-center gap-4">
        <span className="text-blue-100 text-sm font-medium">{user?.username}</span>

        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 text-sm text-blue-100 hover:text-white hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.56" />
            </svg>
            History
          </button>
        )}

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

      <div className="flex sm:hidden items-center gap-2">
        {hasUrgentTickets && (
          <span className="w-2 h-2 bg-red-500 rounded-full" />
        )}
        <button
          onClick={() => setShowMobileMenu((prev) => !prev)}
          className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-blue-500 transition-colors"
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            {showMobileMenu ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {showMobileMenu && (
        <div className="absolute top-14 right-0 left-0 bg-blue-700 shadow-lg z-30 flex flex-col sm:hidden">
          <div className="px-4 py-3 border-b border-blue-600">
            <p className="text-blue-100 text-sm font-medium">{user?.username}</p>
          </div>
          {onOpenHistory && (
            <button
              onClick={() => { setShowMobileMenu(false); onOpenHistory(); }}
              className="flex items-center gap-2 px-4 py-3 text-sm text-blue-100 hover:bg-blue-600 transition-colors text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.56" />
              </svg>
              Board History
            </button>
          )}
          <button
            onClick={() => { setShowMobileMenu(false); setShowSettings(true); }}
            className="flex items-center gap-2 px-4 py-3 text-sm text-blue-100 hover:bg-blue-600 transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notification settings
            {hasUrgentTickets && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-3 text-sm text-blue-100 hover:bg-blue-600 transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
          {showSettings && (
            <div className="px-4 py-3 border-t border-blue-600">
              <NotificationSettings onClose={() => setShowSettings(false)} />
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

