'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/store';
import { addTicket } from '@/store/slices/ticketsSlice';
import { PrioritySelector } from './PrioritySelector';
import { Button } from '@/components/ui/Button';
import { DueDateField } from './DueDateField';
import { toast } from '@/lib/toast';

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
  const [dueDateCalendarOpen, setDueDateCalendarOpen] = useState(false);
  const [priority, setPriority] = useState({ label: 'Low', color: '#22c55e', order: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dueDateCalendarOpen) {
          setDueDateCalendarOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, dueDateCalendarOpen]);

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
      toast.success('Ticket created successfully.');
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
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h2 className="text-base font-regular text-slate-200">New task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white hover:bg-white/8 hover:text-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="h-px bg-white/[0.07]" />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-regular uppercase tracking-wider text-white">
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
            className={`w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none  focus:ring-primary focus:border-primary transition-all ${
              titleError
                ? 'bg-red-950/20 border border-red-500/50'
                : 'bg-white/6 border border-white/10'
            }`}
          />
          {titleError && <p className="text-xs font-medium text-red-400">Title is required</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-regular uppercase tracking-wider text-white">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details…"
            rows={3}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 bg-white/6 border border-white/10 focus:outline-none focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <DueDateField
          label="Due date"
          value={expiryDate}
          onChange={setExpiryDate}
          onOpenChange={setDueDateCalendarOpen}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-regular uppercase tracking-wider text-white">
            Priority
          </label>
          <PrioritySelector value={priority} onChange={setPriority} />
        </div>

        <div className="h-px bg-white/[0.07]" />

        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
            loading={submitting}
          >
            Create task
          </Button>
        </div>
      </div>
    </div>
  );
}
