import useThemeStore from './store/themeStore';
import Toolbar from './components/Toolbar/Toolbar';
import Sidebar from './components/Sidebar/Sidebar';
import JSONPanel from './components/JSONPanel/JSONPanel';
import HelpPanel from './components/HelpPanel/HelpPanel';
import VisualGrid from './components/VisualGrid/VisualGrid';
import VisualFocusView from './components/VisualGrid/VisualFocusView';
import PropertyDrawer from './components/PropertyDrawer/PropertyDrawer';
import { ToastProvider } from './components/ui/Toast';
import { useEffect } from 'react';
import { useUiStore, applyUiToDocument } from './store/uiStore';

export default function App() {
  const { jsonPanelOpen, currentVisual } = useThemeStore();
  const colorMode = useUiStore((s) => s.theme);
  const locale = useUiStore((s) => s.locale);

  useEffect(() => {
    applyUiToDocument(colorMode, locale);
  }, [colorMode, locale]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-default)]">
      {/* Sticky Header */}
      <Toolbar />

      {/* Multi-column layout: Sidebar | Content | PropertyDrawer | JSON */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        {/* Both always mounted — CSS hides inactive to preserve iframe state */}
        <main className={`flex-1 overflow-y-auto p-5 min-w-0 ${currentVisual ? 'hidden' : ''}`}>
          <VisualGrid />
        </main>
        {currentVisual && (
          <main className="flex-1 overflow-y-auto p-5 min-w-0">
            <VisualFocusView />
          </main>
        )}
        <PropertyDrawer />
        {jsonPanelOpen && <JSONPanel />}
      </div>

      <ToastProvider />
      <HelpPanel />
    </div>
  );
}
