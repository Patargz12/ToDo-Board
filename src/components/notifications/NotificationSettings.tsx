'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { updateNotificationSettings, setPushEnabled, setDaysBefore } from '@/src/store/slices/notificationSlice';
import { requestPushPermission } from '@/src/lib/notifications';

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
      }
    } else {
      dispatch(setPushEnabled(false));
    }
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Notification Settings</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
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
              className="w-16 text-center px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500">days before expiry</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600">Browser push notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {typeof window !== 'undefined' && 'Notification' in window
                ? Notification.permission === 'denied'
                  ? 'Blocked in browser settings'
                  : 'Receive alerts even when inactive'
                : 'Not supported in this browser'}
            </p>
          </div>
          <button
            onClick={handlePushToggle}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
              pushEnabled ? 'bg-blue-600' : 'bg-gray-200'
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
