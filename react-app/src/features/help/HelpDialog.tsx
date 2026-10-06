import { useT } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import { Dialog, DialogContent, Kbd } from '@/ui';

export function HelpDialog() {
  const t = useT();
  const open = useUiStore((s) => s.helpOpen);
  const setOpen = useUiStore((s) => s.setHelpOpen);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title={t('help.title')} description={t('app.subtitle')} size="md">
        <div className="flex flex-col gap-5 text-[13px] leading-relaxed text-text-body">
          <section>
            <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-text-muted">{t('help.start')}</h3>
            <ol className="m-0 flex list-decimal flex-col gap-1 pl-5">
              <li>{t('help.start.1')}</li>
              <li>{t('help.start.2')}</li>
              <li>{t('help.start.3')}</li>
              <li>{t('help.start.4')}</li>
            </ol>
          </section>
          <section>
            <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-text-muted">{t('help.preview')}</h3>
            <p className="m-0">{t('help.preview.1')}</p>
            <p className="m-0 mt-1">{t('help.preview.2')}</p>
          </section>
          <section>
            <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-text-muted">{t('help.validation')}</h3>
            <p className="m-0">{t('help.validation.1')}</p>
          </section>
          <section>
            <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-text-muted">{t('help.shortcuts')}</h3>
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              <dt className="flex gap-1"><Kbd>Ctrl</Kbd><Kbd>Z</Kbd> / <Kbd>Y</Kbd></dt><dd className="m-0">{t('help.shortcuts.undo')}</dd>
              <dt><Kbd>Esc</Kbd></dt><dd className="m-0">{t('help.shortcuts.escape')}</dd>
            </dl>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
