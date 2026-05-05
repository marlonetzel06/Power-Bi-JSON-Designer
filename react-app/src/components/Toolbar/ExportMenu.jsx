import useThemeStore from '../../store/themeStore';
import { buildExportTheme } from '../../utils/themeBuilder';
import { Download } from 'lucide-react';
import { toast } from '../ui/Toast';
import Button from '../ui/Button';

export default function ExportMenu() {
  const { theme, pageSettings } = useThemeStore();

  function handleExport() {
    const name = theme.name || 'Customer360_Theme';
    const safe = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const blob = new Blob([JSON.stringify(buildExportTheme(theme, pageSettings), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = safe + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Theme exported');
  }

  return (
    <Button onClick={handleExport} variant="ghost">
      <Download size={14} />
      Export
    </Button>
  );
}
