import { useState } from 'react';
import useThemeStore from '../../store/themeStore';
import { SEMANTIC_KEYS, TEXT_CLASSES } from '../../constants/themeDefaults';
import { FONTS } from '../../constants/enums';
import PalettePopover from '../PaletteGenerator/PalettePopover';
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
    <div className="bg-white border border-[#e6edf5] rounded-lg p-3 mb-3 dark:bg-[#24263e] dark:border-[#2d3555]">
      <div
        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-[#eef2f8] mb-2 hover:bg-[#f0f4fa] dark:border-[#2d3555] dark:hover:bg-[#2a2d4a] -mx-3 -mt-3 px-3 pt-3 rounded-t-lg transition-colors duration-150"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-3.5 h-3.5 text-[#0f4c81] dark:text-[#89b4fa] transition-transform duration-200 ${collapsed ? 'rotate-0' : 'rotate-90'}`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M6 4l4 4-4 4z" />
          </svg>
          <div>
            <div className="text-[13px] font-bold text-[#0f4c81] dark:text-[#89b4fa]">Global Colors & Typography</div>
            <div className="text-[10px] text-[#aaa] dark:text-[#7982a9]">Semantic colors, data palette, text classes</div>
          </div>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}
      >
        <div className="overflow-hidden">
        <div className="flex flex-col gap-1.5">
          {/* Semantic Colors */}
          {SEMANTIC_GROUPS.map(group => (
            <div key={group.label} className="px-3 py-2.5 bg-[#f8fafd] border border-[#e6edf5] rounded-md dark:bg-[#1e2038] dark:border-[#2d3555]">
              <div className="text-[11px] font-bold text-[#0f4c81] mb-2 dark:text-[#89b4fa]">{group.label}</div>
              <div className="flex gap-4 flex-wrap">
                {group.keys.map(key => (
                  <div key={key} className="flex flex-col items-center gap-1 w-[62px]">
                    <HexColorInput
                      value={theme[key] || '#888888'}
                      onChange={(hex) => setSemanticColor(key, hex)}
                      swatchClassName="w-[38px] h-[38px] border-[1.5px] border-[#c8d8e8] rounded-md cursor-pointer dark:border-[#373963]"
                    />
                    <span className="text-[9px] text-[#666] text-center leading-tight dark:text-[#7982a9]">{SEMANTIC_LABEL_MAP[key] || key}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Data Colors */}
          <div className="px-3 py-2.5 bg-[#f8fafd] border border-[#e6edf5] rounded-md dark:bg-[#1e2038] dark:border-[#2d3555]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-[#0f4c81] dark:text-[#89b4fa]">Data Colors</div>
              <PalettePopover />
            </div>
            <div className="flex gap-3 flex-wrap">
              {theme.dataColors.map((col, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-[38px]">
                  <HexColorInput
                    value={col}
                    onChange={(hex) => setDataColor(i, hex)}
                    swatchClassName="w-[38px] h-[38px] border-[1.5px] border-[#c8d8e8] rounded-md cursor-pointer dark:border-[#373963]"
                  />
                  <span className="text-[9px] text-[#888] dark:text-[#7982a9]">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="px-3 py-2.5 bg-[#f8fafd] border border-[#e6edf5] rounded-md dark:bg-[#1e2038] dark:border-[#2d3555]">
            <div className="text-[11px] font-bold text-[#0f4c81] mb-2 dark:text-[#89b4fa]">Typography</div>
            <div className="flex flex-wrap gap-3">
              {TEXT_CLASSES.map(cls => {
                const tc = theme.textClasses?.[cls] || {};
                return (
                  <div key={cls} className="flex items-center gap-1.5 bg-white border border-[#e6edf5] rounded-md px-2.5 py-1.5 dark:bg-[#24263e] dark:border-[#2d3555]">
                    <span className="text-[10px] font-semibold text-[#0f4c81] capitalize dark:text-[#89b4fa]">{cls}</span>
                    <select
                      value={tc.fontFace || 'Segoe UI'}
                      onChange={(e) => setTextClass(cls, 'fontFace', e.target.value)}
                      className="text-[10px] px-1 py-0.5 border border-[#ccd] rounded dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
                    >
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <input
                      type="number"
                      value={tc.fontSize || 12}
                      onChange={(e) => setTextClass(cls, 'fontSize', Number(e.target.value))}
                      className="text-[10px] px-1 py-0.5 border border-[#ccd] rounded w-[40px] text-right dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
                    />
                    <HexColorInput
                      value={tc.fontColor || '#000000'}
                      onChange={(hex) => setTextClass(cls, 'fontColor', hex)}
                      swatchClassName="w-5 h-5 border-[1.5px] border-[#c8d8e8] rounded cursor-pointer dark:border-[#373963]"
                    />
                    <label className="text-[10px] text-[#444] flex items-center gap-0.5 cursor-pointer dark:text-[#a9b1d6]">
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
