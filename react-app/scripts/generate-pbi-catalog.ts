/**
 * Generates src/pbi/generated/catalog.json from the official Power BI report theme
 * JSON schema (schema/reportThemeSchema-*.json).
 *
 * The catalog is the source of truth for which visuals, format cards, properties,
 * enum options and value ranges exist. The hand-written curation layer
 * (src/pbi/curation) only decides what the editor shows and how it is labelled.
 *
 * Run: npm run generate:catalog
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARD_PROPS, COMMON_CARDS, PAGE_CARDS, PAGE_CARD_PROPS, VISUAL_CARDS, VISUAL_CARD_PROPS, VISUAL_KEYS, type PropList } from '../src/pbi/curation/selection';

type Json = Record<string, unknown>;

export type CatalogPropType = 'boolean' | 'number' | 'integer' | 'string' | 'color' | 'enum' | 'object' | 'mixed';

export interface CatalogEnumOption {
  value: string | number;
  label: string;
}

export interface CatalogProp {
  key: string;
  type: CatalogPropType;
  title?: string;
  description?: string;
  options?: CatalogEnumOption[];
  min?: number;
  max?: number;
  /** Named $ref definition the property points to (e.g. "fill", "fontSize"). */
  ref?: string;
}

export interface CatalogCard {
  key: string;
  title?: string;
  description?: string;
  props: CatalogProp[];
}

export interface Catalog {
  schemaVersion: string;
  schemaFile: string;
  /** Deduplicated card definitions; visuals/commonCards/pageCards reference them by id. */
  cardDefs: Record<string, CatalogCard>;
  /** Cards every visual has (title, background, border, ...): card key → cardDefs id. */
  commonCards: Record<string, string>;
  /** Visual-specific cards per visual type key: card key → cardDefs id. */
  visuals: Record<string, Record<string, string>>;
  /** Page-level cards (visualStyles.page["*"]): card key → cardDefs id. */
  pageCards: Record<string, string>;
  textClasses: string[];
  textClassProps: string[];
  topLevelColors: string[];
  /** Every visual type key the schema knows (for validation messages). */
  allVisualKeys: string[];
}

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const schemaDir = join(root, 'schema');
const outDir = join(root, 'src', 'pbi', 'generated');

function loadSchema(): { schema: Json; file: string } {
  const file = readdirSync(schemaDir).find((f) => /^reportThemeSchema.*\.json$/.test(f));
  if (!file) throw new Error('No reportThemeSchema*.json found in schema/');
  return { schema: JSON.parse(readFileSync(join(schemaDir, file), 'utf8')) as Json, file };
}

const { schema, file: schemaFile } = loadSchema();
const definitions = schema.definitions as Record<string, Json>;

function deref(node: Json): Json {
  const ref = node.$ref as string | undefined;
  if (!ref) return node;
  const name = ref.split('/').pop() as string;
  const target = definitions[name];
  if (!target) throw new Error(`Unknown $ref ${ref}`);
  return target;
}

function refName(node: Json): string | undefined {
  const ref = node.$ref as string | undefined;
  return ref ? ref.split('/').pop() : undefined;
}

function enumOptions(node: Json): CatalogEnumOption[] | undefined {
  const oneOf = node.oneOf as Json[] | undefined;
  if (!oneOf || !oneOf.every((o) => 'const' in o)) return undefined;
  return oneOf.map((o) => ({ value: o.const as string | number, label: (o.title as string | undefined) ?? String(o.const) }));
}

function propType(node: Json): Pick<CatalogProp, 'type' | 'options' | 'min' | 'max' | 'ref'> {
  const ref = refName(node);
  if (ref === 'fill') return { type: 'color', ref };
  if (ref === 'color') return { type: 'color', ref };
  if (ref === 'themeDataColor') return { type: 'object', ref };
  if (ref) {
    const target = deref(node);
    const inner = propType(target);
    return { ...inner, ref };
  }
  const t = node.type as string | string[] | undefined;
  const options = enumOptions(node);
  if (options) return { type: 'enum', options, min: node.minimum as number | undefined, max: node.maximum as number | undefined };
  if (Array.isArray(t)) return { type: 'mixed' };
  if (t === 'boolean') return { type: 'boolean' };
  if (t === 'integer') return { type: 'integer', min: node.minimum as number | undefined, max: node.maximum as number | undefined };
  if (t === 'number') return { type: 'number', min: node.minimum as number | undefined, max: node.maximum as number | undefined };
  if (t === 'string') return { type: 'string' };
  if (t === 'object' || node.properties) return { type: 'object' };
  if (node.anyOf || node.oneOf) return { type: 'mixed' };
  return { type: 'mixed' };
}

