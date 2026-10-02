/**
 * Typed access to the generated, curated schema catalog.
 */
import catalogJson from './generated/catalog.json';
import { COMMON_CARDS, PAGE_CARDS, VISUAL_CARDS, VISUAL_KEYS } from './curation/selection';
import { GLOBAL_KEY, PAGE_KEY } from './types';

export type CatalogPropType = 'boolean' | 'number' | 'integer' | 'string' | 'color' | 'enum' | 'object' | 'mixed';

export interface CatalogEnumOption {
  value: string | number;
  label: string;
}

export interface CatalogProp {
  key: string;
  type: CatalogPropType;
  title?: string;
  options?: CatalogEnumOption[];
  min?: number;
  max?: number;
  ref?: string;
}

export interface CatalogCard {
  key: string;
  title?: string;
  props: CatalogProp[];
}

interface CatalogShape {
  schemaVersion: string;
  schemaFile: string;
  cardDefs: Record<string, CatalogCard>;
  commonCards: Record<string, string>;
  visuals: Record<string, Record<string, string>>;
  pageCards: Record<string, string>;
  textClasses: string[];
  textClassProps: string[];
  topLevelColors: string[];
  allVisualKeys: string[];
}

const catalog = catalogJson as unknown as CatalogShape;

export const SCHEMA_VERSION = catalog.schemaVersion;
export const SCHEMA_FILE = catalog.schemaFile;
export const TEXT_CLASS_NAMES = catalog.textClasses;
export const TOP_LEVEL_COLOR_KEYS = catalog.topLevelColors;
export const ALL_SCHEMA_VISUAL_KEYS = catalog.allVisualKeys;

function def(id: string | undefined): CatalogCard | undefined {
  return id ? catalog.cardDefs[id] : undefined;
}

/** Common ("Allgemein") card definition shared by every visual. */
export function getCommonCard(cardKey: string): CatalogCard | undefined {
  return def(catalog.commonCards[cardKey]);
}

/** Visual-specific card definition. For `*` only common cards exist. */
export function getVisualCard(visualKey: string, cardKey: string): CatalogCard | undefined {
  if (visualKey === PAGE_KEY) return def(catalog.pageCards[cardKey]);
  const own = def(catalog.visuals[visualKey]?.[cardKey]);
  return own ?? getCommonCard(cardKey);
}

/** Card keys of the "Visual" tab for a visual (curated order). */
export function getVisualCardKeys(visualKey: string): readonly string[] {
  if (visualKey === PAGE_KEY) return PAGE_CARDS;
  if (visualKey === GLOBAL_KEY) return [];
  return VISUAL_CARDS[visualKey] ?? [];
}

/** Card keys of the "Allgemein" tab (same for every visual, none for the page). */
export function getCommonCardKeys(visualKey: string): readonly string[] {
  return visualKey === PAGE_KEY ? [] : COMMON_CARDS;
}

/** All card keys an editor shows for a visual: visual cards first, then common cards. */
export function getAllCardKeys(visualKey: string): readonly string[] {
  return [...getVisualCardKeys(visualKey), ...getCommonCardKeys(visualKey)];
}

export function getProp(visualKey: string, cardKey: string, propKey: string): CatalogProp | undefined {
  return getVisualCard(visualKey, cardKey)?.props.find((p) => p.key === propKey);
}

export function isCuratedVisual(key: string): boolean {
  return key === GLOBAL_KEY || key === PAGE_KEY || VISUAL_KEYS.includes(key);
}

export function isSchemaVisual(key: string): boolean {
  return key === GLOBAL_KEY || key === PAGE_KEY || catalog.allVisualKeys.includes(key);
}

export { VISUAL_KEYS };
