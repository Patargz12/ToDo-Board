'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/store/store';
import { addCategory } from '@/store/slices/boardSlice';

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

interface AddCategoryFormProps {
  onClose: () => void;
}

export function AddCategoryForm({ onClose }: AddCategoryFormProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[5]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await dispatch(addCategory({ name: trimmed, color: selectedColor })).unwrap();
      onClose();
    } catch {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="w-72 flex-shrink-0 bg-slate-800 rounded-2xl shadow-xl border border-white/10 p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-200">New column</p>
      <input
        autoFocus
        type="text"
        placeholder="Column name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      <div>
        <p className="text-xs text-slate-400 mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
              style={{
                backgroundColor: color,
                boxShadow: selectedColor === color ? `0 0 0 2px #1e293b, 0 0 0 4px ${color}` : undefined,
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Creating…' : 'Create'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-slate-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-white/10"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
