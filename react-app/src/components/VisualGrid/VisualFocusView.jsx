import { useState, useRef, useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS } from '../../constants/visualNames';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { mockVisualSize } from '../../preview/size';
import { PreviewHost } from '../../embed/PreviewHost';
import { useLiveAvailability } from '../../embed/useLiveAvailability';
import { useUiStore } from '../../store/uiStore';

/** LEGACY (replaced in Phase 4): focus view with mock | live toggle. */
export default function VisualFocusView() {
  const { currentVisual, setCurrentVisual } = useThemeStore();
  const isPage = currentVisual === '__page__';
  const mockKey = isPage ? 'page' : currentVisual;
  const label = isPage ? 'Page Settings' : (VISUAL_LABELS[currentVisual] || currentVisual);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const previewMode = useUiStore((s) => s.previewMode);
  const setPreviewMode = useUiStore((s) => s.setPreviewMode);
  const live = useLiveAvailability(mockKey);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => Math.max(0.5, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const size = mockVisualSize(mockKey);
  const scale = Math.min(2, 800 / size.width, 500 / size.height);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between px-5 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentVisual(null)} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">
            <ArrowLeft size={14} />
            <span>Visuals</span>
          </button>
          <span className="text-xs text-[var(--text-muted)]">/</span>
          <span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="inline-flex rounded-md border border-[var(--border-default)] text-[11px] mr-3 overflow-hidden" role="group" aria-label="Vorschaumodus">
            <button className={`px-2 py-1 ${previewMode === 'mock' ? 'bg-[var(--color-primary)] text-white' : ''}`} onClick={() => setPreviewMode('mock')}>Vorschau</button>
            <button className={`px-2 py-1 ${previewMode === 'live' ? 'bg-[var(--color-primary)] text-white' : ''}`} onClick={() => setPreviewMode('live')} disabled={!live.available} title={live.available ? '' : `Live nicht verfügbar: ${live.reason}`}>Live</button>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mr-1">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))} className="p-1 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]" title="Zoom out"><ZoomOut size={14} /></button>
          <button onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)))} className="p-1 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]" title="Zoom in"><ZoomIn size={14} /></button>
          {zoom !== 1 && <button onClick={() => setZoom(1)} className="p-1 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]" title="Reset zoom"><RotateCcw size={12} /></button>}
        </div>
      </div>
      <div ref={canvasRef} className="flex-1 flex items-center justify-center overflow-hidden p-5 relative">
        <div className="transition-transform duration-150 ease-out" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
          <PreviewHost visualKey={mockKey} mode={previewMode} className="shadow-lg" />
          <style>{`[data-visual] { width: ${size.width * scale}px; height: ${size.height * scale}px; }`}</style>
        </div>
      </div>
      <div className="text-[10px] text-[var(--text-muted)] text-center py-1 shrink-0">Ctrl + Scroll zum Zoomen</div>
    </div>
  );
}
