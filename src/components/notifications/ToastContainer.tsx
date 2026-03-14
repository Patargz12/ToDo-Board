'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { removeToast, Toast } from '@/store/slices/notificationSlice';

const typeStyles: Record<Toast['type'], string> = {
  info: 'border-sky-400/30 text-slate-200',
  warning: 'border-amber-400/35 text-slate-200',
  error: 'border-rose-400/35 text-slate-200',
  success: 'border-emerald-400/35 text-slate-200',
};

const iconWrapStyles: Record<Toast['type'], string> = {
  info: 'bg-sky-400/15 text-sky-300',
  warning: 'bg-amber-400/15 text-amber-300',
  error: 'bg-rose-400/15 text-rose-300',
  success: 'bg-emerald-400/15 text-emerald-300',
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
  const closingRef = useRef(false);

  const closeWithAnimation = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (containerRef.current) {
      containerRef.current.style.transition = 'opacity 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
      containerRef.current.style.opacity = '0';
      containerRef.current.style.transform = 'translateX(110%)';
      setTimeout(() => dispatch(removeToast(toast.id)), 320);
      return;
    }

    dispatch(removeToast(toast.id));
  }, [dispatch, toast.id]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.opacity = '0';
      containerRef.current.style.transform = 'translateX(110%)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = 'opacity 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
            containerRef.current.style.opacity = '1';
            containerRef.current.style.transform = 'translateX(0)';
          }
        });
      });
    }

    timerRef.current = setTimeout(() => {
      closeWithAnimation();
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [closeWithAnimation]);

  function handleClose() {
    closeWithAnimation();
  }

  return (
    <div
      ref={containerRef}
      className={`flex items-center w-full max-w-sm p-4 rounded-xl border bg-slate-900/95 backdrop-blur-xl shadow-[0_12px_28px_rgba(2,6,23,0.65)] ${typeStyles[toast.type]}`}
      role="alert"
    >
      <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${iconWrapStyles[toast.type]}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[toast.type]} />
        </svg>
      </div>

      <div className="ms-3 text-sm font-medium leading-snug border-s ps-3 flex-1 min-w-0 border-white/10">
        {toast.message}
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="ms-auto -mx-1.5 -my-1.5 shrink-0 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-white/8 transition-colors"
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
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none animate-in fade-in duration-200 delay-300">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
