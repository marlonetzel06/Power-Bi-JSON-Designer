import { useMemo } from 'react';
import { useLocale, useT } from '@/i18n';
import { getVisualCard, type CatalogProp } from '@/pbi/catalog';
import { cardLabel, propLabel } from '@/pbi/curation/labels';
import { getValueSource } from '@/pbi/resolve';
import { useResolvedCard, useTheme } from '@/store/selectors';
import { useThemeStore } from '@/store/theme';
import { FormatCard, Switch } from '@/ui';
import { PropControl } from './PropControl';

export interface FormatCardViewProps {
  visualKey: string;
  cardKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modified: boolean;
  /** Lower-cased search query; filters properties and hides non-matching cards (parent decides). */
  query?: string;
  /** Render the properties only (no collapsible header); used for single-card sections. */
  flat?: boolean;
}

/** One Power BI format card: header toggle (`show`), reset, property controls. */
export function FormatCardView({ visualKey, cardKey, open, onOpenChange, modified, query, flat }: FormatCardViewProps) {
  const t = useT();
  const locale = useLocale();
  const theme = useTheme();
  const card = getVisualCard(visualKey, cardKey);
  const resolved = useResolvedCard(visualKey, cardKey);
  const setCardProp = useThemeStore((s) => s.setCardProp);
  const resetCard = useThemeStore((s) => s.resetCard);

  const props = useMemo(() => {
    const all: CatalogProp[] = card?.props ?? [];
    const visible = all.filter((p) => p.type !== 'object' && p.type !== 'mixed');
    if (!query) return visible;
    const title = cardLabel(locale, visualKey, cardKey).toLowerCase();
    if (title.includes(query)) return visible;
    return visible.filter((p) => propLabel(locale, p).toLowerCase().includes(query) || p.key.toLowerCase().includes(query));
  }, [card, query, locale, visualKey, cardKey]);

  if (!card) return null;
  const showProp = card.props.find((p) => p.key === 'show');
  const toggle = showProp
    ? { checked: Boolean(resolved.show ?? true), onCheckedChange: (c: boolean) => setCardProp(visualKey, cardKey, 'show', c), label: `${cardLabel(locale, visualKey, cardKey)}: ${t('action.apply')}` }
    : undefined;

  const body = (
    <div className="flex flex-col divide-y divide-border-subtle">
      {props.filter((p) => p.key !== 'show').map((p) => (
        <PropControl key={p.key} visualKey={visualKey} cardKey={cardKey} prop={p} value={resolved[p.key]} source={getValueSource(theme, visualKey, cardKey, p.key)} />
      ))}
      {props.filter((p) => p.key !== 'show').length === 0 && <p className="py-2 text-[12px] text-text-muted">{t('state.empty')}</p>}
    </div>
  );
  if (flat) {
    return (
      <div data-card={`card-${visualKey}-${cardKey}`.replace(/[^a-zA-Z0-9_-]/g, '_')}>
        {(toggle || modified) && (
          <div className="mb-1 flex items-center justify-end gap-2">
            {modified && (
              <button type="button" onClick={() => resetCard(visualKey, cardKey)} className="text-[11.5px] font-medium text-text-link hover:underline">{t('format.resetCard')}</button>
            )}
            {toggle && <Switch size="sm" checked={toggle.checked} onCheckedChange={toggle.onCheckedChange} aria-label={toggle.label} />}
          </div>
        )}
        {body}
      </div>
    );
  }
  return (
    <FormatCard
      id={`card-${visualKey}-${cardKey}`.replace(/[^a-zA-Z0-9_-]/g, '_')}
      title={cardLabel(locale, visualKey, cardKey)}
      open={open}
      onOpenChange={onOpenChange}
      toggle={toggle}
      modified={modified}
      onReset={() => resetCard(visualKey, cardKey)}
      resetLabel={t('format.resetCard')}
    >
      {body}
    </FormatCard>
  );
}
