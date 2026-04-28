import { useState, useMemo } from 'react';
import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS, VISUAL_CATEGORIES } from '../../constants/visualNames';

export default function CopyVisualDialog({ sourceVisual, onClose }) {
  const { copyVisualSettings } = useThemeStore();
  const [selected, setSelected] = useState([]);

  const candidates = useMemo(() => {
    // Find which category the source belongs to, then show same-category visuals
    let category = null;
    for (const [cat, keys] of Object.entries(VISUAL_CATEGORIES)) {
      if (keys.includes(sourceVisual)) { category = cat; break; }
    }
    const pool = category ? VISUAL_CATEGORIES[category].filter(k => k !== sourceVisual) : [];
    // If no category match, show all others
    const all = pool.length > 0 ? pool : Object.keys(VISUAL_LABELS).filter(k => k !== sourceVisual);
    return all.map(k => ({ key: k, label: VISUAL_LABELS[k] || k }));
  }, [sourceVisual]);

  function toggle(key) {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function handleApply() {
    copyVisualSettings(sourceVisual, selected);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white w-[340px] max-h-[70vh] rounded-lg shadow-xl flex flex-col dark:bg-[#24263e]" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-[#e6edf5] dark:border-[#2d3555]">
          <div className="text-[13px] font-bold text-[#0f4c81] dark:text-[#89b4fa]">Copy Settings</div>
          <div className="text-[10px] text-[#999]">From <strong>{VISUAL_LABELS[sourceVisual] || sourceVisual}</strong> to:</div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {candidates.map(c => (
            <label key={c.key} className="flex items-center gap-2 py-1 text-xs text-[#555] cursor-pointer dark:text-[#a9b1d6]">
              <input type="checkbox" checked={selected.includes(c.key)} onChange={() => toggle(c.key)} />
              {c.label}
            </label>
          ))}
        </div>
        <div className="flex gap-2 px-4 py-3 border-t border-[#e6edf5] dark:border-[#2d3555]">
          <button
            onClick={handleApply}
            disabled={!selected.length}
            className="flex-1 text-xs py-1.5 rounded bg-[#1f8ac0] text-white border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply to {selected.length} visual(s)
          </button>
          <button onClick={onClose} className="text-xs px-3 py-1.5 rounded border border-[#ccd] bg-white cursor-pointer dark:bg-[#24263e] dark:border-[#373963] dark:text-[#c0caf5]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
