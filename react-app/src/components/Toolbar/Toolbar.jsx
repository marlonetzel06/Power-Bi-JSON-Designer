import useThemeStore from '../../store/themeStore';
import PresetSelector from './PresetSelector';
import ImportMenu from './ImportMenu';
import ExportMenu from './ExportMenu';
import LoginButton from '../Auth/LoginButton';
import Button from '../ui/Button';
import { Sun, Moon, Braces, HelpCircle, Pencil, User } from 'lucide-react';

const hasMsal = !!import.meta.env.VITE_MSAL_CLIENT_ID;

function ToolbarDivider() {
  return <div className="w-px h-5 bg-white/20 mx-1" />;
}

export default function Toolbar() {
  const { theme, setThemeName, toggleJsonPanel, jsonPanelOpen, toggleHelpPanel, toggleDarkMode, darkMode } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 bg-[#041B2B] px-5 py-2.5 flex items-center justify-between shadow-md">
      {/* Left: Brand */}
      <div className="flex items-center gap-2.5">
        <img src="/mm-logo.png" alt="M&M Software" className="h-6 object-contain" />
        <span className="text-xs font-bold text-white whitespace-nowrap">PBI Theme Designer</span>
      </div>

      {/* Center: Document Name */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.12] rounded-md px-3 py-1.5">
          <Pencil size={11} className="text-white/40 shrink-0" />
          <input
            id="theme-name-input"
            type="text"
            value={theme.name}
            onChange={(e) => setThemeName(e.target.value)}
            className="text-xs font-semibold text-white bg-transparent border-none outline-none w-[160px] placeholder:text-white/40"
            placeholder="Theme name…"
          />
        </div>
      </div>

      {/* Right: Actions grouped */}
      <div className="flex items-center gap-1.5">
        {/* Document actions */}
        <PresetSelector />
        <ImportMenu />
        <ExportMenu />

        <ToolbarDivider />

        {/* Utility toggles */}
        <Button onClick={toggleJsonPanel} variant="ghost" size="icon" title={jsonPanelOpen ? 'Hide JSON' : 'Show JSON'}>
          <Braces size={15} />
        </Button>
        <Button onClick={toggleDarkMode} variant="ghost" size="icon" title="Toggle dark mode">
          {darkMode ? <Moon size={15} /> : <Sun size={15} />}
        </Button>
        <Button onClick={toggleHelpPanel} variant="ghost" size="icon" title="Help & Info">
          <HelpCircle size={15} />
        </Button>

        {hasMsal && (
          <>
            <ToolbarDivider />
            <LoginButton />
          </>
        )}
      </div>
    </header>
  );
}
