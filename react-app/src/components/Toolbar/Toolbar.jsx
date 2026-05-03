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
    <header className="sticky top-0 z-30 bg-[#041B2B] px-5 py-2.5 flex items-center justify-between gap-4 shadow-md">
      <div className="flex items-center gap-4">
        <img src="/mm-logo.png" alt="M&M Software" className="h-7 object-contain" />
        <div className="w-px h-6 bg-white/20" />
        <h1 className="text-sm font-bold text-white whitespace-nowrap">
          Power BI Theme Designer
        </h1>
        <input
          id="theme-name-input"
          type="text"
          value={theme.name}
          onChange={(e) => setThemeName(e.target.value)}
          className="text-sm font-semibold text-white/90 border-0 border-b-2 border-white/30 bg-transparent outline-none px-1.5 py-0.5 w-[200px] focus:border-[var(--color-accent)] transition-colors placeholder:text-white/50"
        />
      </div>
      <div className="flex gap-2 items-center flex-wrap toolbar-actions">
        <PresetSelector />
        <ImportMenu />
        <ExportMenu />
        <Button onClick={toggleJsonPanel} variant="ghost" size="sm">
          <Braces size={14} />
          {jsonPanelOpen ? 'Hide JSON' : 'JSON'}
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
    </header>
  );
}
