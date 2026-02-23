'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/src/store/store';
import { loadSession } from '@/src/store/slices/authSlice';

export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  return null;
}
