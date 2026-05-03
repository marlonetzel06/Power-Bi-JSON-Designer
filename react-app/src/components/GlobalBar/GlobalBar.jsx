import { useState, lazy, Suspense } from 'react';
import useThemeStore from '../../store/themeStore';
import { SEMANTIC_KEYS, TEXT_CLASSES } from '../../constants/themeDefaults';
import { FONTS } from '../../constants/enums';
const PalettePopover = lazy(() => import('../PaletteGenerator/PalettePopover'));
import HexColorInput from '../HexColorInput';

const SEMANTIC_LABEL_MAP = {
  background: 'Background',
  foreground: 'Foreground',
  tableAccent: 'Table Accent',
  good: 'Good',
  neutral: 'Neutral',
  bad: 'Bad',
  maximum: 'Maximum',
  center: 'Center',
  minimum: 'Minimum',
  null: 'Null Value',
  firstLevelElements: 'Primary',
  secondLevelElements: 'Secondary',
  thirdLevelElements: 'Tertiary',
  fourthLevelElements: 'Quaternary',
  secondaryBackground: 'Secondary BG',
};

const SEMANTIC_GROUPS = [
  { label: 'Theme', keys: ['background', 'foreground', 'tableAccent'] },
  { label: 'Sentiment', keys: ['good', 'neutral', 'bad'] },
  { label: 'Scale', keys: ['maximum', 'center', 'minimum', 'null'] },
  { label: 'Hierarchy', keys: ['firstLevelElements', 'secondLevelElements', 'thirdLevelElements', 'fourthLevelElements', 'secondaryBackground'] },
];

export default function GlobalBar() {
  const { theme, setSemanticColor, setDataColor, setTextClass } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-3 mb-4">
      <div
        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-[var(--border-default)] mb-2 hover:bg-[var(--color-primary-light)] -mx-3 -mt-3 px-3 pt-3 rounded-t-[var(--radius-md)] transition-colors duration-150"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-3.5 h-3.5 text-[var(--text-primary)] transition-transform duration-200 ${collapsed ? 'rotate-0' : 'rotate-90'}`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M6 4l4 4-4 4z" />
          </svg>
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">Global Colors & Typography</div>
            <div className="text-[10px] text-[var(--text-muted)]">Semantic colors, data palette, text classes</div>
          </div>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}
      >
        <div className="overflow-hidden">
        <div className="flex flex-col gap-2">
          {/* Semantic Colors */}
          {SEMANTIC_GROUPS.map(group => (
            <div key={group.label} className="px-3 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-sm)]">
              <div className="text-[11px] font-bold text-[var(--text-primary)] mb-2">{group.label}</div>
              <div className="flex gap-4 flex-wrap">
                {group.keys.map(key => (
                  <div key={key} className="flex flex-col items-center gap-1 w-[62px]">
                    <HexColorInput
                      value={theme[key] || '#888888'}
                      onChange={(hex) => setSemanticColor(key, hex)}
                      swatchClassName="w-[38px] h-[38px] border-[1.5px] border-[var(--border-subtle)] rounded-[var(--radius-sm)] cursor-pointer"
                    />
                    <span className="text-[9px] text-[var(--text-muted)] text-center leading-tight">{SEMANTIC_LABEL_MAP[key] || key}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Data Colors */}
          <div className="px-3 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-sm)]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-[var(--text-primary)]">Data Colors</div>
              <Suspense fallback={null}><PalettePopover /></Suspense>
            </div>
            <div className="flex gap-3 flex-wrap">
              {theme.dataColors.map((col, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-[38px]">
                  <HexColorInput
                    value={col}
                    onChange={(hex) => setDataColor(i, hex)}
                    swatchClassName="w-[38px] h-[38px] border-[1.5px] border-[var(--border-subtle)] rounded-[var(--radius-sm)] cursor-pointer"
                  />
                  <span className="text-[9px] text-[var(--text-muted)]">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="px-3 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-sm)]">
            <div className="text-[11px] font-bold text-[var(--text-primary)] mb-2">Typography</div>
            <div className="flex flex-wrap gap-3">
              {TEXT_CLASSES.map(cls => {
                const tc = theme.textClasses?.[cls] || {};
                return (
                  <div key={cls} className="flex items-center gap-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-2.5 py-1.5">
                    <span className="text-[10px] font-semibold text-[var(--text-primary)] capitalize">{cls}</span>
                    <select
                      value={tc.fontFace || 'Segoe UI'}
                      onChange={(e) => setTextClass(cls, 'fontFace', e.target.value)}
                      className="text-[10px] px-1 py-0.5 border border-[var(--border-subtle)] rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] text-[var(--text-default)]"
                    >
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <input
                      type="number"
                      value={tc.fontSize || 12}
                      onChange={(e) => setTextClass(cls, 'fontSize', Number(e.target.value))}
                      className="text-[10px] px-1 py-0.5 border border-[var(--border-subtle)] rounded-[var(--radius-sm)] w-[40px] text-right bg-[var(--bg-elevated)] text-[var(--text-default)]"
                    />
                    <HexColorInput
                      value={tc.fontColor || '#000000'}
                      onChange={(hex) => setTextClass(cls, 'fontColor', hex)}
                      swatchClassName="w-5 h-5 border-[1.5px] border-[var(--border-subtle)] rounded-[var(--radius-sm)] cursor-pointer"
                    />
                    <label className="text-[10px] text-[var(--text-secondary)] flex items-center gap-0.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!tc.fontBold}
                        onChange={(e) => setTextClass(cls, 'fontBold', e.target.checked)}
                      />
                      B
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
