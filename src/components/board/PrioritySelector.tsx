'use client';

import { useState } from 'react';

const DEFAULT_PRIORITIES = [
  { label: 'Low', color: '#22c55e', order: 0 },
  { label: 'Medium', color: '#eab308', order: 1 },
  { label: 'High', color: '#f97316', order: 2 },
  { label: 'Urgent', color: '#ef4444', order: 3 },
];

interface PriorityValue {
  label: string;
  color: string;
  order: number;
}

interface PrioritySelectorProps {
  value: PriorityValue;
  onChange: (priority: PriorityValue) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  const matchedPreset = DEFAULT_PRIORITIES.find((p) => p.label === value.label && p.color === value.color);
  const [isCustom, setIsCustom] = useState(!matchedPreset);
  const [customLabel, setCustomLabel] = useState(matchedPreset ? '' : value.label);
  const [customColor, setCustomColor] = useState(matchedPreset ? '#6366f1' : value.color);

  function selectPreset(p: PriorityValue) {
    setIsCustom(false);
    onChange(p);
  }

  function applyCustom() {
    onChange({ label: customLabel || 'Custom', color: customColor, order: 99 });
  }

  const activePresetLabel = !isCustom ? value.label : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {DEFAULT_PRIORITIES.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => selectPreset(p)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
            style={
              activePresetLabel === p.label
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
          <button
            type="button"
            onClick={applyCustom}
            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: value.color + '22', color: value.color }}
        >
          {value.label || 'None'}
        </span>
        <span className="text-xs text-gray-400">preview</span>
      </div>
    </div>
  );
}
