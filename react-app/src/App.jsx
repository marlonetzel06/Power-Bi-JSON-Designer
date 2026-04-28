import useThemeStore from './store/themeStore';
import Toolbar from './components/Toolbar/Toolbar';
import GlobalBar from './components/GlobalBar/GlobalBar';
import JSONPanel from './components/JSONPanel/JSONPanel';
import VisualGrid from './components/VisualGrid/VisualGrid';
import EditModal from './components/EditModal/EditModal';
import PreviewPanel from './components/PreviewPanel/PreviewPanel';
import { useEffect } from 'react';

export default function App() {
  const { darkMode, jsonPanelOpen, previewPanelOpen, togglePreviewPanel } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    if (darkMode) {
      document.documentElement.setAttribute('data-dark', '');
    } else {
      document.documentElement.removeAttribute('data-dark');
    }
  }, [darkMode]);

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-[#1a1b2e] text-[#c0caf5]' : 'bg-[#f0f2f5] text-[#333]'}`}>
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-5">
        <Toolbar />
        <GlobalBar />
        <VisualGrid />
      </div>

      {/* JSON Panel */}
      {jsonPanelOpen && <JSONPanel />}

      {/* Preview Panel */}
      {previewPanelOpen && <PreviewPanel onClose={togglePreviewPanel} />}

      {/* Edit Modal */}
      <EditModal />
    </div>
  );
}
