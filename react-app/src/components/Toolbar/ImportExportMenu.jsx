import { useState, useRef, useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import { buildExportTheme, buildDeltaTheme } from '../../utils/themeBuilder';
import { extractThemeFromVisuals } from '../../utils/pbipImport';

export default function ImportExportMenu() {
  const { theme, themeInitial, pageSettings, loadThemeFromJSON } = useThemeStore();
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
  }

  function handleImportJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { loadThemeFromJSON(JSON.parse(ev.target.result)); }
        catch (err) { alert('Invalid JSON: ' + err.message); }
      };
      reader.readAsText(file);
    };
    input.click();
    setOpen(false);
  }

  async function handleImportPBIP() {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      // Tier 1: direct theme file
      const themeFile = files.find(f =>
        f.webkitRelativePath.includes('BaseThemes') &&
        f.webkitRelativePath.includes('StaticResources') &&
        f.name.endsWith('.json')
      ) || files.find(f =>
        f.webkitRelativePath.includes('BaseThemes') && f.name.endsWith('.json')
      );
      if (themeFile) {
        try { loadThemeFromJSON(JSON.parse(await themeFile.text())); }
        catch (er) { alert('Invalid theme JSON: ' + er.message); }
        return;
      }
      // Tier 2: extract from visuals
      const visualFiles = files.filter(f =>
        f.webkitRelativePath.includes('/visuals/') && f.name === 'visual.json'
      );
      if (!visualFiles.length) {
        alert('No theme data found in this folder.');
        return;
      }
      loadThemeFromJSON(await extractThemeFromVisuals(visualFiles));
    };
    input.click();
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="text-xs px-3 py-1.5 rounded-md border border-[#1f8ac0] bg-white text-[#1f8ac0] font-semibold cursor-pointer hover:bg-[#e8f4fc] dark:bg-[#24263e] dark:hover:bg-[#1e2038]"
      >
        Import / Export ▾
      </button>
      {open && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 mt-1 bg-white border border-[#d0dce8] rounded-md shadow-lg min-w-[160px] z-50 overflow-hidden dark:bg-[#24263e] dark:border-[#373963]"
        >
          <button onClick={handleImportJSON} className="block w-full px-3.5 py-2 text-left text-xs font-medium text-[#333] hover:bg-[#e8f4fc] hover:text-[#1f8ac0] dark:text-[#c9d1d9] dark:hover:bg-[#1e2038] dark:hover:text-[#89b4fa]">
            Import JSON
          </button>
          <button onClick={handleImportPBIP} className="block w-full px-3.5 py-2 text-left text-xs font-medium text-[#333] hover:bg-[#e8f4fc] hover:text-[#1f8ac0] dark:text-[#c9d1d9] dark:hover:bg-[#1e2038] dark:hover:text-[#89b4fa]">
            Import from PBIP
          </button>
          <button onClick={handleExport} className="block w-full px-3.5 py-2 text-left text-xs font-medium text-[#333] hover:bg-[#e8f4fc] hover:text-[#1f8ac0] dark:text-[#c9d1d9] dark:hover:bg-[#1e2038] dark:hover:text-[#89b4fa]">
            Export JSON
          </button>
          <button onClick={handleDeltaExport} className="block w-full px-3.5 py-2 text-left text-xs font-medium text-[#7b5ea7] hover:bg-[#f3eefe] dark:text-[#cba6f7] dark:hover:bg-[#1e2038]">
            Export Delta Δ
          </button>
        </div>
      )}
    </div>
  );
}
