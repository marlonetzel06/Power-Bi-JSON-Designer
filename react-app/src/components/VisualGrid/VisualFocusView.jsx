import { useState, useRef, useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS } from '../../constants/visualNames';
import { VISUAL_PAGE_MAP } from '../../constants/visualPageMap';
import { getVisualIcon } from '../../utils/visualIcons';
import usePbiEmbed from '../../hooks/usePbiEmbed';
import PbiReportEmbed from '../PbiEmbed/PbiReportEmbed';
import { ArrowLeft, Lock, AlertTriangle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function VisualFocusView() {
  const { currentVisual, setCurrentVisual } = useThemeStore();
  const isPage = currentVisual === '__page__';
  const label = isPage ? 'Page Settings' : (VISUAL_LABELS[currentVisual] || currentVisual);
  const Icon = getVisualIcon(currentVisual);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);

  // Ctrl+Scroll zoom — non-passive listener to allow preventDefault
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        setZoom(z => Math.max(0.5, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Breadcrumb + Zoom controls */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentVisual(null)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Visuals</span>
          </button>
          <span className="text-xs text-[var(--text-muted)]">/</span>
          <span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>
        </div>

        {/* Zoom controls — always visible */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--text-muted)] mr-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1)))}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-default)] transition-colors cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(1)))}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-default)] transition-colors cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          {zoom !== 1 && (
            <button
              onClick={() => setZoom(1)}
              className="p-1 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-default)] transition-colors cursor-pointer"
              title="Reset zoom"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Focus canvas — zoomable area */}
      <div
        ref={canvasRef}
        className="flex-1 flex items-center justify-center overflow-auto p-5"
      >
        <div
          className="transition-transform duration-150 ease-out"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <FocusPreview visualKey={currentVisual} Icon={Icon} label={label} />
        </div>
      </div>

      <div className="text-[10px] text-[var(--text-muted)] text-center py-1 shrink-0">
        Ctrl + Scroll to zoom
      </div>
    </div>
  );
}

function FocusPreview({ visualKey, Icon, label }) {
  const hasMsal = !!import.meta.env.VITE_MSAL_CLIENT_ID;
  const pageName = VISUAL_PAGE_MAP[visualKey];
  const { embedConfig, isAuthenticated, error } = usePbiEmbed();

  // No MSAL or no page mapping — show large icon placeholder
  if (!hasMsal || !pageName) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center animate-scale-in">
        <div className="w-56 h-56 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center shadow-lg">
          <Icon size={80} className="text-[var(--text-muted)] opacity-30" />
        </div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className="text-[11px] text-[var(--text-muted)]">
          Configure properties in the panel on the right.
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <Lock size={32} className="text-[var(--text-muted)]" />
        <div className="text-xs text-[var(--text-muted)]">
          Sign in to see the live preview.
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle size={24} className="text-[var(--color-danger)]" />
        <div className="text-[11px] text-[var(--color-danger)]">{error}</div>
      </div>
    );
  }

  // Loading
  if (!embedConfig) {
    return (
      <div className="flex items-center justify-center text-xs text-[var(--text-muted)]">
        Loading report...
      </div>
    );
  }

  // Full-size embed preview
  const focusConfig = {
    ...embedConfig,
    settings: {
      ...embedConfig.settings,
      panes: { filters: { visible: false }, pageNavigation: { visible: false } },
      navContentPaneEnabled: false,
      background: 1,
    },
  };

  return (
    <div className="w-[800px] h-[500px] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-default)] shadow-lg bg-[var(--bg-elevated)] animate-scale-in">
      <PbiReportEmbed
        embedConfig={focusConfig}
        targetPage={pageName}
        className="w-full h-full"
      />
    </div>
  );
}
