import { useState } from 'react';
import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS } from '../../constants/visualNames';
import VisualCard from './VisualCard';
import { Search, X } from 'lucide-react';

export default function VisualGrid() {
  const [filter, setFilter] = useState('');
  const { setCurrentVisual } = useThemeStore();
  const term = filter.toLowerCase();

  const visuals = Object.entries(VISUAL_LABELS).filter(([key, label]) =>
    !term || label.toLowerCase().includes(term) || key.toLowerCase().includes(term)
  );

  return (
    <div>
      {/* Header + Search */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          Visuals <span className="font-normal text-xs text-[var(--text-muted)] ml-1">({visuals.length} types)</span>
        </h2>
        <div className="relative w-[240px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Filter visuals…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full text-xs pl-8 pr-8 py-[7px] rounded-[var(--radius-sm)] border border-[var(--border-subtle)] outline-none bg-[var(--bg-surface)] text-[var(--text-default)] focus:border-[var(--color-primary)] transition-colors"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-default)] transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(420px,100%),1fr))] gap-4">
        {visuals.map(([key, label]) => (
          <VisualCard key={key} visualKey={key} label={label} />
        ))}
      </div>

      {/* Empty state */}
      {visuals.length === 0 && (
        <div className="text-center py-12 text-sm text-[var(--text-muted)]">
          No visuals match "{filter}"
        </div>
      )}
    </div>
  );
}
