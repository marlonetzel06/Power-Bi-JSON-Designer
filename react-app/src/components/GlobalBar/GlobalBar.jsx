import { useState } from 'react';
import useThemeStore from '../../store/themeStore';
import { SEMANTIC_KEYS, TEXT_CLASSES } from '../../constants/themeDefaults';
import { FONTS } from '../../constants/enums';
import PalettePopover from '../PaletteGenerator/PalettePopover';

const SEMANTIC_GROUPS = [
  { label: 'Theme', keys: ['background', 'foreground', 'tableAccent'] },
  { label: 'Sentiment', keys: ['good', 'neutral', 'bad'] },
  { label: 'Scale', keys: ['maximum', 'center', 'minimum', 'null'] },
  { label: 'Levels', keys: ['firstLevelElements', 'secondLevelElements', 'thirdLevelElements', 'fourthLevelElements', 'secondaryBackground'] },
];

export default function GlobalBar() {
  const { theme, setSemanticColor, setDataColor, setTextClass } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white border border-[#e6edf5] rounded-lg p-3 mb-3 dark:bg-[#24263e] dark:border-[#2d3555]">
      <div
        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-[#eef2f8] mb-2 dark:border-[#2d3555]"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div>
          <div className="text-[13px] font-bold text-[#0f4c81] dark:text-[#89b4fa]">Global Colors & Typography</div>
          <div className="text-[10px] text-[#aaa] dark:text-[#505373]">Semantic colors, data palette, text classes</div>
        </div>
        <button className="border border-[#d0dce8] rounded px-2 py-1 text-xs text-[#0f4c81] bg-transparent cursor-pointer hover:bg-[#f0f5fb] dark:border-[#2d3555] dark:text-[#89b4fa] dark:hover:bg-[#2d3055]">
          {collapsed ? '▶ Expand' : '▼ Collapse'}
        </button>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-1.5">
          {/* Semantic Colors */}
          {SEMANTIC_GROUPS.map(group => (
            <div key={group.label} className="flex flex-wrap items-center gap-2 px-3 py-2 bg-[#f8fafd] border border-[#e6edf5] rounded-md dark:bg-[#1e2038] dark:border-[#2d3555]">
              <span className="text-[11px] font-bold text-[#0f4c81] bg-white border-[1.5px] border-[#b8ccde] rounded-full px-3 py-0.5 whitespace-nowrap dark:text-[#89b4fa] dark:bg-[#24263e] dark:border-[#373963]">
                {group.label}
              </span>
              {group.keys.map(key => (
                <label key={key} className="flex items-center gap-1.5 text-xs text-[#555] cursor-pointer dark:text-[#a9b1d6]">
                  <input
                    type="color"
                    value={(theme[key] || '#888888').toLowerCase()}
                    onChange={(e) => setSemanticColor(key, e.target.value.toUpperCase())}
                    className="w-8 h-8 border-[1.5px] border-[#c8d8e8] rounded cursor-pointer dark:border-[#373963]"
                  />
                  <span className="text-xs text-[#555] dark:text-[#a9b1d6]">{key}</span>
                </label>
              ))}
            </div>
          ))}

          {/* Data Colors */}
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-[#f8fafd] border border-[#e6edf5] rounded-md dark:bg-[#1e2038] dark:border-[#2d3555]">
            <span className="text-[11px] font-bold text-[#0f4c81] bg-white border-[1.5px] border-[#b8ccde] rounded-full px-3 py-0.5 whitespace-nowrap dark:text-[#89b4fa] dark:bg-[#24263e] dark:border-[#373963]">
              Data Colors
            </span>
            {theme.dataColors.map((col, i) => (
              <input
                key={i}
                type="color"
                value={col.toLowerCase()}
                title={`Color ${i + 1}`}
                onChange={(e) => setDataColor(i, e.target.value.toUpperCase())}
                className="w-[26px] h-[26px] border-none rounded cursor-pointer"
              />
            ))}
            <PalettePopover />
          </div>

          {/* Typography */}
          <div className="flex flex-wrap items-start gap-2 px-3 py-2 bg-[#f8fafd] border border-[#e6edf5] rounded-md dark:bg-[#1e2038] dark:border-[#2d3555]">
            <span className="text-[11px] font-bold text-[#0f4c81] bg-white border-[1.5px] border-[#b8ccde] rounded-full px-3 py-0.5 whitespace-nowrap dark:text-[#89b4fa] dark:bg-[#24263e] dark:border-[#373963]">
              Typography
            </span>
            <div className="flex flex-col gap-1 flex-1">
              {TEXT_CLASSES.map(cls => {
                const tc = theme.textClasses?.[cls] || {};
                return (
                  <div key={cls} className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#0f4c81] w-[52px] text-right shrink-0 dark:text-[#89b4fa]">{cls}</span>
                    <select
                      value={tc.fontFace || 'Segoe UI'}
                      onChange={(e) => setTextClass(cls, 'fontFace', e.target.value)}
                      className="text-[10px] px-1 py-0.5 border border-[#ccd] rounded w-[130px] shrink-0 dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
                    >
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <input
                      type="number"
                      value={tc.fontSize || 12}
                      onChange={(e) => setTextClass(cls, 'fontSize', Number(e.target.value))}
                      className="text-[10px] px-1 py-0.5 border border-[#ccd] rounded w-[42px] text-right dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
                    />
                    <input
                      type="color"
                      value={(tc.fontColor || '#000000').toLowerCase()}
                      onChange={(e) => setTextClass(cls, 'fontColor', e.target.value.toUpperCase())}
                      className="w-5 h-5 border-none rounded cursor-pointer"
                    />
                    <label className="text-[10px] text-[#444] flex items-center gap-1 cursor-pointer dark:text-[#a9b1d6]">
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
      )}
    </div>
  );
}