function buildCard(key: string, node: Json): CatalogCard | undefined {
  // Card schemas are arrays of item objects: { type: 'array', items: { properties: {...} } }
  const items = (node.items as Json | undefined) ?? node;
  const resolved = deref(items);
  const props = resolved.properties as Record<string, Json> | undefined;
  if (!props) return undefined;
  const card: CatalogCard = {
    key,
    title: node.title as string | undefined,
    description: node.description as string | undefined,
    props: Object.entries(props)
      .filter(([k]) => k !== '$id')
      .map(([k, p]) => {
        const prop: CatalogProp = { key: k, ...propType(p) };
        if (p.title) prop.title = p.title as string;
        if (p.description) prop.description = p.description as string;
        return prop;
      }),
  };
  return card;
}

function buildCards(propsNode: Record<string, Json> | undefined): Record<string, CatalogCard> {
  const out: Record<string, CatalogCard> = {};
  if (!propsNode) return out;
  for (const [key, node] of Object.entries(propsNode)) {
    if (key === '*') continue; // wildcard card: "apply to every card"
    const card = buildCard(key, node);
    if (card) out[key] = card;
  }
  return out;
}

/** Collect the `properties` maps of a visual definition, split into common vs own. */
function visualCards(defName: string): { common: Record<string, CatalogCard>; own: Record<string, CatalogCard> } {
  const def = definitions[defName];
  if (!def) throw new Error(`Missing definition ${defName}`);
  const parts = (def.allOf as Json[] | undefined) ?? [def];
  let common: Record<string, CatalogCard> = {};
  let own: Record<string, CatalogCard> = {};
  for (const part of parts) {
    if (part.$ref) {
      const target = deref(part);
      common = { ...common, ...buildCards(target.properties as Record<string, Json> | undefined) };
    } else {
      own = { ...own, ...buildCards(part.properties as Record<string, Json> | undefined) };
    }
  }
  return { common, own };
}

const visualStyles = (schema.properties as Json).visualStyles as Json;
const vsProps = visualStyles.properties as Record<string, Json>;

const visuals: Record<string, Record<string, CatalogCard>> = {};
let commonCards: Record<string, CatalogCard> = {};
let pageCards: Record<string, CatalogCard> = {};

for (const [key, node] of Object.entries(vsProps)) {
  const star = (node.properties as Record<string, Json> | undefined)?.['*'];
  if (!star) continue;
  if (key === 'page' || key === 'report') {
    // page/report: { "*": { allOf: [ { properties: {...} } ] } } without a named definition
    const resolved = deref(star);
    const parts = (resolved.allOf as Json[] | undefined) ?? [resolved];
    let cards: Record<string, CatalogCard> = {};
    for (const part of parts) {
      const target = part.$ref ? deref(part) : part;
      cards = { ...cards, ...buildCards(target.properties as Record<string, Json> | undefined) };
    }
    if (key === 'page') pageCards = cards;
    continue;
  }
  const defName = refName(star);
  if (!defName) continue;
  const { common, own } = visualCards(defName);
  if (Object.keys(commonCards).length === 0) commonCards = common;
  visuals[key] = own;
}

const textClassesNode = (schema.properties as Json).textClasses as Json;
const textClasses = Object.keys((textClassesNode.properties as Json) ?? {});
const textClassProps = Object.keys((definitions.textClass?.properties as Json) ?? {});

const topLevelColors = Object.entries(schema.properties as Record<string, Json>)
  .filter(([, v]) => refName(v) === 'color')
  .map(([k]) => k);

// ---------------------------------------------------------------------------
// Apply the curation: keep only selected visuals/cards/props (in curated order).
// Fail loudly when the curation references something the schema does not know.
// ---------------------------------------------------------------------------
const problems: string[] = [];

