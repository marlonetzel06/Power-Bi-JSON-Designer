import useThemeStore from '../../store/themeStore';
import PresetSelector from './PresetSelector';
import ImportMenu from './ImportMenu';
import ExportMenu from './ExportMenu';
import LoginButton from '../Auth/LoginButton';
import Button from '../ui/Button';
import { Sun, Moon, Braces } from 'lucide-react';

const hasMsal = !!import.meta.env.VITE_MSAL_CLIENT_ID;

export default function Toolbar() {
  const { theme, setThemeName, toggleJsonPanel, jsonPanelOpen, toggleDarkMode, darkMode } = useThemeStore();

  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2 mb-2">
        <h1 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
          Power BI Theme Designer
        </h1>
        <span className="text-xs text-[var(--text-muted)] font-medium">
          Visual Theme Editor
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
      <input
        id="theme-name-input"
        type="text"
        value={theme.name}
        onChange={(e) => setThemeName(e.target.value)}
        className="text-sm font-bold text-[var(--text-primary)] border-0 border-b-2 border-[var(--border-subtle)] bg-transparent outline-none px-1 py-0.5 min-w-[200px] flex-1 max-w-[340px] focus:border-[var(--color-primary)] transition-colors"
      />
      <div className="flex gap-2 items-center flex-wrap">
        <PresetSelector />
        <ImportMenu />
        <ExportMenu />
        <Button onClick={toggleJsonPanel} variant="ghost">
          <Braces size={14} />
          {jsonPanelOpen ? 'Hide JSON' : 'Show JSON'}
        </Button>
        <Button
          onClick={toggleDarkMode}
          variant="ghost"
          size="icon"
          title="Toggle dark mode"
        >
          {darkMode ? <Moon size={16} /> : <Sun size={16} />}
        </Button>
        {hasMsal && <LoginButton />}
      </div>
      </div>
    </div>
  );
}
