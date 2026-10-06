import { useLocale, useT } from '@/i18n';
import type { Locale } from '@/store/uiStore';
import { getVisualCard, type CatalogProp } from '@/pbi/catalog';
import { cardLabel, propLabel, stateLabel } from '@/pbi/curation/labels';
import { getStoredValue, getValueSource } from '@/pbi/resolve';
import { useResolvedCard, useTheme } from '@/store/selectors';
import { useThemeStore } from '@/store/theme';
import { useUiStore } from '@/store/uiStore';
import { Field, FormatCard, Select, Switch } from '@/ui';
import { cardDomId } from './cardId';
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
  /** `$id` state chosen for the visual (buttons: hover/selected/…); ignored by cards without that state. */
  stateId?: string;
}

/** Non-editable property types that are still listed (read-only, as stored). */
const READ_ONLY_TYPES = new Set(['object']);

function visibleProps(all: CatalogProp[], query: string | undefined, locale: Locale, visualKey: string, cardKey: string): CatalogProp[] {
  // `mixed` is shown only for number|string unions (axis start/end → number input)
  const visible = all.filter((p) => p.type !== 'mixed' || (p.kinds?.includes('number') ?? false));
  if (!query) return visible;
  const title = cardLabel(locale, visualKey, cardKey).toLowerCase();
  if (title.includes(query)) return visible;
  return visible.filter((p) => propLabel(locale, p).toLowerCase().includes(query) || p.key.toLowerCase().includes(query));
}

/** One Power BI format card: header toggle (`show`), reset, state selector, property controls. */
export function FormatCardView({ visualKey, cardKey, open, onOpenChange, modified, query, flat, stateId }: FormatCardViewProps) {
  const t = useT();
  const locale = useLocale();
  const theme = useTheme();
  const card = getVisualCard(visualKey, cardKey);
  const setCardProp = useThemeStore((s) => s.setCardProp);
  const resetCard = useThemeStore((s) => s.resetCard);
  const cardState = useUiStore((s) => s.cardState[`${visualKey}:${cardKey}`]);
  const setCardState = useUiStore((s) => s.setCardState);

  // Which `$id` applies. Button-like state sets contain "default" and follow the visual-level
  // state switch. Instance sets (filter card Applied|Available, matrix subtotals Row|Column)
  // use an explicit stateId from the parent or the card's own selector.
  const states = card?.states;
  const visualStates = Boolean(states?.includes('default'));
  let effectiveState: string | undefined;
  let showOwnSelector = false;
  if (states && visualStates) effectiveState = stateId;
  else if (states && stateId && states.includes(stateId)) effectiveState = stateId;
  else if (states) {
    effectiveState = cardState && states.includes(cardState) ? cardState : states[0];
    showOwnSelector = true;
  }

  const resolved = useResolvedCard(visualKey, cardKey, effectiveState);

  if (!card) return null;
  const props = visibleProps(card.props, query, locale, visualKey, cardKey);
  const showProp = card.props.find((p) => p.key === 'show');
  const toggle = showProp
    ? { checked: Boolean(resolved.show ?? true), onCheckedChange: (c: boolean) => setCardProp(visualKey, cardKey, 'show', c, effectiveState), label: `${cardLabel(locale, visualKey, cardKey)}: ${t('action.apply')}` }
    : undefined;
  const list = props.filter((p) => p.key !== 'show');

  const body = (
    <div className="flex flex-col divide-y divide-border-subtle">
      {showOwnSelector && states && (
        <Field id={`${cardDomId(visualKey, cardKey)}-state`} label={t('format.applyTo')}>
          <Select
            aria-label={t('format.applyTo')}
            size="sm"
            value={effectiveState}
            options={states.map((s) => ({ value: s, label: stateLabel(locale, s) }))}
            onValueChange={(v) => setCardState(visualKey, cardKey, v)}
          />
        </Field>
      )}
      {list.map((p) => (
        <PropControl
          key={p.key}
          visualKey={visualKey}
          cardKey={cardKey}
          prop={p}
          value={resolved[p.key]}
          raw={READ_ONLY_TYPES.has(p.type) ? getStoredValue(theme, visualKey, cardKey, p.key, effectiveState) : undefined}
          source={getValueSource(theme, visualKey, cardKey, p.key, effectiveState)}
          stateId={effectiveState}
        />
      ))}
      {list.length === 0 && <p className="py-2 text-[12px] text-text-muted">{t('state.empty')}</p>}
    </div>
  );
  const id = cardDomId(visualKey, cardKey, states ? effectiveState : undefined);
  if (flat) {
    return (
      <div data-card={id}>
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
      id={id}
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
