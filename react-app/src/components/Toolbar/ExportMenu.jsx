import { useState, useRef, useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import { buildExportTheme, buildDeltaTheme } from '../../utils/themeBuilder';
import { Download, FileJson, FileDiff } from 'lucide-react';
import { toast } from '../ui/Toast';
import Button from '../ui/Button';

export default function ExportMenu() {
  const { theme, themeInitial, pageSettings } = useThemeStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function handleExport() {
    const name = theme.name || 'Customer360_Theme';
    const safe = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const blob = new Blob([JSON.stringify(buildExportTheme(theme, pageSettings), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = safe + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setOpen(false);
    toast.success('Theme exported');
  }

  function handleDeltaExport() {
    const delta = buildDeltaTheme(theme, themeInitial);
    const name = (theme.name || 'Delta') + '_delta';
    const safe = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const blob = new Blob([JSON.stringify(delta, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = safe + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setOpen(false);
    toast.success('Delta theme exported');
  }

  return (
    <div className="relative inline-block">
      <Button ref={btnRef} onClick={() => setOpen(!open)} variant="primary">
        <Download size={14} />
        Export
      </Button>
      {open && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 mt-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-lg min-w-[170px] z-50 overflow-hidden"
        >
          <button onClick={handleExport} className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-medium text-[var(--text-default)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors">
            <FileJson size={14} />
            Export Full JSON
          </button>
          <button onClick={handleDeltaExport} className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-medium text-[var(--text-default)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors">
            <FileDiff size={14} />
            Export Delta
          </button>
        </div>
      )}
    </div>
  );
}
