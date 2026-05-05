import { useRef, useState, useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import { VISUAL_PAGE_MAP } from '../../constants/visualPageMap';
import usePbiEmbed from '../../hooks/usePbiEmbed';
import useEmbedQueue from '../../hooks/useEmbedQueue';
import PbiReportEmbed from '../PbiEmbed/PbiReportEmbed';
import { getVisualIcon } from '../../utils/visualIcons';

function CardPreview({ visualKey, embedConfig, onRendered }) {
  const pageName = VISUAL_PAGE_MAP[visualKey];
  const Icon = getVisualIcon(visualKey);

  if (!pageName || !embedConfig) {
    return (
      <div className="text-center flex flex-col items-center justify-center gap-1">
        <Icon size={32} className="text-[var(--text-muted)] opacity-40" />
        <div className="text-[var(--color-primary)] text-[10px] mt-1">Click to configure</div>
      </div>
    );
  }

  const cardConfig = {
    ...embedConfig,
    settings: {
      ...embedConfig.settings,
      panes: { filters: { visible: false }, pageNavigation: { visible: false } },
      navContentPaneEnabled: false,
      background: 1,
    },
  };

  // Visuals that are placed small on the PBI page need more zoom to be recognizable
  const needsExtraZoom = ['tableEx', 'matrix', 'slicer', 'listSlicer', 'advancedSlicerVisual'].includes(visualKey);
  const scale = needsExtraZoom ? 0.5 : 0.667;
  const size = needsExtraZoom ? '200%' : '150%';

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="origin-top-left"
        style={{ width: size, height: size, transform: `scale(${scale})` }}
      >
        <PbiReportEmbed
          embedConfig={cardConfig}
          targetPage={pageName}
          onRendered={onRendered}
          className="w-full h-full pointer-events-none"
        />
      </div>
    </div>
  );
}

export default function VisualCard({ visualKey, label }) {
  const { setCurrentVisual, isModified, getModifiedCount } = useThemeStore();
  const modified = visualKey !== '*' && isModified(visualKey);
  const modCount = modified ? getModifiedCount(visualKey) : 0;

  // Shared embed config (auto-fetches token)
  const { embedConfig, isAuthenticated } = usePbiEmbed();

  // Lazy loading: only render embed when card is visible
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const hasPageMap = !!VISUAL_PAGE_MAP[visualKey];
  const wantsEmbed = hasPageMap && isVisible && !!embedConfig;

  // Concurrency queue: only 3 embeds load at a time
  const { hasSlot, onRendered } = useEmbedQueue(wantsEmbed);

  const showEmbed = wantsEmbed && hasSlot;
  const showLoading = hasPageMap && isVisible && (isAuthenticated && !embedConfig || wantsEmbed && !hasSlot);

  useEffect(() => {
    if (!hasPageMap) return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasPageMap]);

  const Icon = getVisualIcon(visualKey);

  return (
    <div
      ref={cardRef}
      className="bg-[var(--bg-surface)] rounded-[var(--radius-md)] overflow-hidden shadow-sm cursor-pointer border-2 border-transparent transition-all duration-150 hover:border-[var(--color-accent)] hover:shadow-md hover:-translate-y-0.5 flex flex-col relative"
      onClick={() => setCurrentVisual(visualKey)}
    >
      <div className="bg-[var(--bg-elevated)] flex items-center justify-center h-[236px] overflow-hidden relative">
        {showEmbed ? (
          <CardPreview visualKey={visualKey} embedConfig={embedConfig} onRendered={onRendered} />
        ) : showLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
            {/* Skeleton shimmer */}
            <div className="w-full flex items-end gap-1.5 h-[60%] px-2">
              <div className="flex-1 h-[40%] bg-[var(--border-subtle)] rounded-sm animate-pulse" />
              <div className="flex-1 h-[70%] bg-[var(--border-subtle)] rounded-sm animate-pulse [animation-delay:100ms]" />
              <div className="flex-1 h-[55%] bg-[var(--border-subtle)] rounded-sm animate-pulse [animation-delay:200ms]" />
              <div className="flex-1 h-[85%] bg-[var(--border-subtle)] rounded-sm animate-pulse [animation-delay:300ms]" />
              <div className="flex-1 h-[45%] bg-[var(--border-subtle)] rounded-sm animate-pulse [animation-delay:150ms]" />
            </div>
            <div className="text-[10px] text-[var(--text-muted)] animate-pulse">Loading preview…</div>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center gap-1">
            <Icon size={32} className="text-[var(--text-muted)] opacity-40" />
            <div className="text-[var(--color-accent)] text-[11px] mt-1">Click to configure</div>
          </div>
        )}
        {/* Clickable overlay — ensures click always works even over iframe */}
        <div className="absolute inset-0 z-10" />
        {modified && (
          <div
            className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] border-[1.5px] border-[var(--bg-surface)] z-20"
            title={`${modCount} card(s) customized`}
          />
        )}
      </div>
      <div className="px-4 py-3">
        <div className="text-xs font-medium text-[var(--text-secondary)]">{label}</div>
      </div>
    </div>
  );
}
