import { memo } from 'react';
import { useLocale, useT } from '@/i18n';
import type { CatalogProp } from '@/pbi/catalog';
import { enumLabel, propLabel } from '@/pbi/curation/labels';
import type { Resolved, ValueSource } from '@/pbi/resolve';
import { solid, type PropValue } from '@/pbi/types';
import { useThemeStore } from '@/store/theme';
import { ColorField, Field, Input, NumberInput, Select, Switch } from '@/ui';
import { fontOptions } from './fonts';

export interface PropControlProps {
  visualKey: string;
  cardKey: string;
  prop: CatalogProp;
  value: Resolved;
  source: ValueSource;
  /** Stored value for object-typed properties (shown read-only). */
  raw?: PropValue;
  /** `$id` state the control writes to. */
  stateId?: string;
}

/** Numbers whose Power BI default is "Auto" (shown empty unless the theme sets them). */
const AUTO_KEYS = /^(sec)?(start|end)$|Precision$|^(labelPrecision|dataLabelDecimalPoints)$/;
const FONT_SIZE_KEYS = new Set(['fontSize', 'textSize', 'titleFontSize', 'secFontSize', 'secTitleFontSize', 'valueFontSize', 'detailFontSize', 'levelTitleFontSize', 'levelSubtitleFontSize', 'categoryLabelFontSize', 'dataLabelFontSize', 'titleSize', 'headerSize', 'searchTextSize', 'labelFontSize', 'calloutSize']);
const PERCENT_KEYS = /transparency|Transparency|Percent|innerPadding|labelDensity|maxMarginFactor|seriesMaximumWidth|innerRadiusRatio|clusteredGapSize|stackedGapSize|ribbonGapSize|labelSpace|valueArea|imageAreaSize|interpolationSmoothParam/;
const PX_KEYS = /^(width|weight|radius|top|bottom|left|right|borderSize|borderWidth|strokeWidth|markerSize|markerShapeSize|markerBorderWidth|shadowBlur|shadowDistance|shadowSpread|glowDistance|glowSpread|gridlineThickness|gridLineWidth|gridlineWidth|lineWidth|steppedLayoutIndentation|rowPadding|columnPadding|cellPadding|imageHeight|imageWidth|rectangleRoundedCurve\w*|roundEdge|barWeight|barWidth|barBorderSize|pageSizeWidth|pageSizeHeight|outlineWeight|iconSize|size|spacing|cardPadding|gridVerticalWeight|gridHorizontalWeight|\w+OuterMargin|\w+Margin|padding\w*|outerPadding|paddingBeforeDivider|paddingAfterDivider|leaderLineWidth|dividerWidth|indentation|containerIndentation|bubbleRadius|minBubbleRadius|maxRadius|bubbleStrokeWidth|borderThickness|filterRadius|dismissSize|dismissSpacing)$/;

