// front/src/components/HashtagBar.tsx
import React from 'react';

export type FilterKey = 'trending' | 'popular' | 'festival' | null;

interface Props {
  value: FilterKey;
  onChange: (f: FilterKey) => void;
}

const TAGS: { key: Exclude<FilterKey, null>; label: string }[] = [
  { key: 'trending', label: '#요즘뜨는해수욕장' },
  { key: 'popular',  label: '#가장많이가는곳' },
  { key: 'festival', label: '#축제하는곳' },
];

export default function HashtagBar({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 mb-3">
      {TAGS.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(value === t.key ? null : t.key)}
          className={`px-3 py-1 rounded-full border text-sm transition-colors
            ${value === t.key ? 'bg-purple-600 text-white border-purple-600' : 'bg-card text-foreground border-border hover:bg-accent'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
