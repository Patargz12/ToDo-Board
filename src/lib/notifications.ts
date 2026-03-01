export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

export function sendPushNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/favicon.ico' });
}

export interface ExpiryStatus {
  status: 'safe' | 'warning' | 'danger' | 'overdue';
  daysLeft: number;
  label: string;
}

export function getExpiryStatus(expiryDate: string, daysBefore: number): ExpiryStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { status: 'overdue', daysLeft, label: 'Overdue' };
  }
  if (daysLeft === 0) {
    return { status: 'danger', daysLeft, label: 'Due today' };
  }
  if (daysLeft === 1) {
    return { status: 'danger', daysLeft, label: '1 day left' };
  }
  if (daysLeft <= daysBefore) {
    return { status: 'warning', daysLeft, label: `${daysLeft} days left` };
  }
  return { status: 'safe', daysLeft, label: `${daysLeft} days left` };
}
