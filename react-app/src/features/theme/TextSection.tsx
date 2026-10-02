import { useState } from 'react';
import { useLocale, useT } from '@/i18n';
import { textClassLabel } from '@/pbi/curation/labels';
import { PRIMARY_TEXT_CLASSES, SECONDARY_TEXT_CLASSES } from '@/pbi/curation/selection';
import { useTheme } from '@/store/selectors';
import { useThemeStore } from '@/store/theme';
import { ColorField, FormatCard, NumberInput, Select } from '@/ui';
import { fontOptions } from '../format/fonts';

const WEIGHTS = ['normal', 'bold', 'lighter', 'bolder', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

/** Power BI theme pane → "Text": the 4 primary text classes, secondary ones under "Erweitert". */
export function TextSection() {
  const t = useT();
  const [advanced, setAdvanced] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11.5px] text-text-muted">{t('theme.text.primary')}</p>
      {PRIMARY_TEXT_CLASSES.map((cls) => <TextClassRow key={cls} cls={cls} />)}
      <FormatCard id="text-advanced" title={t('theme.colors.advanced')} open={advanced} onOpenChange={setAdvanced}>
        <p className="mb-2 text-[11.5px] text-text-muted">{t('theme.text.secondary')}</p>
        <div className="flex flex-col gap-3">
          {SECONDARY_TEXT_CLASSES.map((cls) => <TextClassRow key={cls} cls={cls} />)}
        </div>
      </FormatCard>
    </div>
  );
}

function TextClassRow({ cls }: { cls: string }) {
  const t = useT();
  const locale = useLocale();
  const theme = useTheme();
  const setTextClass = useThemeStore((s) => s.setTextClass);
  const tc = (theme.textClasses as Record<string, { fontFace?: string; fontSize?: number; fontWeight?: string; color?: string }> | undefined)?.[cls] ?? {};
  const id = `tc-${cls}`;
  return (
    <fieldset className="m-0 rounded-md border border-border-subtle bg-surface-card p-2.5" data-testid={`text-class-${cls}`}>
      <legend className="px-1 text-[12px] font-semibold text-text-primary">{textClassLabel(locale, cls)}</legend>
      <div className="grid grid-cols-[1fr_72px] gap-x-2 gap-y-1.5">
        <label htmlFor={`${id}-face`} className="col-span-2 -mb-1 text-[11px] text-text-muted">{t('theme.text.fontFace')}</label>
        <Select aria-label={`${textClassLabel(locale, cls)}: ${t('theme.text.fontFace')}`} size="sm" value={tc.fontFace} options={fontOptions(tc.fontFace)} placeholder={t('format.fontPlaceholder')} onValueChange={(v) => setTextClass(cls, 'fontFace', v)} />
        <NumberInput aria-label={`${textClassLabel(locale, cls)}: ${t('theme.text.fontSize')}`} className="h-7" value={tc.fontSize} min={6} max={60} suffix="pt" onValueChange={(n) => setTextClass(cls, 'fontSize', n)} />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-text-muted">{t('theme.text.fontWeight')}</span>
          <Select aria-label={`${textClassLabel(locale, cls)}: ${t('theme.text.fontWeight')}`} size="sm" className="w-[110px]" value={tc.fontWeight} options={WEIGHTS.map((w) => ({ value: w, label: w }))} placeholder="—" onValueChange={(v) => setTextClass(cls, 'fontWeight', v)} />
        </div>
        <ColorField aria-label={`${textClassLabel(locale, cls)}: ${t('theme.text.color')}`} value={tc.color} onChange={(hex) => setTextClass(cls, 'color', hex)} onClear={tc.color ? () => setTextClass(cls, 'color', undefined) : undefined} size="sm" showHex={false} className="h-7 w-full justify-center" />
      </div>
    </fieldset>
  );
}
