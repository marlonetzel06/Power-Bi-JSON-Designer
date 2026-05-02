import { useState, useMemo } from 'react';
import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS, VISUAL_CATEGORIES } from '../../constants/visualNames';
import Button from '../ui/Button';
import { toast } from '../ui/Toast';

export default function CopyVisualDialog({ sourceVisual, onClose }) {
  const { copyVisualSettings } = useThemeStore();
  const [selected, setSelected] = useState([]);

  const candidates = useMemo(() => {
    let category = null;
    for (const [cat, keys] of Object.entries(VISUAL_CATEGORIES)) {
      if (keys.includes(sourceVisual)) { category = cat; break; }
    }
    const pool = category ? VISUAL_CATEGORIES[category].filter(k => k !== sourceVisual) : [];
    const all = pool.length > 0 ? pool : Object.keys(VISUAL_LABELS).filter(k => k !== sourceVisual);
    return all.map(k => ({ key: k, label: VISUAL_LABELS[k] || k }));
  }, [sourceVisual]);

  function toggle(key) {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function handleApply() {
    copyVisualSettings(sourceVisual, selected);
    toast.success(`Settings copied to ${selected.length} visual(s)`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-[var(--bg-surface)] w-[340px] max-h-[70vh] rounded-[var(--radius-lg)] shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-[var(--border-default)]">
          <div className="text-sm font-bold text-[var(--text-primary)]">Copy Settings</div>
          <div className="text-[10px] text-[var(--text-muted)]">From <strong>{VISUAL_LABELS[sourceVisual] || sourceVisual}</strong> to:</div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {candidates.map(c => (
            <label key={c.key} className="flex items-center gap-2 py-1 text-xs text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" checked={selected.includes(c.key)} onChange={() => toggle(c.key)} />
              {c.label}
            </label>
          ))}
        </div>
        <div className="flex gap-2 px-4 py-3 border-t border-[var(--border-default)]">
          <Button
            onClick={handleApply}
            disabled={!selected.length}
            variant="primary"
            className="flex-1"
          >
            Apply to {selected.length} visual(s)
          </Button>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
