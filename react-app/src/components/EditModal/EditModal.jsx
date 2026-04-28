import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS } from '../../constants/visualNames';
import { VISUAL_SCHEMA, CARD_DEFS } from '../../constants/visualSpecs';
import { PBI_PAGE_SIZES } from '../../constants/enums';
import PropertyCard from './PropertyCard';
import CopyVisualDialog from '../CopyVisualDialog/CopyVisualDialog';
import { useState } from 'react';

export default function EditModal() {
  const { currentVisual, setCurrentVisual, theme, pageSettings, resetVisual } = useThemeStore();
  const [showCopy, setShowCopy] = useState(false);

  if (!currentVisual) return null;
  const isPage = currentVisual === '__page__';
  const label = isPage ? 'Page Settings' : (VISUAL_LABELS[currentVisual] || currentVisual);
  const cardKeys = isPage ? [] : (VISUAL_SCHEMA[currentVisual] || []);

  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex items-stretch justify-center">
      <div className="bg-[#f4f7fb] w-full max-w-[1320px] flex flex-col mt-4 mb-4 rounded-lg overflow-hidden shadow-2xl dark:bg-[#1a1b2e]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#e6edf5] shrink-0 dark:bg-[#24263e] dark:border-[#2d3555]">
          <div>
            <span className="text-[14px] font-bold text-[#0f4c81] dark:text-[#89b4fa]">{label}</span>
            {!isPage && <span className="text-[10px] font-mono text-[#bbb] ml-2">{currentVisual}</span>}
          </div>
          <div className="flex gap-2 items-center">
            {!isPage && (
              <>
                <button
                  onClick={() => setShowCopy(true)}
                  className="text-[11px] px-2.5 py-1 rounded border border-[#c8d8ea] bg-white text-[#555] cursor-pointer hover:border-[#1f8ac0] hover:text-[#1f8ac0] dark:bg-[#24263e] dark:border-[#373963] dark:text-[#a9b1d6]"
                >
                  Copy to Similar
                </button>
                <button
                  onClick={() => resetVisual(currentVisual)}
                  className="text-[11px] px-2.5 py-1 rounded border border-[#c8d8ea] bg-white text-[#d44] cursor-pointer hover:bg-[#fff0f0] dark:bg-[#24263e] dark:border-[#373963] dark:text-[#f38ba8]"
                >
                  Reset
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentVisual(null)}
              className="ml-2 w-7 h-7 rounded-full bg-[#f3f6fa] text-[#888] font-bold text-lg flex items-center justify-center cursor-pointer hover:bg-[#e8edf4] dark:bg-[#2d3055] dark:text-[#a9b1d6]"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isPage ? (
            <PageSettingsPanel />
          ) : (
            <div className="flex flex-col gap-3">
              {cardKeys.map(key => {
                const def = CARD_DEFS[key];
                if (!def) return null;
                return <PropertyCard key={key} visualKey={currentVisual} cardKey={key} cardDef={def} />;
              })}
              {cardKeys.length === 0 && (
                <div className="text-center text-xs text-[#999] py-8">No configurable properties for this visual.</div>
              )}
            </div>
          )}
        </div>
      </div>
      {showCopy && <CopyVisualDialog sourceVisual={currentVisual} onClose={() => setShowCopy(false)} />}
    </div>
  );
}

function PageSettingsPanel() {
  const { pageSettings } = useThemeStore();
  const store = useThemeStore;

  return (
    <div className="text-xs text-[#555] dark:text-[#a9b1d6]">
      <div className="bg-white border border-[#e6edf5] rounded-lg p-4 dark:bg-[#24263e] dark:border-[#2d3555]">
        <div className="text-[13px] font-bold text-[#0f4c81] mb-3 dark:text-[#89b4fa]">Canvas Size</div>
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={pageSettings.preset || 'default'}
            onChange={(e) => {
              const s = useThemeStore.getState();
              const p = PBI_PAGE_SIZES[e.target.value] || PBI_PAGE_SIZES['default'];
              useThemeStore.setState({
                pageSettings: { ...s.pageSettings, preset: e.target.value, canvasWidth: p.w, canvasHeight: p.h }
              });
            }}
            className="text-xs px-2 py-1 border border-[#ccd] rounded dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
          >
            {Object.entries(PBI_PAGE_SIZES).map(([k, v]) => (
              <option key={k} value={k}>{v.label} ({v.w}×{v.h})</option>
            ))}
          </select>
          <input type="number" value={pageSettings.canvasWidth || 1280} className="w-[70px] text-xs px-1 py-1 border border-[#ccd] rounded dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]" readOnly />
          <span>×</span>
          <input type="number" value={pageSettings.canvasHeight || 720} className="w-[70px] text-xs px-1 py-1 border border-[#ccd] rounded dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]" readOnly />
        </div>
        <div className="mt-4 text-[10px] text-[#999]">More page-level settings (background, wallpaper, filter pane) coming soon.</div>
      </div>
    </div>
  );
}
