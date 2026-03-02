'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/store';
import { loadSession } from '@/store/slices/authSlice';

export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  return null;
}
