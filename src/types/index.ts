export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  notificationDaysBefore: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  position: number;
  userId: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  expiryDate: string;
  priorityLabel: string;
  priorityColor: string;
  priorityOrder: number;
  categoryId: string;
  userId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Draft {
  id: string;
  ticketId: string | null;
  title: string;
  description: string;
  userId: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  type: 'board' | 'card';
  action: string;
  details: Record<string, unknown>;
  ticketId: string | null;
  userId: string;
  createdAt: string;
}

export interface PriorityLevel {
  label: string;
  color: string;
  order: number;
}
