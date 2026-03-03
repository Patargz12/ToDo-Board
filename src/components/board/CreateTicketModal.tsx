'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/store';
import { addTicket } from '@/store/slices/ticketsSlice';
import { PrioritySelector } from './PrioritySelector';

interface CreateTicketModalProps {
  categoryId: string;
  onClose: () => void;
}

export function CreateTicketModal({ categoryId, onClose }: CreateTicketModalProps) {
  const dispatch = useAppDispatch();
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [priority, setPriority] = useState({ label: 'Low', color: '#22c55e', order: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError(true);
      titleRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        addTicket({
          title: title.trim(),
          description: description.trim(),
          expiryDate,
          priorityLabel: priority.label,
          priorityColor: priority.color,
          priorityOrder: priority.order,
          categoryId,
        })
      ).unwrap();
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-xl rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 flex flex-col gap-5">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-200">New task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-white/8 hover:text-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="h-px bg-white/[0.07]" />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="What needs to be done?"
            className={`w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all ${
              titleError
                ? 'bg-red-950/20 border border-red-500/50'
                : 'bg-white/6 border border-white/10'
            }`}
          />
          {titleError && <p className="text-xs font-medium text-red-400">Title is required</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details…"
            rows={3}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 bg-white/6 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 resize-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Due date
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 bg-white/6 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 scheme-dark transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Priority
          </label>
          <PrioritySelector value={priority} onChange={setPriority} />
        </div>

        <div className="h-px bg-white/[0.07]" />

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl text-slate-400 bg-white/7 border border-white/10 hover:bg-white/12 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-linear-to-br from-indigo-500 to-violet-500 shadow-[0_4px_14px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.55)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Create task
          </button>
        </div>
      </div>
    </div>
  );
}
