import { Braces, CircleQuestionMark, LogIn, LogOut, Loader2, Moon, Palette, Redo2, Sun, Undo2 } from 'lucide-react';
import { useAuthStore } from '@/embed/authStore';
import { useT } from '@/i18n';
import { useModified, useThemeName, useUndoRedo } from '@/store/selectors';
import { useThemeStore } from '@/store/theme';
import { useUiStore, type Locale } from '@/store/uiStore';
import { Badge, IconButton, Kbd, SegmentedControl, Tooltip } from '@/ui';
import { DesignMenu } from './DesignMenu';
import logo from '/mm-logo.png';

/** M&M TopBar (68 px): eyebrow + editable theme name left; actions right. */
export function TopBar() {
  const t = useT();
  const name = useThemeName();
  const setName = useThemeStore((s) => s.setName);
  const modified = useModified();
  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const colorMode = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const locale = useUiStore((s) => s.locale);
  const setLocale = useUiStore((s) => s.setLocale);
  const openPanes = useUiStore((s) => s.openPanes);
  const togglePane = useUiStore((s) => s.togglePane);
  const setCollapsed = useUiStore((s) => s.setPaneCollapsed);
  const setHelpOpen = useUiStore((s) => s.setHelpOpen);
  const totalChanges = Object.values(modified.cardCounts).reduce((a, b) => a + b, 0) + (modified.dataColorsChanged ? 1 : 0) + (modified.textClassesChanged ? 1 : 0);

  const openPane = (pane: 'theme' | 'json') => {
    togglePane(pane);
    setCollapsed(pane, false);
  };

  return (
    <header className="z-[15] flex h-[68px] shrink-0 items-center gap-4 border-b border-border-subtle bg-surface-page px-5" data-testid="topbar">
      <img src={logo} alt="M&M Software" className="size-9 shrink-0 rounded-[9px] shadow-xs" />
      <div className="flex min-w-0 flex-col justify-center">
        <span className="mm-eyebrow">{t('app.eyebrow')}</span>
        <div className="flex items-center gap-2">
          <span className="relative inline-grid min-w-[120px] max-w-[480px]">
            {/* Mirror text sizes the input to its content (grid stacking). */}
            <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre px-1 font-display text-[22px] font-black uppercase leading-[1.05] tracking-[-0.02em]">{name || t('app.themeNamePlaceholder')}</span>
            <input
              aria-label={t('app.themeName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('app.themeNamePlaceholder')}
              spellCheck={false}
              data-testid="topbar-theme-name"
              className="col-start-1 row-start-1 -ml-1 w-full min-w-0 rounded-sm border border-transparent bg-transparent px-1 font-display text-[22px] font-black uppercase leading-[1.05] tracking-[-0.02em] text-text-primary outline-none transition-colors duration-[var(--dur-fast)] placeholder:normal-case placeholder:text-text-muted hover:border-border-default focus:border-border-brand focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus-ring"
            />
          </span>
          {totalChanges > 0 && <Badge tone="brand" data-testid="change-count">{totalChanges}</Badge>}
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5">
        <Tooltip content={<span className="inline-flex items-center gap-1.5">{t('action.undo')} <Kbd>Ctrl</Kbd><Kbd>Z</Kbd></span>}>
          <IconButton label={t('action.undo')} size="md" noTooltip disabled={!canUndo} onClick={undo} data-testid="undo"><Undo2 size={18} /></IconButton>
        </Tooltip>
        <Tooltip content={<span className="inline-flex items-center gap-1.5">{t('action.redo')} <Kbd>Ctrl</Kbd><Kbd>Y</Kbd></span>}>
          <IconButton label={t('action.redo')} size="md" noTooltip disabled={!canRedo} onClick={redo} data-testid="redo"><Redo2 size={18} /></IconButton>
        </Tooltip>
      </div>

      <DesignMenu />

      <div className="flex items-center gap-0.5" role="group" aria-label={t('topbar.panes')}>
        <IconButton label={t('pane.theme')} size="md" active={openPanes.includes('theme')} aria-pressed={openPanes.includes('theme')} onClick={() => openPane('theme')} data-testid="toggle-theme-pane"><Palette size={18} /></IconButton>
        <IconButton label={t('topbar.json')} size="md" active={openPanes.includes('json')} aria-pressed={openPanes.includes('json')} onClick={() => openPane('json')} data-testid="toggle-json-pane"><Braces size={18} /></IconButton>
      </div>

      <SegmentedControl<Locale> aria-label={t('topbar.language')} size="sm" value={locale} onValueChange={setLocale} options={[{ value: 'de', label: 'DE' }, { value: 'en', label: 'EN' }]} />
      <IconButton label={colorMode === 'dark' ? t('topbar.lightMode') : t('topbar.darkMode')} size="md" onClick={toggleTheme} data-testid="toggle-color-mode">{colorMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</IconButton>
      <IconButton label={t('menu.help')} size="md" onClick={() => setHelpOpen(true)} data-testid="open-help"><CircleQuestionMark size={18} /></IconButton>
      <LiveLogin />
    </header>
  );
}

function LiveLogin() {
  const t = useT();
  const status = useAuthStore((s) => s.status);
  const accountName = useAuthStore((s) => s.accountName);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  if (status === 'unconfigured') return null;
  const busy = status === 'initializing' || status === 'acquiring';
  const signedIn = status === 'ready' || (status === 'error' && accountName);
  const label = busy ? t('preview.liveUnavailable.acquiring') : signedIn ? t('live.signOutHint', { account: accountName ?? '' }) : t('live.signInHint');
  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        disabled={busy}
        onClick={() => void (signedIn ? signOut() : signIn())}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-default bg-surface-card px-2.5 text-[12px] font-semibold text-text-body hover:border-border-strong hover:text-text-primary disabled:opacity-50"
      >
        {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : signedIn ? <LogOut size={14} aria-hidden /> : <LogIn size={14} aria-hidden />}
        <span className="max-w-[140px] truncate">{busy ? '…' : signedIn ? accountName : t('action.signIn')}</span>
        {status === 'error' && <span className="size-1.5 rounded-pill bg-danger" aria-label={t('live.status.error')} />}
      </button>
    </Tooltip>
  );
}