/** Renders the right control for a catalog property and writes to the store. */
export const PropControl = memo(function PropControl({ visualKey, cardKey, prop, value, source, raw, stateId }: PropControlProps) {
  const t = useT();
  const locale = useLocale();
  const setProp = useThemeStore((s) => s.setCardProp);
  const setCardProp = (vk: string, ck: string, pk: string, v: PropValue | undefined) => setProp(vk, ck, pk, v, stateId);
  const id = `${visualKey}-${cardKey}-${prop.key}${stateId ? `-${stateId}` : ''}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const label = propLabel(locale, prop);
  const sourceLabel = source === 'visual' ? t('format.setOnVisual') : source === 'global' ? t('format.inheritedFromGlobal') : source === 'base' ? t('format.inheritedBase') : t('format.inheritedDefault');

  switch (prop.type) {
    case 'boolean':
      return (
        <Field id={id} label={label} inline source={source} sourceLabel={sourceLabel}>
          <Switch id={id} size="sm" checked={Boolean(value)} onCheckedChange={(c) => setCardProp(visualKey, cardKey, prop.key, c)} />
        </Field>
      );
    case 'color':
      return (
        <Field id={id} label={label} inline source={source} sourceLabel={sourceLabel}>
          <ColorField
            aria-label={label}
            value={typeof value === 'string' ? value : undefined}
            onChange={(hex) => setCardProp(visualKey, cardKey, prop.key, solid(hex))}
            onClear={source === 'visual' ? () => setCardProp(visualKey, cardKey, prop.key, undefined) : undefined}
            showHex
            size="sm"
            className="h-7 min-w-[118px]"
          />
        </Field>
      );
    case 'number':
    case 'integer':
    case 'mixed': {
      // `mixed` reaches here only for number|string unions (axis start/end): a number input, empty = automatic.
      const isTransparency = /transparency/i.test(prop.key);
      const suffix = FONT_SIZE_KEYS.has(prop.key) ? 'pt' : isTransparency || PERCENT_KEYS.test(prop.key) ? '%' : PX_KEYS.test(prop.key) ? 'px' : prop.key.toLowerCase().includes('angle') || prop.key.toLowerCase().includes('rotation') ? '°' : undefined;
      const min = prop.min ?? (isTransparency ? 0 : undefined);
      const max = prop.max ?? (isTransparency ? 100 : undefined);
      const auto = AUTO_KEYS.test(prop.key);
      const shown = auto && source === 'default' ? undefined : value;
      return (
        <Field id={id} label={label} inline source={source} sourceLabel={sourceLabel}>
          <NumberInput
            id={id}
            className="h-7 w-[96px]"
            value={typeof shown === 'number' ? shown : typeof shown === 'string' && shown !== '' && Number.isFinite(Number(shown)) ? Number(shown) : undefined}
            min={min}
            max={max}
            integer={prop.type === 'integer'}
            suffix={suffix}
            placeholder={prop.type === 'mixed' || auto ? t('format.auto') : undefined}
            onValueChange={(n) => setCardProp(visualKey, cardKey, prop.key, n)}
          />
        </Field>
      );
    }
    case 'enum': {
      const options = (prop.options ?? []).map((o) => ({ value: String(o.value), label: enumLabel(locale, o) }));
      const current = value === undefined ? undefined : String(value);
      const list = current && !options.some((o) => o.value === current) ? [{ value: current, label: current }, ...options] : options;
      return (
        <Field id={id} label={label} source={source} sourceLabel={sourceLabel}>
          <Select
            aria-label={label}
            size="sm"
            value={current}
            options={list}
            onValueChange={(v) => {
              const opt = prop.options?.find((o) => String(o.value) === v);
              setCardProp(visualKey, cardKey, prop.key, opt ? opt.value : v);
            }}
          />
        </Field>
      );
    }
    case 'string': {
      const isFont = /fontFamily|FontFamily/.test(prop.key);
      if (isFont) {
        const current = typeof value === 'string' ? value : undefined;
        return (
          <Field id={id} label={label} source={source} sourceLabel={sourceLabel}>
            <Select aria-label={label} size="sm" value={current} options={fontOptions(current)} placeholder={t('format.fontPlaceholder')} onValueChange={(v) => setCardProp(visualKey, cardKey, prop.key, v)} />
          </Field>
        );
      }
      return (
        <Field id={id} label={label} source={source} sourceLabel={sourceLabel}>
          <Input
            id={id}
            className="h-7"
            defaultValue={typeof value === 'string' ? value : ''}
            key={`${id}-${String(value ?? '')}`}
            onBlur={(e) => {
              const v = e.target.value;
              if (v !== (value ?? '')) setCardProp(visualKey, cardKey, prop.key, v === '' ? undefined : v);
            }}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          />
        </Field>
      );
    }
    case 'object': {
      // image / fillRule / themeDataColor: shown as stored, editable via JSON only
      const stored = raw !== undefined && raw !== null ? raw : undefined;
      const summary = stored && typeof stored === 'object' && 'name' in (stored as Record<string, unknown>) ? String((stored as Record<string, unknown>).name) : stored !== undefined ? JSON.stringify(stored) : '—';
      return (
        <Field id={id} label={label} hint={t('format.objectOnlyJson')} source={source} sourceLabel={sourceLabel}>
          <code className="block max-h-16 overflow-auto rounded-sm bg-surface-subtle px-1.5 py-1 font-mono text-[11px] text-text-muted" title={stored !== undefined ? JSON.stringify(stored) : undefined}>{summary}</code>
        </Field>
      );
    }
    default:
      return (
        <Field id={id} label={label} hint={t('format.notEditable')}>
          <span className="font-mono text-[11px] text-text-muted">{prop.type}</span>
        </Field>
      );
  }
});
