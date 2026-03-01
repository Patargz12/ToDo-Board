'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { removeToast, Toast } from '@/src/store/slices/notificationSlice';

const typeStyles: Record<Toast['type'], string> = {
  info: 'bg-blue-50 border-blue-300 text-blue-800',
  warning: 'bg-amber-50 border-amber-300 text-amber-800',
  error: 'bg-red-50 border-red-300 text-red-800',
  success: 'bg-green-50 border-green-300 text-green-800',
};

const iconPaths: Record<Toast['type'], string> = {
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
};

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.opacity = '0';
      containerRef.current.style.transform = 'translateX(100%)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = 'opacity 300ms ease, transform 300ms ease';
            containerRef.current.style.opacity = '1';
            containerRef.current.style.transform = 'translateX(0)';
          }
        });
      });
    }

    timerRef.current = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dispatch, toast.id]);

  function handleClose() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (containerRef.current) {
      containerRef.current.style.transition = 'opacity 250ms ease, transform 250ms ease';
      containerRef.current.style.opacity = '0';
      containerRef.current.style.transform = 'translateX(100%)';
      setTimeout(() => dispatch(removeToast(toast.id)), 250);
    } else {
      dispatch(removeToast(toast.id));
    }
  }

  return (
    <div
      ref={containerRef}
      className={`flex items-center gap-3 min-w-72 max-w-sm w-full px-4 py-3 rounded-xl border shadow-lg ${typeStyles[toast.type]}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[toast.type]} />
      </svg>
      <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={handleClose}
        className="shrink-0 ml-1 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.notifications.toasts);

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
