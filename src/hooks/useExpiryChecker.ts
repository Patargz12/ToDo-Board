'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { addToast } from '@/src/store/slices/notificationSlice';
import { getExpiryStatus, sendPushNotification } from '@/src/lib/notifications';

export function useExpiryChecker() {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector((state) => state.tickets.tickets);
  const daysBefore = useAppSelector((state) => state.notifications.notificationSettings.daysBefore);
  const pushEnabled = useAppSelector((state) => state.notifications.notificationSettings.pushEnabled);
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (tickets.length === 0) return;

    function check() {
      tickets.forEach((ticket) => {
        if (!ticket.expiryDate) return;
        const { status, daysLeft, label } = getExpiryStatus(ticket.expiryDate, daysBefore);

        if (status === 'safe') return;

        const key = `${ticket.id}:${status}`;
        if (notifiedIds.current.has(key)) return;
        notifiedIds.current.add(key);

        if (status === 'overdue') {
          dispatch(addToast({ message: `"${ticket.title}" is overdue`, type: 'error' }));
          if (pushEnabled) {
            sendPushNotification('Overdue Ticket', `"${ticket.title}" is overdue`);
          }
        } else if (status === 'danger') {
          dispatch(addToast({ message: `"${ticket.title}": ${label}`, type: 'error' }));
          if (pushEnabled) {
            sendPushNotification('Ticket Due Soon', `"${ticket.title}": ${label}`);
          }
        } else if (status === 'warning') {
          dispatch(addToast({ message: `"${ticket.title}" expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`, type: 'warning' }));
          if (pushEnabled) {
            sendPushNotification('Upcoming Expiry', `"${ticket.title}" expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`);
          }
        }
      });
    }

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [tickets, daysBefore, pushEnabled, dispatch]);
}
