'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

interface DueDateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  placeholder?: string;
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function DueDateField({
  label,
  value,
  onChange,
  onOpenChange,
  placeholder = 'Pick a due date',
}: DueDateFieldProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseDate(value);

  const updateCalendarOpen = useCallback((isOpen: boolean) => {
    setCalendarOpen(isOpen);
    onOpenChange?.(isOpen);
  }, [onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        updateCalendarOpen(false);
      }
    };

    if (calendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [calendarOpen, updateCalendarOpen]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-regular uppercase tracking-wider text-white">
        {label}
      </label>
      <div className="relative" ref={calendarRef}>
        <button
          type="button"
          onClick={() => updateCalendarOpen(!calendarOpen)}
          className={`w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-left transition-all bg-white/6 border ${
            calendarOpen ? 'border-primary/60' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
          <span className={selectedDate ? 'text-slate-200' : 'text-slate-500'}>
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}
          </span>
          {selectedDate && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange('');
                }
              }}
              className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Clear due date"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
          )}
        </button>

        {calendarOpen && (
          <div className="absolute z-50 top-full mt-1.5 left-0 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onChange(date ? format(date, 'yyyy-MM-dd') : '');
                updateCalendarOpen(false);
              }}
              classNames={{
                root: 'text-slate-200',
                weekday: 'text-slate-500 text-center',
                outside: 'text-slate-600 opacity-40',
                today: 'rounded-md bg-white/8 text-primary font-semibold data-[selected=true]:rounded-none',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}