import { ChevronDown, CircleQuestionMark, Download, FolderOpen, Palette, RotateCcw, Upload } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/i18n';
import { useThemeStore } from '@/store/theme';
import { useUiStore } from '@/store/uiStore';
import { Button, ConfirmDialog, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/ui';
import { useImportExport } from '../importExport/useImportExport';
import { PresetPicker } from '../theme/PresetPicker';

/** TopBar "Design" menu: import, export, palettes, reset, help. */
export function DesignMenu() {
  const t = useT();
  const { importJson, importPbip, exportFull, exportDelta } = useImportExport();
  const resetTheme = useThemeStore((s) => s.resetTheme);
  const setHelpOpen = useUiStore((s) => s.setHelpOpen);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" icon={<Palette />} iconRight={<ChevronDown />} data-testid="design-menu">{t('menu.design')}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => void importJson()} data-testid="menu-import-json"><Upload /> {t('menu.importJson')}</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void importPbip()}><FolderOpen /> {t('menu.importPbip')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void exportFull()} data-testid="menu-export-full"><Download /> {t('menu.exportFull')}</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void exportDelta()} data-testid="menu-export-delta"><Download /> {t('menu.exportDelta')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger><Palette /> {t('menu.presets')}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent><PresetPicker asMenuItems /></DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirm(true)} className="text-danger-text data-[highlighted]:bg-danger-soft data-[highlighted]:text-danger-text [&>svg]:text-danger-text"><RotateCcw /> {t('menu.resetTheme')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setHelpOpen(true)}><CircleQuestionMark /> {t('menu.help')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title={t('theme.resetConfirmTitle')} description={t('theme.resetConfirmBody')} confirmLabel={t('theme.removeChanges')} destructive onConfirm={resetTheme} />
    </>
  );
}
