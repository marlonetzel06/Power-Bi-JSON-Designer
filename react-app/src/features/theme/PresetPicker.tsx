import { Check, Save, Trash } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/i18n';
import { PRESETS } from '@/pbi/presets';
import { useThemeStore } from '@/store/theme';
import { Button, Dialog, DialogContent, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Input, toast } from '@/ui';
import { Palette } from 'lucide-react';

/** Colour palette presets (built-in + user) as a menu, plus "save current as palette". */
export function PresetPicker({ asMenuItems }: { asMenuItems?: boolean }) {
  const t = useT();
  const custom = useThemeStore((s) => s.customPresets);
  const applyPreset = useThemeStore((s) => s.applyPreset);
  const savePreset = useThemeStore((s) => s.saveCustomPreset);
  const deletePreset = useThemeStore((s) => s.deleteCustomPreset);
  const dataColors = useThemeStore((s) => s.theme.dataColors);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');

  const current = [...PRESETS, ...custom].find((p) => JSON.stringify(p.dataColors) === JSON.stringify(dataColors));

  const items = (
    <>
      <DropdownMenuLabel>{t('theme.presetBuiltin')}</DropdownMenuLabel>
      {PRESETS.map((p) => (
        <DropdownMenuItem key={p.id} onSelect={() => { applyPreset(p); toast.success(t('theme.presetApplied', { name: p.name })); }} data-testid={`preset-${p.id}`}>
          <PresetSwatches colors={p.dataColors} />
          <span className="flex-1">{p.name}</span>
          {current?.id === p.id && <Check size={14} className="text-text-brand" aria-hidden />}
        </DropdownMenuItem>
      ))}
      {custom.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t('theme.presetCustom')}</DropdownMenuLabel>
          {custom.map((p) => (
            <DropdownMenuItem key={p.id} onSelect={() => { applyPreset(p); toast.success(t('theme.presetApplied', { name: p.name })); }}>
              <PresetSwatches colors={p.dataColors} />
              <span className="flex-1">{p.name}</span>
              <button
                type="button"
                aria-label={`${t('action.delete')}: ${p.name}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  deletePreset(p.id);
                }}
                className="inline-flex size-6 items-center justify-center rounded-sm text-text-muted hover:bg-danger-soft hover:text-danger-text"
              >
                <Trash size={13} aria-hidden />
              </button>
            </DropdownMenuItem>
          ))}
        </>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => setSaveOpen(true)}><Save /> {t('menu.savePreset')}</DropdownMenuItem>
    </>
  );

  const dialog = (
    <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
      <DialogContent
        size="sm"
        title={t('menu.savePreset')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSaveOpen(false)}>{t('action.cancel')}</Button>
            <Button
              variant="primary"
              disabled={!name.trim()}
              onClick={() => {
                savePreset(name);
                toast.success(t('theme.presetSaved', { name: name.trim() }));
                setSaveOpen(false);
                setName('');
              }}
            >
              {t('action.save')}
            </Button>
          </>
        }
      >
        <label className="flex flex-col gap-1 text-[12px] text-text-body">
          {t('theme.presetName')}
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && name.trim() && (savePreset(name), setSaveOpen(false), setName(''))} />
        </label>
      </DialogContent>
    </Dialog>
  );

  if (asMenuItems) return <>{items}{dialog}</>;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" icon={<Palette />} data-testid="preset-picker">{current?.name ?? t('menu.presets')}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">{items}</DropdownMenuContent>
      </DropdownMenu>
      {dialog}
    </>
  );
}

function PresetSwatches({ colors }: { colors: readonly string[] }) {
  return (
    <span className="inline-flex shrink-0 gap-px" aria-hidden>
      {colors.slice(0, 6).map((c, i) => <span key={i} className="size-3 first:rounded-l-sm last:rounded-r-sm" style={{ background: c }} />)}
    </span>
  );
}
