import useThemeStore from './store/themeStore';
import Toolbar from './components/Toolbar/Toolbar';
import GlobalBar from './components/GlobalBar/GlobalBar';
import JSONPanel from './components/JSONPanel/JSONPanel';
import VisualGrid from './components/VisualGrid/VisualGrid';
import EditModal from './components/EditModal/EditModal';
import { ToastProvider } from './components/ui/Toast';
import { useEffect } from 'react';

export default function App() {
  const { darkMode, jsonPanelOpen } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    if (darkMode) {
      document.documentElement.setAttribute('data-dark', '');
    } else {
      document.documentElement.removeAttribute('data-dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-default)]">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-5">
        <Toolbar />
        <GlobalBar />
        <VisualGrid />
      </div>

      {/* JSON Panel */}
      {jsonPanelOpen && <JSONPanel />}

      {/* Edit Modal — includes live preview */}
      <EditModal />

      <ToastProvider />
    </div>
  );
}
