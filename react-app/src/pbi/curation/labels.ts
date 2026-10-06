import type { Locale } from '@/store/uiStore';
import { getVisualCard, type CatalogEnumOption, type CatalogProp } from '../catalog';
import {
  CARD_LABELS_DE, CARD_LABELS_EN_OVERRIDE, COLOR_LABELS_DE, COLOR_LABELS_EN, ENUM_LABELS_DE, PROP_LABELS_DE,
  STATE_LABELS_DE, STATE_LABELS_EN, TEXT_CLASS_LABELS_DE, TEXT_CLASS_LABELS_EN, VISUAL_LABELS_DE, VISUAL_LABELS_EN,
} from './labels.de';

export function humanize(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
}

export function visualLabel(locale: Locale, visualKey: string): string {
  return (locale === 'de' ? VISUAL_LABELS_DE[visualKey] : VISUAL_LABELS_EN[visualKey]) ?? VISUAL_LABELS_EN[visualKey] ?? humanize(visualKey);
}

export function cardLabel(locale: Locale, visualKey: string, cardKey: string): string {
  const de = CARD_LABELS_DE[cardKey];
  if (locale === 'de' && de) return de;
  return CARD_LABELS_EN_OVERRIDE[cardKey] ?? getVisualCard(visualKey, cardKey)?.title ?? humanize(cardKey);
}

export function propLabel(locale: Locale, prop: CatalogProp): string {
  const de = PROP_LABELS_DE[prop.key];
  if (locale === 'de' && de) return de;
  return prop.title ?? humanize(prop.key);
}

export function enumLabel(locale: Locale, option: CatalogEnumOption): string {
  if (locale === 'de') {
    const byValue = ENUM_LABELS_DE[String(option.value)] ?? ENUM_LABELS_DE[option.label];
    if (byValue) return byValue;
  }
  return option.label;
}

export function colorLabel(locale: Locale, key: string): string {
  return (locale === 'de' ? COLOR_LABELS_DE[key] : COLOR_LABELS_EN[key]) ?? COLOR_LABELS_EN[key] ?? humanize(key);
}

export function textClassLabel(locale: Locale, cls: string): string {
  return (locale === 'de' ? TEXT_CLASS_LABELS_DE[cls] : TEXT_CLASS_LABELS_EN[cls]) ?? TEXT_CLASS_LABELS_EN[cls] ?? humanize(cls);
}

/** Label of a `$id` state (default, hover, Applied, Row, …). */
export function stateLabel(locale: Locale, stateId: string): string {
  return (locale === 'de' ? STATE_LABELS_DE[stateId] : STATE_LABELS_EN[stateId]) ?? STATE_LABELS_EN[stateId] ?? humanize(stateId);
}
