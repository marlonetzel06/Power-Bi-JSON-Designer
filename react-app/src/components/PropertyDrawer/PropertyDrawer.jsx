import { useState, useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import { VISUAL_LABELS } from '../../constants/visualNames';
import { VISUAL_SCHEMA, CARD_DEFS } from '../../constants/visualSpecs';
import PropertyCard from '../EditModal/PropertyCard';
import CopyVisualDialog from '../CopyVisualDialog/CopyVisualDialog';
import ResizeHandle from '../ui/ResizeHandle';
import Button from '../ui/Button';
import { toast } from '../ui/Toast';
import { X, Copy, RotateCcw } from 'lucide-react';

export default function PropertyDrawer() {
  const { currentVisual, setCurrentVisual, resetVisual } = useThemeStore();
  const [showCopy, setShowCopy] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(400);

  // Close on ESC key
  useEffect(() => {
    if (!currentVisual) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setCurrentVisual(null);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [currentVisual, setCurrentVisual]);

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
    <>
      <ResizeHandle side="left" width={drawerWidth} onResize={setDrawerWidth} min={300} max={600} />
      <aside style={{ width: drawerWidth }} className="flex-shrink-0 bg-[var(--bg-surface)] border-l border-[var(--border-default)] flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--border-default)] shrink-0">
          <div className="min-w-0">
            <div className="text-xs font-bold text-[var(--text-primary)] truncate">{label}</div>
            {!isPage && (
              <div className="text-[10px] font-mono text-[var(--text-muted)] truncate">{currentVisual}</div>
            )}
          </div>
          <Button onClick={() => setCurrentVisual(null)} variant="ghost" size="icon" className="shrink-0">
            <X size={16} />
          </Button>
        </div>

        {/* Actions */}
        {!isPage && (
          <div className="flex gap-2 px-4 py-2 border-b border-[var(--border-default)] shrink-0">
            <Button onClick={() => setShowCopy(true)} variant="secondary" size="sm" className="flex-1">
              <Copy size={12} />
              Copy to Similar
            </Button>
            <Button onClick={handleReset} variant="danger" size="sm">
              <RotateCcw size={12} />
              Reset
            </Button>
          </div>
        )}

        {/* Property Cards */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {cardKeys.map(key => {
              const def = CARD_DEFS[key];
              if (!def) return null;
              return <PropertyCard key={key} visualKey={currentVisual} cardKey={key} cardDef={def} />;
            })}
            {cardKeys.length === 0 && (
              <div className="text-center text-xs text-[var(--text-muted)] py-8">
                No configurable properties for this visual.
              </div>
            )}
          </div>
        </div>
      </aside>

      {showCopy && (
        <CopyVisualDialog sourceVisual={currentVisual} onClose={() => setShowCopy(false)} />
      )}
    </>
  );
}
