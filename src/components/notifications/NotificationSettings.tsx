'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  updateNotificationSettings,
  updatePushNotificationSettings,
  setPushEnabled,
  setDaysBefore,
} from '@/store/slices/notificationSlice';
import { requestPushPermission } from '@/lib/notifications';

interface NotificationSettingsProps {
  onClose: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { daysBefore, pushEnabled } = useAppSelector((state) => state.notifications.notificationSettings);
  const [inputValue, setInputValue] = useState(String(daysBefore));
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  function handleDaysBlur() {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputValue(String(daysBefore));
      return;
    }
    if (parsed !== daysBefore) {
      dispatch(setDaysBefore(parsed));
      if (user?.id) {
        dispatch(updateNotificationSettings({ daysBefore: parsed, userId: user.id }));
      }
    }
  }

  async function handlePushToggle() {
    if (!pushEnabled) {
      const permission = await requestPushPermission();
      if (permission === 'granted') {
        dispatch(setPushEnabled(true));
        if (user?.id) {
          dispatch(updatePushNotificationSettings({ pushEnabled: true, userId: user.id }));
        }
      }
    } else {
      dispatch(setPushEnabled(false));
      if (user?.id) {
        dispatch(updatePushNotificationSettings({ pushEnabled: false, userId: user.id }));
      }
    }
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4 z-50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-100">Notification Settings</h3>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:bg-white/8 hover:text-slate-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
            Notify me before expiry
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={30}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleDaysBlur}
              className="w-16 text-center px-2 py-1.5 rounded-lg text-sm text-slate-200 bg-white/6 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all scheme-dark"
            />
            <span className="text-sm text-slate-400">days before expiry</span>
          </div>
        </div>

        <div className="h-px bg-white/[0.07]" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Push notifications</p>
            <p className="text-xs text-slate-500 leading-snug">
              {typeof window !== 'undefined' && 'Notification' in window
                ? Notification.permission === 'denied'
                  ? 'Blocked in browser settings'
                  : 'Receive alerts even when inactive'
                : 'Not supported in this browser'}
            </p>
          </div>
          <button
            onClick={handlePushToggle}
            className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
              pushEnabled ? 'bg-indigo-500' : 'bg-white/15'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                pushEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
