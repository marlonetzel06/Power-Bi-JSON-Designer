import { useState, useRef } from 'react';
import useThemeStore from '../../store/themeStore';
import { PRESETS } from '../../constants/presets';
import useLocalStorage from '../../hooks/useLocalStorage';

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
        className="text-xs px-2 py-1.5 rounded-md border border-[#c8d8ea] bg-white text-[#333] cursor-pointer dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
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
      <button
        onClick={() => setSaveOpen(!saveOpen)}
        className="text-xs px-2 py-1.5 rounded-md border border-[#c8d8ea] bg-white text-[#555] cursor-pointer hover:border-[#1f8ac0] hover:text-[#1f8ac0] dark:bg-[#24263e] dark:border-[#373963] dark:text-[#a9b1d6]"
        title="Save current as preset"
      >
        💾
      </button>
      {saveOpen && (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Preset name…"
            className="text-[11px] px-2 py-1 rounded border border-[#c8d8ea] w-[120px] outline-none focus:border-[#1f8ac0] dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button onClick={handleSave} className="text-[11px] px-2 py-0.5 rounded bg-[#1f8ac0] text-white border-none cursor-pointer">OK</button>
          <button onClick={() => setSaveOpen(false)} className="text-[11px] px-2 py-0.5 rounded border border-[#c8d8ea] bg-white cursor-pointer dark:bg-[#24263e] dark:border-[#373963] dark:text-[#c0caf5]">✕</button>
        </div>
      )}
    </div>
  );
}
