import useThemeStore from '../../store/themeStore';
import PresetSelector from './PresetSelector';
import ImportExportMenu from './ImportExportMenu';
import LoginButton from '../Auth/LoginButton';

const hasMsal = !!import.meta.env.VITE_MSAL_CLIENT_ID;

export default function Toolbar() {
  const { theme, setThemeName, toggleJsonPanel, jsonPanelOpen, toggleDarkMode, darkMode } = useThemeStore();

  return (
    <div className="mb-3">
      <div className="flex items-baseline gap-2 mb-2">
        <h1 className="text-xl font-bold text-[#0f4c81] dark:text-[#89b4fa] leading-tight">
          ⚡ Power BI Theme Designer
        </h1>
        <span className="text-xs text-[#7a8ba6] dark:text-[#565f89] font-medium">
          Visual Theme Editor
        </span>
      </div>
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
      <input
        id="theme-name-input"
        type="text"
        value={theme.name}
        onChange={(e) => setThemeName(e.target.value)}
        className="text-[15px] font-bold text-[#0f4c81] border-0 border-b-2 border-[#c8d8ea] bg-transparent outline-none px-1 py-0.5 min-w-[200px] flex-1 max-w-[340px] focus:border-[#1f8ac0] dark:text-[#89b4fa] dark:border-[#373963] dark:focus:border-[#89b4fa]"
      />
      <div className="flex gap-2 items-center flex-wrap">
        <PresetSelector />
        <ImportExportMenu />
        <button
          onClick={toggleJsonPanel}
          className="text-xs px-3 py-1.5 rounded-md border border-[#c8d8ea] bg-white text-[#555] font-semibold cursor-pointer hover:border-[#1f8ac0] hover:text-[#1f8ac0] dark:bg-[#24263e] dark:text-[#89b4fa] dark:border-[#373963]"
        >
          {jsonPanelOpen ? '{ } Hide JSON' : '{ } Show JSON'}
        </button>
        <button
          onClick={toggleDarkMode}
          className="w-[34px] h-[34px] rounded-full border-[1.5px] border-[#c8d8ea] bg-white cursor-pointer text-[17px] flex items-center justify-center shrink-0 hover:bg-[#f0f5fb] hover:border-[#1f8ac0] dark:border-[#373963] dark:bg-[#24263e] dark:hover:bg-[#2d3055]"
          title="Toggle dark mode"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
        {hasMsal && <LoginButton />}
      </div>
      </div>
    </div>
  );
}
