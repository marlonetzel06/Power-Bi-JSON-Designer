import { getVisualCard } from '@/pbi/catalog';
import { cardLabel, propLabel } from '@/pbi/curation/labels';

/** Does a card (or any of its properties) match the search query? */
export function cardMatches(locale: 'de' | 'en', visualKey: string, cardKey: string, query: string): boolean {
  if (!query) return true;
  if (cardLabel(locale, visualKey, cardKey).toLowerCase().includes(query) || cardKey.toLowerCase().includes(query)) return true;
  const card = getVisualCard(visualKey, cardKey);
  return Boolean(card?.props.some((p) => propLabel(locale, p).toLowerCase().includes(query) || p.key.toLowerCase().includes(query)));
}
