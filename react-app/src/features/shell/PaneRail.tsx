import { ChevronDown } from 'lucide-react';
import { useT } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/ui';
import { FormatPane } from '../format/FormatPane';
import { JsonPane } from '../json/JsonPane';
import { ThemePane } from '../theme/ThemePane';
import { VisualGallery } from '../visualGallery/VisualGallery';
import { Pane } from './Pane';

/** The right-hand pane rail (Power BI: Visualisierungen | Design anpassen | JSON). */
export function PaneRail() {
  const t = useT();
  const open = useUiStore((s) => s.openPanes);
  const collapsed = useUiStore((s) => s.collapsedPanes);
  const setCollapsed = useUiStore((s) => s.setPaneCollapsed);
  const setPaneOpen = useUiStore((s) => s.setPaneOpen);
  const paneWidth = useUiStore((s) => s.paneWidth);
  const setPaneWidth = useUiStore((s) => s.setPaneWidth);
  const themeWidth = useUiStore((s) => s.themePaneWidth);
  const setThemeWidth = useUiStore((s) => s.setThemePaneWidth);
  const jsonWidth = useUiStore((s) => s.jsonPaneWidth);
  const setJsonWidth = useUiStore((s) => s.setJsonPaneWidth);
  const galleryOpen = useUiStore((s) => s.galleryOpen);
  const setGalleryOpen = useUiStore((s) => s.setGalleryOpen);
  const query = useUiStore((s) => s.canvasQuery);

  return (
    <div className="flex h-full shrink-0" data-testid="pane-rail">
      {open.includes('visualizations') && (
        <Pane id="visualizations" title={t('pane.visualizations')} width={paneWidth} onWidthChange={setPaneWidth} collapsed={collapsed.includes('visualizations')} onCollapsedChange={(c) => setCollapsed('visualizations', c)} testId="pane-visualizations">
          <div className="shrink-0 border-b border-border-subtle">
            <button
              type="button"
              aria-expanded={galleryOpen}
              aria-controls="visual-gallery"
              onClick={() => setGalleryOpen(!galleryOpen)}
              className="flex h-8 w-full items-center gap-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring"
            >
              <ChevronDown size={13} aria-hidden className={cn('transition-transform duration-[var(--dur-normal)]', !galleryOpen && '-rotate-90')} />
              {t('gallery.build')}
            </button>
            <div id="visual-gallery" hidden={!galleryOpen}>
              <VisualGallery filter={query} />
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <h3 className="sr-only">{t('pane.format')}</h3>
            <FormatPane />
          </div>
        </Pane>
      )}
      {open.includes('theme') && (
        <Pane id="theme" title={t('pane.theme')} width={themeWidth} onWidthChange={setThemeWidth} collapsed={collapsed.includes('theme')} onCollapsedChange={(c) => setCollapsed('theme', c)} onClose={() => setPaneOpen('theme', false)} testId="pane-theme">
          <ThemePane />
        </Pane>
      )}
      {open.includes('json') && (
        <Pane id="json" title={t('pane.json')} width={jsonWidth} minWidth={320} maxWidth={900} onWidthChange={setJsonWidth} collapsed={collapsed.includes('json')} onCollapsedChange={(c) => setCollapsed('json', c)} onClose={() => setPaneOpen('json', false)} testId="pane-json">
          <JsonPane />
        </Pane>
      )}
    </div>
  );
}
