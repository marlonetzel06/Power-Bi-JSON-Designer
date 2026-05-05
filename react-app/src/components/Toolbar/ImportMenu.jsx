import { useState, useRef, useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import { Upload, FileJson, FolderOpen } from 'lucide-react';
import { extractThemeFromVisuals } from '../../utils/pbipImport';
import { toast } from '../ui/Toast';
import Button from '../ui/Button';

export default function ImportMenu() {
  const { loadThemeFromJSON } = useThemeStore();
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

  function handleImportJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { toast.error('File too large (max 5 MB)'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          loadThemeFromJSON(JSON.parse(ev.target.result));
          toast.success('Theme imported successfully');
        } catch (err) {
          toast.error('Invalid JSON: ' + err.message);
        }
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
      const themeFile = files.find(f =>
        f.webkitRelativePath.includes('BaseThemes') &&
        f.webkitRelativePath.includes('StaticResources') &&
        f.name.endsWith('.json')
      ) || files.find(f =>
        f.webkitRelativePath.includes('BaseThemes') && f.name.endsWith('.json')
      );
      if (themeFile) {
        try {
          loadThemeFromJSON(JSON.parse(await themeFile.text()));
          toast.success('Theme imported from PBIP');
        } catch (er) {
          toast.error('Invalid theme JSON: ' + er.message);
        }
        return;
      }
      const visualFiles = files.filter(f =>
        f.webkitRelativePath.includes('/visuals/') && f.name === 'visual.json'
      );
      if (!visualFiles.length) {
        toast.error('No theme data found in this folder.');
        return;
      }
      loadThemeFromJSON(await extractThemeFromVisuals(visualFiles));
      toast.success('Theme extracted from visuals');
    };
    input.click();
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      <Button ref={btnRef} onClick={() => setOpen(!open)} variant="ghost">
        <Upload size={14} />
        Import
      </Button>
      {open && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 mt-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-lg min-w-[170px] z-50 overflow-hidden"
        >
          <button onClick={handleImportJSON} className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-medium text-[var(--text-default)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors">
            <FileJson size={14} />
            Import JSON
          </button>
          <button onClick={handleImportPBIP} className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-medium text-[var(--text-default)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors">
            <FolderOpen size={14} />
            Import from PBIP
          </button>
        </div>
      )}
    </div>
  );
}
