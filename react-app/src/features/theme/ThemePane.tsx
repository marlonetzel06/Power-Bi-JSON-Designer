import { Download, RotateCcw, Upload } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/i18n';
import { COMMON_CARDS } from '@/pbi/curation/selection';
import { GLOBAL_KEY, PAGE_KEY } from '@/pbi/types';
import { useModified, useThemeName } from '@/store/selectors';
import { useThemeStore } from '@/store/theme';
import { useUiStore } from '@/store/uiStore';
import { Button, ConfirmDialog, FormatCard, Input } from '@/ui';
import { FormatCards } from '../format/FormatCards';
import { useImportExport } from '../importExport/useImportExport';
import { ColorsSection } from './ColorsSection';
import { TextSection } from './TextSection';

type SectionId = 'settings' | 'colors' | 'text' | 'visuals' | 'page' | 'filterPane' | 'filterCards';
const SECTIONS: readonly { id: SectionId; labelKey: 'theme.settings' | 'theme.colors' | 'theme.text' | 'theme.visualProps' | 'theme.page' | 'theme.filterPane' | 'theme.filterCards' }[] = [
  { id: 'settings', labelKey: 'theme.settings' },
  { id: 'colors', labelKey: 'theme.colors' },
  { id: 'text', labelKey: 'theme.text' },
  { id: 'visuals', labelKey: 'theme.visualProps' },
  { id: 'page', labelKey: 'theme.page' },
  { id: 'filterPane', labelKey: 'theme.filterPane' },
  { id: 'filterCards', labelKey: 'theme.filterCards' },
];

/** Power BI Desktop "Design anpassen" pane: the same sections, in the same order. */
export function ThemePane() {
  const t = useT();
  const expanded = useUiStore((s) => s.expandedCards['theme-pane']);
  const setCardExpanded = useUiStore((s) => s.setCardExpanded);
  const modified = useModified();
  const changed: Record<SectionId, boolean> = {
    settings: false,
    colors: modified.dataColorsChanged,
    text: modified.textClassesChanged,
    visuals: modified.globalsChanged,
    page: Boolean(modified.cards[PAGE_KEY]?.has('pageSize') || modified.cards[PAGE_KEY]?.has('background') || modified.cards[PAGE_KEY]?.has('outspace') || modified.cards[PAGE_KEY]?.has('displayArea')),
    filterPane: Boolean(modified.cards[PAGE_KEY]?.has('outspacePane')),
    filterCards: Boolean(modified.cards[PAGE_KEY]?.has('filterCard')),
  };
  const isOpen = (id: SectionId) => (expanded ? expanded.includes(id) : id === 'settings' || id === 'colors');

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" data-testid="theme-pane">
      {SECTIONS.map((s) => (
        <FormatCard key={s.id} id={`theme-${s.id}`} level="section" title={t(s.labelKey)} modified={changed[s.id]} open={isOpen(s.id)} onOpenChange={(o) => setCardExpanded('theme-pane', s.id, o)}>
          {s.id === 'settings' && <SettingsSection />}
          {s.id === 'colors' && <ColorsSection />}
          {s.id === 'text' && <TextSection />}
          {s.id === 'visuals' && <FormatCards visualKey={GLOBAL_KEY} cards={COMMON_CARDS} memoryKey="theme-visuals" />}
          {s.id === 'page' && <FormatCards visualKey={PAGE_KEY} cards={['pageSize', 'background', 'outspace', 'displayArea']} memoryKey="theme-page" />}
          {s.id === 'filterPane' && <FormatCards visualKey={PAGE_KEY} cards={['outspacePane']} memoryKey="theme-filterPane" defaultOpen flat />}
          {s.id === 'filterCards' && <FormatCards visualKey={PAGE_KEY} cards={['filterCard']} memoryKey="theme-filterCards" defaultOpen flat />}
        </FormatCard>
      ))}
    </div>
  );
}

function SettingsSection() {
  const t = useT();
  const name = useThemeName();
  const setName = useThemeStore((s) => s.setName);
  const resetTheme = useThemeStore((s) => s.resetTheme);
  const { importJson, exportFull } = useImportExport();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-[12px] text-text-body">
        {t('app.themeName')}
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('app.themeNamePlaceholder')} data-testid="theme-name-input" />
      </label>
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" variant="secondary" icon={<Upload />} onClick={() => void importJson()}>{t('theme.import')}</Button>
        <Button size="sm" variant="secondary" icon={<Download />} onClick={() => void exportFull()}>{t('theme.export')}</Button>
        <Button size="sm" variant="danger" icon={<RotateCcw />} onClick={() => setConfirm(true)}>{t('theme.removeChanges')}</Button>
      </div>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title={t('theme.resetConfirmTitle')} description={t('theme.resetConfirmBody')} confirmLabel={t('theme.removeChanges')} destructive onConfirm={resetTheme} />
    </div>
  );
}
