'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/src/store/store';
import { addCategory } from '@/src/store/slices/boardSlice';

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
    <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold text-gray-700">New column</p>
      <input
        autoFocus
        type="text"
        placeholder="Column name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div>
        <p className="text-xs text-gray-500 mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
              style={{
                backgroundColor: color,
                boxShadow: selectedColor === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : undefined,
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Creating…' : 'Create'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
