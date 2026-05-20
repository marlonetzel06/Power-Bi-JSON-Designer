import { useState, useMemo } from 'react';
import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS, VISUAL_CATEGORIES } from '../../constants/visualNames';
import { toast } from '../ui/Toast';
import Button from '../ui/Button';
import { X } from 'lucide-react';

export default function CopyVisualDialog({ sourceVisual, onClose }) {
  const { copyVisualSettings } = useThemeStore();
  const [selected, setSelected] = useState([]);

  const targets = useMemo(() => {
    // Find which category the source belongs to
    let category = null;
    for (const [cat, keys] of Object.entries(VISUAL_CATEGORIES)) {
      if (keys.includes(sourceVisual)) {
        category = cat;
        break;
      }
    }
    // Get siblings from the same category, excluding self
    const siblings = category
      ? VISUAL_CATEGORIES[category].filter(k => k !== sourceVisual)
      : [];
    // Fallback: all visuals except source and '*'
    const list = siblings.length > 0
      ? siblings
      : Object.keys(VISUAL_LABELS).filter(k => k !== sourceVisual && k !== '*');
    return list.map(key => ({ key, label: VISUAL_LABELS[key] || key }));
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
      <div
        className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] shadow-xl w-full max-w-sm p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Copy Settings</h3>
          <Button onClick={onClose} variant="ghost" size="icon"><X size={14} /></Button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Copy settings from <strong>{VISUAL_LABELS[sourceVisual] || sourceVisual}</strong> to:
        </p>
        <div className="max-h-[260px] overflow-y-auto flex flex-col gap-1.5 mb-4">
          {targets.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--bg-muted)] cursor-pointer text-xs text-[var(--text-default)]">
              <input
                type="checkbox"
                checked={selected.includes(key)}
                onChange={() => toggle(key)}
                className="accent-[var(--color-primary)]"
              />
              {label}
            </label>
          ))}
        </div>
        <Button onClick={handleApply} disabled={selected.length === 0} className="w-full">
          Apply to {selected.length} visual(s)
        </Button>
      </div>
    </div>
  );
}