function pickCard(scope: string, source: Record<string, CatalogCard>, cardKey: string, props: PropList | undefined, strict: boolean): CatalogCard | undefined {
  const card = source[cardKey];
  if (!card) {
    problems.push(`${scope}: card "${cardKey}" does not exist in the schema`);
    return undefined;
  }
  if (!props) {
    problems.push(`${scope}: no property selection for card "${cardKey}" (add it to CARD_PROPS)`);
    return undefined;
  }
  const byKey = new Map(card.props.map((p) => [p.key, p]));
  const selected: CatalogProp[] = [];
  const keys = props === '*' ? card.props.map((p) => p.key) : props;
  for (const key of keys) {
    const prop = byKey.get(key);
    if (!prop) {
      // Shared CARD_PROPS lists are a superset across visuals; only explicit selections are strict.
      if (strict) problems.push(`${scope}.${cardKey}: property "${key}" does not exist in the schema`);
      continue;
    }
    const { description: _d, ...rest } = prop;
    selected.push(rest);
  }
  return { key: card.key, title: card.title, props: selected };
}

const curatedCommon: Record<string, CatalogCard> = {};
for (const cardKey of COMMON_CARDS) {
  const card = pickCard('common', commonCards, cardKey, CARD_PROPS[cardKey], true);
  if (card) curatedCommon[cardKey] = card;
}

const curatedVisuals: Record<string, Record<string, CatalogCard>> = {};
for (const visualKey of VISUAL_KEYS) {
  const own = visuals[visualKey];
  if (!own) {
    problems.push(`visual "${visualKey}" does not exist in the schema`);
    continue;
  }
  const cards = VISUAL_CARDS[visualKey];
  if (!cards) {
    problems.push(`visual "${visualKey}" has no card selection in VISUAL_CARDS`);
    continue;
  }
  const out: Record<string, CatalogCard> = {};
  for (const cardKey of cards) {
    const override = VISUAL_CARD_PROPS[visualKey]?.[cardKey];
    const card = pickCard(visualKey, own, cardKey, override ?? CARD_PROPS[cardKey], override !== undefined);
    if (card) out[cardKey] = card;
  }
  curatedVisuals[visualKey] = out;
}

const curatedPage: Record<string, CatalogCard> = {};
for (const cardKey of PAGE_CARDS) {
  const card = pickCard('page', pageCards, cardKey, PAGE_CARD_PROPS[cardKey] ?? CARD_PROPS[cardKey], true);
  if (card) curatedPage[cardKey] = card;
}

if (problems.length > 0) {
  console.error(`Catalog generation failed with ${problems.length} problem(s):`);
  for (const p of problems) console.error(' - ' + p);
  process.exit(1);
}

// Deduplicate identical card definitions (legend, labels, ... repeat across visuals).
const cardDefs: Record<string, CatalogCard> = {};
const idByContent = new Map<string, string>();
function intern(card: CatalogCard): string {
  const content = JSON.stringify(card);
  let id = idByContent.get(content);
  if (!id) {
    let n = 0;
    id = card.key;
    while (cardDefs[id]) id = `${card.key}#${++n}`;
    idByContent.set(content, id);
    cardDefs[id] = card;
  }
  return id;
}
const internAll = (cards: Record<string, CatalogCard>): Record<string, string> =>
  Object.fromEntries(Object.entries(cards).map(([k, c]) => [k, intern(c)]));

const catalog: Catalog = {
  schemaVersion: (schema.description as string | undefined) ?? 'unknown',
  schemaFile,
  cardDefs,
  commonCards: internAll(curatedCommon),
  visuals: Object.fromEntries(Object.entries(curatedVisuals).map(([k, cards]) => [k, internAll(cards)])),
  pageCards: internAll(curatedPage),
  textClasses,
  textClassProps,
  topLevelColors,
  allVisualKeys: Object.keys(visuals).sort(),
};

mkdirSync(outDir, { recursive: true });
const json = JSON.stringify(catalog);
writeFileSync(join(outDir, 'catalog.json'), json + '\n');

let propCount = 0;
for (const v of Object.values(curatedVisuals)) for (const c of Object.values(v)) propCount += c.props.length;
const summary = `visuals=${Object.keys(curatedVisuals).length} commonCards=${Object.keys(curatedCommon).length} pageCards=${Object.keys(curatedPage).length} props=${propCount} cardDefs=${Object.keys(cardDefs).length} textClasses=${textClasses.length} colors=${topLevelColors.length} size=${Math.round(json.length / 1024)}KB`;
console.log(`Generated src/pbi/generated/catalog.json from ${schemaFile} (schema ${catalog.schemaVersion}): ${summary}`);
