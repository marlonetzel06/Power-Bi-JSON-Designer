import { ChevronsDownUp, ChevronsUpDown, Copy, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocale, useT } from '@/i18n';
import { getVisualCard, getVisualStates } from '@/pbi/catalog';
import { cardLabel, stateLabel, visualLabel } from '@/pbi/curation/labels';
import { COMMON_CARDS, PAGE_CARDS, VISUAL_CARDS } from '@/pbi/curation/selection';
import { GLOBAL_KEY, PAGE_KEY } from '@/pbi/types';
import { useModified } from '@/store/selectors';
import { useThemeStore } from '@/store/theme';
import { useUiStore } from '@/store/uiStore';
import { Badge, ConfirmDialog, EmptyState, FormatCard, IconButton, SearchField, Select, Tabs, TabsContent, TabsList, TabsTrigger, Tooltip } from '@/ui';
import { VisualIcon } from '../visualGallery/icons';
import { CopyVisualDialog } from './CopyVisualDialog';
import { FormatCards } from './FormatCards';
import { cardMatches } from './search';

/** "Allgemein" tab groups, as in Power BI Desktop. */
const GENERAL_GROUPS: readonly { id: string; labelKey: 'format.general.properties' | 'format.general.title' | 'format.general.effects' | 'format.general.header' | 'format.general.tooltips'; cards: readonly string[] }[] = [
  { id: 'properties', labelKey: 'format.general.properties', cards: ['padding'] },
  { id: 'title', labelKey: 'format.general.title', cards: ['title', 'subTitle', 'divider', 'spacing'] },
  { id: 'effects', labelKey: 'format.general.effects', cards: ['background', 'border', 'dropShadow'] },
  { id: 'header', labelKey: 'format.general.header', cards: ['visualHeader', 'visualHeaderTooltip'] },
  { id: 'tooltips', labelKey: 'format.general.tooltips', cards: ['visualTooltip'] },
];

/** Old state names the schema still lists next to their namespaced successors (slicers); only the new ones are offered. */
const LEGACY_STATE_ALIASES: Record<string, string> = { hover: 'interaction:hover', press: 'interaction:press', selection: 'selection:selected' };

