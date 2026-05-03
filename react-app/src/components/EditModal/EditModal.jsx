import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS } from '../../constants/visualNames';
import { VISUAL_SCHEMA, CARD_DEFS } from '../../constants/visualSpecs';
import { VISUAL_PAGE_MAP } from '../../constants/visualPageMap';
import PropertyCard from './PropertyCard';
import CopyVisualDialog from '../CopyVisualDialog/CopyVisualDialog';
import { useState, useEffect, useRef } from 'react';
import usePbiEmbed from '../../hooks/usePbiEmbed';
import PbiReportEmbed from '../PbiEmbed/PbiReportEmbed';
import Button from '../ui/Button';
import { toast } from '../ui/Toast';
import { X, Copy, RotateCcw, Lock, AlertTriangle, Monitor } from 'lucide-react';

const hasMsal = !!import.meta.env.VITE_MSAL_CLIENT_ID;

export default function EditModal() {
  const { currentVisual, setCurrentVisual, theme, pageSettings, resetVisual } = useThemeStore();
  const [showCopy, setShowCopy] = useState(false);
  const modalRef = useRef(null);

  // Close on ESC key
  useEffect(() => {
    if (!currentVisual) return;
    const handleKey = (e) => { if (e.key === 'Escape') setCurrentVisual(null); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [currentVisual, setCurrentVisual]);

  // Focus trap: keep Tab within modal
  useEffect(() => {
    if (!currentVisual || !modalRef.current) return;
    const modal = modalRef.current;
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleTab);
    // Auto-focus first focusable element
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea');
    if (firstFocusable) firstFocusable.focus();
    return () => document.removeEventListener('keydown', handleTab);
  }, [currentVisual]);

  if (!currentVisual) return null;
  const isPage = currentVisual === '__page__';
  const label = isPage ? 'Page Settings' : (VISUAL_LABELS[currentVisual] || currentVisual);
  const cardKeys = VISUAL_SCHEMA[currentVisual] || [];

  function handleReset() {
    if (confirm('Reset all properties for this visual to defaults?')) {
      resetVisual(currentVisual);
      toast.success('Visual reset to defaults');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex items-stretch justify-center" onClick={(e) => { if (e.target === e.currentTarget) setCurrentVisual(null); }}>
      <div ref={modalRef} className="bg-[var(--bg-elevated)] w-full max-w-[1320px] flex flex-col mt-4 mb-4 rounded-[var(--radius-lg)] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--bg-surface)] border-b border-[var(--border-default)] shrink-0">
          <div>
            <span className="text-sm font-bold text-[var(--text-primary)]">{label}</span>
            {!isPage && <span className="text-[10px] font-mono text-[var(--text-muted)] ml-2">{currentVisual}</span>}
          </div>
          <div className="flex gap-2 items-center">
            {!isPage && (
              <>
                <Button onClick={() => setShowCopy(true)} variant="secondary" size="sm">
                  <Copy size={12} />
                  Copy to Similar
                </Button>
                <Button onClick={handleReset} variant="danger" size="sm">
                  <RotateCcw size={12} />
                  Reset
                </Button>
              </>
            )}
            <Button onClick={() => setCurrentVisual(null)} variant="ghost" size="icon">
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Body — split: properties left, preview right (stacks on narrow screens) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Properties */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-w-0">
            <div className="flex flex-col gap-3">
              {cardKeys.map(key => {
                const def = CARD_DEFS[key];
                if (!def) return null;
                return <PropertyCard key={key} visualKey={currentVisual} cardKey={key} cardDef={def} />;
              })}
              {cardKeys.length === 0 && (
                <div className="text-center text-xs text-[var(--text-muted)] py-8">No configurable properties for this visual.</div>
              )}
            </div>
          </div>

          {/* Live Preview */}
          {hasMsal && (
            <div className="w-full lg:w-[480px] shrink-0 border-t lg:border-t-0 lg:border-l border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col min-h-[300px]">
              <div className="px-3 py-2 border-b border-[var(--border-default)] flex items-center gap-1.5">
                <Monitor size={12} className="text-[var(--text-primary)]" />
                <span className="text-[11px] font-bold text-[var(--text-primary)]">Live Preview</span>
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
        <Lock size={24} className="text-[var(--text-muted)]" />
        <div className="text-[11px] text-[var(--text-muted)]">
          Melde dich über <strong>Sign In</strong> an.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-2">
        <AlertTriangle size={20} className="text-[var(--color-danger)]" />
        <div className="text-[10px] text-[var(--color-danger)] leading-relaxed">{error}</div>
      </div>
    );
  }

  if (!embedConfig) {
    return <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">Loading report...</div>;
  }

  return <PbiReportEmbed embedConfig={embedConfig} targetPage={targetPage} className="w-full h-full rounded-[var(--radius-sm)] overflow-hidden" />;
}
