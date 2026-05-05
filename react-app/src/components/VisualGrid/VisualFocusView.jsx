import { useState, useCallback } from 'react';
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

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-2 px-5 py-3 shrink-0">
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

      {/* Focus content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-5">
        <FocusPreview visualKey={currentVisual} Icon={Icon} label={label} />
      </div>
    </div>
  );
}

function FocusPreview({ visualKey, Icon, label }) {
  const hasMsal = !!import.meta.env.VITE_MSAL_CLIENT_ID;
  const pageName = VISUAL_PAGE_MAP[visualKey];
  const { embedConfig, isAuthenticated, error } = usePbiEmbed();
  const [zoom, setZoom] = useState(1);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(z => Math.max(0.5, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))));
    }
  }, []);

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
    <div className="w-full h-full flex flex-col gap-2 animate-scale-in">
      {/* Zoom controls */}
      <div className="flex items-center justify-end gap-1 shrink-0 px-1">
        <span className="text-[10px] text-[var(--text-muted)] mr-1">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
          className="p-1 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-default)] transition-colors cursor-pointer"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => setZoom(z => Math.min(3, z + 0.1))}
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

      {/* Embed container — constrained to reasonable size */}
      <div
        className="flex-1 max-w-[900px] max-h-[560px] w-full mx-auto rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-default)] shadow-lg bg-[var(--bg-elevated)]"
        onWheel={handleWheel}
      >
        <div
          className="w-full h-full origin-top-left transition-transform duration-150 ease-out"
          style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%`, height: `${100 / zoom}%` }}
        >
          <PbiReportEmbed
            embedConfig={focusConfig}
            targetPage={pageName}
            className="w-full h-full"
          />
        </div>
      </div>
      <div className="text-[10px] text-[var(--text-muted)] text-center shrink-0">
        Ctrl + Scroll to zoom
      </div>
    </div>
  );
}
