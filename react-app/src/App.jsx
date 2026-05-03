import useThemeStore from './store/themeStore';
import Toolbar from './components/Toolbar/Toolbar';
import Sidebar from './components/Sidebar/Sidebar';
import JSONPanel from './components/JSONPanel/JSONPanel';
import VisualGrid from './components/VisualGrid/VisualGrid';
import { ToastProvider } from './components/ui/Toast';
import { useEffect, lazy, Suspense } from 'react';

const EditModal = lazy(() => import('./components/EditModal/EditModal'));

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
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-default)]">
      {/* Sticky Header */}
      <Toolbar />

      {/* Three-column layout: Sidebar | Grid | JSON */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5">
          <VisualGrid />
        </main>
        {jsonPanelOpen && <JSONPanel />}
      </div>

      {/* Edit Modal — includes live preview */}
      <Suspense fallback={null}>
        <EditModal />
      </Suspense>

      <ToastProvider />
    </div>
  );
}
