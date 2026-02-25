'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/src/store/store';
import { addTicket } from '@/src/store/slices/ticketsSlice';

interface CreateTicketModalProps {
  categoryId: string;
  onClose: () => void;
}

const DEFAULT_PRIORITIES = [
  { label: 'Low', color: '#22c55e', order: 0 },
  { label: 'Medium', color: '#eab308', order: 1 },
  { label: 'High', color: '#f97316', order: 2 },
  { label: 'Urgent', color: '#ef4444', order: 3 },
];

export function CreateTicketModal({ categoryId, onClose }: CreateTicketModalProps) {
  const dispatch = useAppDispatch();
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(DEFAULT_PRIORITIES[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customColor, setCustomColor] = useState('#6366f1');
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

  const activePriority = isCustom
    ? { label: customLabel || 'Custom', color: customColor, order: 99 }
    : selectedPriority;

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
          priorityLabel: activePriority.label,
          priorityColor: activePriority.color,
          priorityOrder: activePriority.order,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-gray-800">New task</h2>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Title <span className="text-red-500">*</span>
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
            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-shadow ${
              titleError
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-300 focus:ring-blue-400'
            }`}
          />
          {titleError && <p className="text-xs text-red-500 mt-0.5">Title is required</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-shadow"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due date</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_PRIORITIES.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setSelectedPriority(p);
                  setIsCustom(false);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                style={
                  !isCustom && selectedPriority.label === p.label
                    ? { backgroundColor: p.color, borderColor: p.color, color: '#fff' }
                    : { backgroundColor: p.color + '18', borderColor: p.color + '60', color: p.color }
                }
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                isCustom
                  ? 'bg-gray-700 border-gray-700 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              Custom
            </button>
          </div>

          {isCustom && (
            <div className="flex items-center gap-2 mt-1">
              <input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Label name"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Color</span>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: activePriority.color + '22', color: activePriority.color }}
            >
              {activePriority.label}
            </span>
            <span className="text-xs text-gray-400">preview</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2"
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
