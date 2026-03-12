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
              ? 'bg-white/15 border-white/30 text-white'
              : 'bg-white/6 border-white/15 text-slate-400 hover:text-slate-200'
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
            className="flex-1 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 bg-white/8 border border-white/12 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Color</span>
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer p-0.5 bg-transparent border border-white/15 scheme-dark"
            />
          </div>
          <button
            type="button"
            onClick={applyCustom}
            className="px-3 py-1.5 text-xs font-semibold text-black rounded-lg bg-primary transition-colors"
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
        <span className="text-xs text-slate-500">preview</span>
      </div>
    </div>
  );
}
