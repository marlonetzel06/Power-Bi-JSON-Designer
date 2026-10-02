import { useLocale, useT } from '@/i18n';
import type { CatalogProp } from '@/pbi/catalog';
import { enumLabel, propLabel } from '@/pbi/curation/labels';
import type { Resolved, ValueSource } from '@/pbi/resolve';
import { solid } from '@/pbi/types';
import { useThemeStore } from '@/store/theme';
import { ColorField, Field, Input, NumberInput, Select, Switch } from '@/ui';
import { fontOptions } from './fonts';

export interface PropControlProps {
  visualKey: string;
  cardKey: string;
  prop: CatalogProp;
  value: Resolved;
  source: ValueSource;
}

const FONT_SIZE_KEYS = new Set(['fontSize', 'textSize', 'titleFontSize', 'secFontSize', 'secTitleFontSize', 'valueFontSize', 'detailFontSize', 'levelTitleFontSize', 'levelSubtitleFontSize', 'categoryLabelFontSize', 'dataLabelFontSize', 'titleSize', 'headerSize', 'searchTextSize']);
const PERCENT_KEYS = /transparency|Transparency|Percent|innerPadding|labelDensity|maxMarginFactor|seriesMaximumWidth|innerRadiusRatio/;
const PX_KEYS = /^(width|weight|radius|top|bottom|left|right|borderSize|borderWidth|strokeWidth|markerSize|shadowBlur|shadowDistance|shadowSpread|gridlineThickness|gridLineWidth|steppedLayoutIndentation|rowPadding|imageHeight|rectangleRoundedCurve|roundEdge|barWeight|pageSizeWidth|pageSizeHeight|outlineWeight|iconSize|size|spacing|cardPadding|gridVerticalWeight|gridHorizontalWeight)$/;

/** Renders the right control for a catalog property and writes to the store. */
export function PropControl({ visualKey, cardKey, prop, value, source }: PropControlProps) {
  const t = useT();
  const locale = useLocale();
  const setCardProp = useThemeStore((s) => s.setCardProp);
  const id = `${visualKey}-${cardKey}-${prop.key}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const label = propLabel(locale, prop);
  const sourceLabel = source === 'visual' ? t('format.setOnVisual') : source === 'global' ? t('format.inheritedFromGlobal') : t('format.inheritedDefault');

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
    case 'integer': {
      const suffix = FONT_SIZE_KEYS.has(prop.key) ? 'pt' : PERCENT_KEYS.test(prop.key) ? '%' : PX_KEYS.test(prop.key) ? 'px' : prop.key.toLowerCase().includes('angle') || prop.key.toLowerCase().includes('rotation') ? '°' : undefined;
      return (
        <Field id={id} label={label} inline source={source} sourceLabel={sourceLabel}>
          <NumberInput
            id={id}
            className="h-7 w-[96px]"
            value={typeof value === 'number' ? value : undefined}
            min={prop.min}
            max={prop.max}
            integer={prop.type === 'integer'}
            suffix={suffix}
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
    default:
      return (
        <Field id={id} label={label} hint={t('format.notEditable')}>
          <span className="font-mono text-[11px] text-text-muted">{prop.type}</span>
        </Field>
      );
  }
}
