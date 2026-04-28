import useThemeStore from '../../store/themeStore';
import { buildExportTheme, syntaxHL } from '../../utils/themeBuilder';

export default function JSONPanel() {
  const { theme, pageSettings, jsonPanelOpen } = useThemeStore();

  if (!jsonPanelOpen) return null;

  const exportTheme = buildExportTheme(theme, pageSettings);
  const jsonStr = JSON.stringify(exportTheme, null, 2);
  const highlighted = syntaxHL(jsonStr);

  function handleCopy() {
    navigator.clipboard.writeText(jsonStr).then(() => alert('Full theme JSON copied!'));
  }

  function handleDownload() {
    const name = theme.name || 'Customer360_Theme';
    const safe = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = safe + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <aside className="w-[400px] min-w-[300px] bg-[#1e1e2e] text-[#cdd6f4] flex flex-col border-l border-[#2a2a3e]">
      <div className="px-4 py-3 bg-[#181825] text-xs text-[#89b4fa] font-semibold uppercase tracking-wider whitespace-nowrap flex items-center justify-between">
        <span>Live JSON Preview</span>
        <span className="flex gap-1.5">
          <button onClick={handleCopy} className="text-[11px] px-2 py-0.5 rounded bg-[#313244] text-[#cdd6f4] border-none cursor-pointer hover:bg-[#45475a]">Copy</button>
          <button onClick={handleDownload} className="text-[11px] px-2 py-0.5 rounded bg-[#313244] text-[#cdd6f4] border-none cursor-pointer hover:bg-[#45475a]">Download</button>
        </span>
      </div>
      <div
        className="flex-1 overflow-y-auto px-4 py-3.5 text-[11.5px] font-mono whitespace-pre text-[#cdd6f4] scrollbar-thin"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </aside>
  );
}
