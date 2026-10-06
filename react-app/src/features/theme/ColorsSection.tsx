import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useLocale, useT } from '@/i18n';
import { colorLabel } from '@/pbi/curation/labels';
import { COLOR_GROUPS } from '@/pbi/curation/selection';
import { useDataColors, useTheme } from '@/store/selectors';
import { useThemeStore } from '@/store/theme';
import { ColorField, FormatCard, IconButton } from '@/ui';
import { PaletteGenerator } from './PaletteGenerator';
import { PresetPicker } from './PresetPicker';

const GROUP_LABEL: Record<string, 'theme.colors.structural' | 'theme.colors.sentiment' | 'theme.colors.divergent' | 'theme.colors.advanced'> = {
  structural: 'theme.colors.structural',
  sentiment: 'theme.colors.sentiment',
  divergent: 'theme.colors.divergent',
  advanced: 'theme.colors.advanced',
};

/** Power BI theme pane → "Farben": palette presets, data colours, structural/sentiment/divergent/advanced. */
export function ColorsSection() {
  const t = useT();
  const locale = useLocale();
  const theme = useTheme();
  const dataColors = useDataColors();
  const setColor = useThemeStore((s) => s.setColor);
  const setDataColor = useThemeStore((s) => s.setDataColor);
  const addDataColor = useThemeStore((s) => s.addDataColor);
  const removeDataColor = useThemeStore((s) => s.removeDataColor);
  const moveDataColor = useThemeStore((s) => s.moveDataColor);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="mb-1.5 text-[12px] font-semibold text-text-primary">{t('theme.colors.palette')}</h4>
        <div className="flex flex-wrap items-center gap-2">
          <PresetPicker />
          <PaletteGenerator />
        </div>
      </div>

      <div>
        <h4 className="mb-1.5 text-[12px] font-semibold text-text-primary">{t('theme.colors.data')}</h4>
        <ol className="m-0 flex list-none flex-col gap-1 p-0" data-testid="data-colors">
          {dataColors.map((c, i) => (
            <li key={i} className="group flex items-center gap-1">
              <span className="w-5 shrink-0 text-right font-mono text-[11px] text-text-muted" aria-hidden>{i + 1}</span>
              <ColorField aria-label={t('theme.dataColor', { index: i + 1 })} value={c} onChange={(hex) => setDataColor(i, hex)} size="sm" hideThemeColors className="h-7 flex-1" />
              <IconButton label={t('action.moveUp')} size="xs" disabled={i === 0} onClick={() => moveDataColor(i, i - 1)}><ArrowUp size={13} /></IconButton>
              <IconButton label={t('action.moveDown')} size="xs" disabled={i === dataColors.length - 1} onClick={() => moveDataColor(i, i + 1)}><ArrowDown size={13} /></IconButton>
              <IconButton label={t('action.remove')} size="xs" variant="danger" disabled={dataColors.length <= 1} onClick={() => removeDataColor(i)}><X size={13} /></IconButton>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => addDataColor(dataColors[dataColors.length - 1] ?? '#888888')} className="mt-1.5 inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-[12px] font-medium text-text-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-focus-ring" data-testid="add-data-color">
          <Plus size={13} aria-hidden /> {t('action.add')}
        </button>
      </div>

      {COLOR_GROUPS.filter((g) => g.id !== 'advanced').map((g) => (
        <div key={g.id}>
          <h4 className="mb-1.5 text-[12px] font-semibold text-text-primary">{t(GROUP_LABEL[g.id]!)}</h4>
          <ColorRows keys={g.keys} theme={theme} locale={locale} setColor={setColor} />
        </div>
      ))}

      <FormatCard id="colors-advanced" title={t('theme.colors.advanced')} open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <ColorRows keys={COLOR_GROUPS.find((g) => g.id === 'advanced')!.keys} theme={theme} locale={locale} setColor={setColor} />
      </FormatCard>
    </div>
  );
}

function ColorRows({ keys, theme, locale, setColor }: { keys: readonly string[]; theme: Record<string, unknown>; locale: 'de' | 'en'; setColor: (k: string, hex: string | undefined) => void }) {
  return (
    <div className="grid grid-cols-1 gap-1">
      {keys.map((k) => {
        const v = theme[k];
        const hex = typeof v === 'string' ? v : undefined;
        return (
          <div key={k} className="flex items-center justify-between gap-2 py-0.5">
            <span className="min-w-0 truncate text-[12px] text-text-body" title={k}>{colorLabel(locale, k)}</span>
            <ColorField aria-label={colorLabel(locale, k)} value={hex} onChange={(h) => setColor(k, h)} onClear={hex ? () => setColor(k, undefined) : undefined} size="sm" hideThemeColors className="h-7 w-[124px] shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
