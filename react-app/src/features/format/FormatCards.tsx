import { useMemo } from 'react';
import { useLocale } from '@/i18n';
import { getVisualCard } from '@/pbi/catalog';
import { useModified } from '@/store/selectors';
import { useUiStore } from '@/store/uiStore';
import { FormatCardView } from './FormatCardView';
import { cardMatches } from './search';

export interface FormatCardsProps {
  visualKey: string;
  cards: readonly string[];
  query?: string;
  /** Namespace for the expanded-state memory (defaults to the visual key). */
  memoryKey?: string;
  defaultOpen?: boolean;
}

/** A list of format cards for a visual with per-visual expanded-state memory. */
export function FormatCards({ visualKey, cards, query = '', memoryKey, defaultOpen = false }: FormatCardsProps) {
  const locale = useLocale();
  const key = memoryKey ?? visualKey;
  const expanded = useUiStore((s) => s.expandedCards[key]);
  const setCardExpanded = useUiStore((s) => s.setCardExpanded);
  const modified = useModified();
  const visible = useMemo(() => cards.filter((c) => getVisualCard(visualKey, c) && cardMatches(locale, visualKey, c, query)), [cards, visualKey, query, locale]);
  const modifiedSet = modified.cards[visualKey];

  return (
    <div className="flex flex-col gap-1.5">
      {visible.map((c) => (
        <FormatCardView
          key={c}
          visualKey={visualKey}
          cardKey={c}
          query={query}
          open={query ? true : expanded ? expanded.includes(c) : defaultOpen}
          onOpenChange={(o) => setCardExpanded(key, c, o)}
          modified={modifiedSet?.has(c) ?? false}
        />
      ))}
    </div>
  );
}