/** The Power BI format pane for the current selection (visual, page or all visuals). */
export function FormatPane() {
  const t = useT();
  const locale = useLocale();
  const selection = useUiStore((s) => s.selection);
  const tab = useUiStore((s) => s.formatTab);
  const setTab = useUiStore((s) => s.setFormatTab);
  const setAll = useUiStore((s) => s.setAllCardsExpanded);
  const resetVisual = useThemeStore((s) => s.resetVisual);
  const previewState = useUiStore((s) => (selection.kind === 'visual' ? s.previewState[selection.key] : undefined));
  const setPreviewState = useUiStore((s) => s.setPreviewState);
  const modified = useModified();
  const [query, setQuery] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);

  const visualKey = selection.kind === 'visual' ? selection.key : selection.kind === 'page' ? PAGE_KEY : null;
  const q = query.trim().toLowerCase();
  const isPage = visualKey === PAGE_KEY;
  const isGlobal = visualKey === GLOBAL_KEY;
  const visualCards = useMemo(() => (visualKey && !isPage && !isGlobal ? (VISUAL_CARDS[visualKey] ?? []).filter((c) => !COMMON_CARDS.includes(c)) : []), [visualKey, isPage, isGlobal]);
  const generalCards = useMemo(() => (visualKey && !isPage ? COMMON_CARDS.filter((c) => getVisualCard(visualKey, c)) : []), [visualKey, isPage]);
  const count = visualKey ? (modified.cardCounts[visualKey] ?? 0) : 0;
  const states = useMemo(() => {
    const all = visualKey && !isPage && !isGlobal ? getVisualStates(visualKey) : undefined;
    return all?.filter((s) => !(LEGACY_STATE_ALIASES[s] && all.includes(LEGACY_STATE_ALIASES[s])));
  }, [visualKey, isPage, isGlobal]);
  const stateId = states ? (previewState && states.includes(previewState) ? previewState : 'default') : undefined;

  if (!visualKey) {
    return <EmptyState compact title={t('format.noSelection')} className="py-10" />;
  }

  const name = visualLabel(locale, visualKey);
  const allCards = isPage ? PAGE_CARDS : [...visualCards, ...generalCards];
  const matchedGeneral = GENERAL_GROUPS.map((g) => ({ ...g, cards: g.cards.filter((c) => generalCards.includes(c) && cardMatches(locale, visualKey, c, q)) })).filter((g) => g.cards.length);
  const matchedVisual = visualCards.filter((c) => cardMatches(locale, visualKey, c, q));
  const matchedPage = PAGE_CARDS.filter((c) => cardMatches(locale, visualKey, c, q));
  const nothing = q && matchedVisual.length === 0 && matchedGeneral.length === 0 && matchedPage.length === 0;

  const header = (
    <div className="flex items-center gap-2 px-3 pt-3">
      <VisualIcon visualKey={visualKey} size={16} className="shrink-0 text-text-brand" />
      <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-text-primary" data-testid="format-visual-name">{name}</h3>
      {count > 0 && <Badge tone="brand" aria-label={count === 1 ? t('format.modifiedCard', { count }) : t('format.modifiedCards', { count })}>{count}</Badge>}
      {!isPage && !isGlobal && <IconButton label={t('format.copyTo')} size="xs" onClick={() => setCopyOpen(true)}><Copy size={14} /></IconButton>}
      <IconButton label={t('format.resetVisual')} size="xs" disabled={count === 0} onClick={() => setConfirmReset(true)} data-testid="reset-visual"><RotateCcw size={14} /></IconButton>
    </div>
  );

  const tools = (
    <>
      <div className="flex items-center gap-1 px-3 py-2">
        <SearchField value={query} onValueChange={setQuery} placeholder={t('format.searchPlaceholder')} aria-label={t('format.searchPlaceholder')} clearLabel={t('action.clearFilter')} className="min-w-0 flex-1" data-testid="format-search" />
        <IconButton label={t('action.expandAll')} size="sm" onClick={() => setAll(visualKey, [...allCards], true)}><ChevronsUpDown size={15} /></IconButton>
        <IconButton label={t('action.collapseAll')} size="sm" onClick={() => setAll(visualKey, [...allCards], false)}><ChevronsDownUp size={15} /></IconButton>
      </div>
      {states && stateId && (
        <div className="flex items-center gap-2 px-3 pb-2" data-testid="format-state">
          <Tooltip content={t('format.stateHint')}><span className="shrink-0 text-[12px] text-text-muted">{t('format.state')}</span></Tooltip>
          <Select
            size="sm"
            aria-label={t('format.state')}
            value={stateId}
            onValueChange={(v) => setPreviewState(visualKey, v)}
            options={states.map((st) => ({ value: st, label: stateLabel(locale, st) }))}
            className="min-w-0 flex-1"
          />
        </div>
      )}
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="format-pane">
      {header}
      {isPage || isGlobal ? (
        <>
          {tools}
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
            {nothing ? <EmptyState compact title={t('format.noMatch', { query })} /> : isPage ? <FormatCards visualKey={PAGE_KEY} cards={matchedPage} query={q} /> : <GeneralGroups visualKey={visualKey} groups={matchedGeneral} query={q} />}
          </div>
        </>
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'visual' | 'general')} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-3 mt-2">
            <TabsTrigger value="visual" data-testid="tab-visual">{t('format.tabVisual')}</TabsTrigger>
            <TabsTrigger value="general" data-testid="tab-general">{t('format.tabGeneral')}</TabsTrigger>
          </TabsList>
          {tools}
          <TabsContent value="visual" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 outline-none">
            {visualCards.length === 0 ? <EmptyState compact title={t('format.noCards')} /> : matchedVisual.length === 0 ? <EmptyState compact title={t('format.noMatch', { query })} /> : <FormatCards visualKey={visualKey} cards={matchedVisual} query={q} stateId={stateId} />}
          </TabsContent>
          <TabsContent value="general" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 outline-none">
            {matchedGeneral.length === 0 ? <EmptyState compact title={t('format.noMatch', { query })} /> : <GeneralGroups visualKey={visualKey} groups={matchedGeneral} query={q} stateId={stateId} />}
          </TabsContent>
        </Tabs>
      )}
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={t('format.resetVisual')}
        description={t('format.resetVisualConfirm', { name })}
        confirmLabel={t('action.resetToDefault')}
        destructive
        onConfirm={() => resetVisual(visualKey)}
      />
      {copyOpen && <CopyVisualDialog sourceKey={visualKey} open={copyOpen} onOpenChange={setCopyOpen} />}
    </div>
  );
}

function GeneralGroups({ visualKey, groups, query, stateId }: { visualKey: string; groups: typeof GENERAL_GROUPS; query: string; stateId?: string }) {
  const t = useT();
  const locale = useLocale();
  const expanded = useUiStore((s) => s.expandedCards[`${visualKey}:general`]);
  const setCardExpanded = useUiStore((s) => s.setCardExpanded);
  const modified = useModified();
  return (
    <div className="flex flex-col">
      {groups.map((g) => {
        const changed = g.cards.some((c) => modified.cards[visualKey]?.has(c));
        const single = g.cards.length === 1 && cardLabel(locale, visualKey, g.cards[0]!) === t(g.labelKey);
        if (single) return <FormatCards key={g.id} visualKey={visualKey} cards={g.cards} query={query} stateId={stateId} />;
        return (
          <FormatCard key={g.id} id={`group-${visualKey}-${g.id}`.replace(/[^a-zA-Z0-9_-]/g, '_')} level="section" title={t(g.labelKey)} modified={changed} open={query ? true : (expanded ? expanded.includes(g.id) : g.id === 'title')} onOpenChange={(o) => setCardExpanded(`${visualKey}:general`, g.id, o)}>
            <FormatCards visualKey={visualKey} cards={g.cards} query={query} stateId={stateId} />
          </FormatCard>
        );
      })}
    </div>
  );
}
