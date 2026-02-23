import { User } from '@/src/types';

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('user_profile');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const clearStoredAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_profile');
};

export const storeAuth = (token: string, user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_profile', JSON.stringify(user));
};
