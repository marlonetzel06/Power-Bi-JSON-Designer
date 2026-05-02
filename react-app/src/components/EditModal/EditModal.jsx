import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS } from '../../constants/visualNames';
import { VISUAL_SCHEMA, CARD_DEFS } from '../../constants/visualSpecs';
import { VISUAL_PAGE_MAP } from '../../constants/visualPageMap';
import PropertyCard from './PropertyCard';
import CopyVisualDialog from '../CopyVisualDialog/CopyVisualDialog';
import { useState } from 'react';
import usePbiEmbed from '../../hooks/usePbiEmbed';
import PbiReportEmbed from '../PbiEmbed/PbiReportEmbed';

const hasMsal = !!import.meta.env.VITE_MSAL_CLIENT_ID;

export default function EditModal() {
  const { currentVisual, setCurrentVisual, theme, pageSettings, resetVisual } = useThemeStore();
  const [showCopy, setShowCopy] = useState(false);

  if (!currentVisual) return null;
  const isPage = currentVisual === '__page__';
  const label = isPage ? 'Page Settings' : (VISUAL_LABELS[currentVisual] || currentVisual);
  const cardKeys = VISUAL_SCHEMA[currentVisual] || [];

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

        {/* Body — split: properties left, preview right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Properties */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-w-0">
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
          </div>

          {/* Live Preview */}
          {hasMsal && (
            <div className="w-[480px] shrink-0 border-l border-[#e6edf5] bg-white flex flex-col dark:bg-[#1e2038] dark:border-[#2d3555]">
              <div className="px-3 py-2 border-b border-[#e6edf5] dark:border-[#2d3555]">
                <span className="text-[11px] font-bold text-[#0f4c81] dark:text-[#89b4fa]">📊 Live Preview</span>
              </div>
              <div className="flex-1 overflow-hidden p-1.5">
                <EmbedPreview targetPage={VISUAL_PAGE_MAP[currentVisual]} />
              </div>
            </div>
          )}
        </div>
      </div>
      {showCopy && <CopyVisualDialog sourceVisual={currentVisual} onClose={() => setShowCopy(false)} />}
    </div>
  );
}

function EmbedPreview({ targetPage }) {
  const { embedConfig, isAuthenticated, error } = usePbiEmbed();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-2">
        <div className="text-2xl">🔒</div>
        <div className="text-[11px] text-[#777] dark:text-[#7982a9]">
          Melde dich über <strong>Sign In</strong> an.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-2">
        <div className="text-xl">⚠️</div>
        <div className="text-[10px] text-[#d44] leading-relaxed">{error}</div>
      </div>
    );
  }

  if (!embedConfig) {
    return <div className="flex items-center justify-center h-full text-xs text-[#999]">Loading report...</div>;
  }

  return <PbiReportEmbed embedConfig={embedConfig} targetPage={targetPage} className="w-full h-full rounded-md overflow-hidden" />;
}
