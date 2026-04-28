import useThemeStore from './store/themeStore';
import Toolbar from './components/Toolbar/Toolbar';
import GlobalBar from './components/GlobalBar/GlobalBar';
import JSONPanel from './components/JSONPanel/JSONPanel';
import VisualGrid from './components/VisualGrid/VisualGrid';
import EditModal from './components/EditModal/EditModal';
import { useEffect } from 'react';

export default function App() {
  const { darkMode, jsonPanelOpen } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
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

      {/* Edit Modal */}
      <EditModal />
    </div>
  );
}
