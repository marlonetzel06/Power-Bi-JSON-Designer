import { useState } from 'react';
import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS } from '../../constants/visualNames';
import VisualCard from './VisualCard';

export default function VisualGrid() {
  const [filter, setFilter] = useState('');
  const { setCurrentVisual } = useThemeStore();
  const term = filter.toLowerCase();

  const visuals = Object.entries(VISUAL_LABELS).filter(([key, label]) =>
    !term || label.toLowerCase().includes(term) || key.toLowerCase().includes(term)
  );

  return (
    <div>
      {/* Page Settings Bar */}
      <div className="bg-[#f0f5fb] border border-[#c8d8ea] rounded-lg px-4 py-2.5 mb-3 flex items-center justify-between dark:bg-[#1e2038] dark:border-[#2d3555]">
        <div>
          <span className="text-[13px] font-bold text-[#0f4c81] dark:text-[#89b4fa]">Page Settings</span>
          <span className="text-[11px] text-[#666] ml-2.5 dark:text-[#505373]">Canvas size, background, wallpaper, filter pane</span>
        </div>
        <button
          onClick={() => setCurrentVisual('__page__')}
          className="text-xs px-3.5 py-1.5 rounded-md border border-[#1f8ac0] bg-white text-[#1f8ac0] cursor-pointer font-semibold hover:bg-[#e8f4fc] dark:bg-[#24263e] dark:text-[#89b4fa] dark:border-[#373963]"
        >
          Edit
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-2.5">
        <input
          type="text"
          placeholder="🔍 Filter visuals…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-md border border-[#c8d8ea] outline-none bg-white text-[#333] dark:bg-[#1e2038] dark:text-[#c0caf5] dark:border-[#373963]"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(275px,1fr))] gap-4">
        {visuals.map(([key, label]) => (
          <VisualCard key={key} visualKey={key} label={label} />
        ))}
      </div>
    </div>
  );
}
