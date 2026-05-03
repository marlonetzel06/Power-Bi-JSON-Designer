import { useState, useRef } from 'react';
import useThemeStore from '../../store/themeStore';
import { PRESETS } from '../../constants/presets';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';

export default function PresetSelector() {
  const { applyPreset, theme, userSetThemeName } = useThemeStore();
  const [customPresets, setCustomPresets] = useLocalStorage('pbi-custom-presets', []);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const selectRef = useRef(null);

  function handlePresetChange(e) {
    const key = e.target.value;
    if (!key) return;
    let p;
    if (key.startsWith('custom:')) {
      p = customPresets.find(c => c._key === key);
    } else {
      p = PRESETS[key];
    }
    if (p) applyPreset(p);
    e.target.value = '';
  }

  function handleSave() {
    const name = saveName.trim();
    if (!name) return;
    const key = 'custom:' + name;
    const entry = {
      _key: key, name,
      background: theme.background, foreground: theme.foreground, tableAccent: theme.tableAccent,
      good: theme.good, neutral: theme.neutral, bad: theme.bad,
      maximum: theme.maximum, center: theme.center, minimum: theme.minimum, null: theme['null'],
      firstLevelElements: theme.firstLevelElements, secondLevelElements: theme.secondLevelElements,
      thirdLevelElements: theme.thirdLevelElements, fourthLevelElements: theme.fourthLevelElements,
      secondaryBackground: theme.secondaryBackground,
      dataColors: [...(theme.dataColors || [])],
    };
    const updated = customPresets.filter(c => c._key !== key);
    updated.push(entry);
    setCustomPresets(updated);
    setSaveOpen(false);
    setSaveName('');
  }

  function handleDelete(key, e) {
    e.stopPropagation();
    setCustomPresets(customPresets.filter(c => c._key !== key));
  }

  return (
    <div className="flex items-center gap-2">
      <select
        ref={selectRef}
        onChange={handlePresetChange}
        defaultValue=""
        className="text-xs px-2 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-default)] cursor-pointer outline-none"
      >
        <option value="">Preset…</option>
        <optgroup label="Built-in">
          {Object.entries(PRESETS).map(([k, v]) => (
            <option key={k} value={k}>{v.name}</option>
          ))}
        </optgroup>
        {customPresets.length > 0 && (
          <optgroup label="My Presets">
            {customPresets.map(c => (
              <option key={c._key} value={c._key}>{c.name}</option>
            ))}
          </optgroup>
        )}
      </select>
      <Button
        onClick={() => setSaveOpen(!saveOpen)}
        variant="ghost"
        size="icon"
        title="Save current as preset"
      >
        <Save size={14} />
      </Button>
      {saveOpen && (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Preset name…"
            className="text-[11px] px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] w-[120px] outline-none focus:border-[var(--color-primary)] bg-[var(--bg-surface)] text-[var(--text-default)]"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <Button onClick={handleSave} variant="primary" size="sm">OK</Button>
          <Button onClick={() => setSaveOpen(false)} variant="ghost" size="sm"><X size={12} /></Button>
        </div>
      )}
    </div>
  );
}
