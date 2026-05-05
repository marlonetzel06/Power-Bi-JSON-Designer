import { useState, useEffect, useRef } from 'react';
import useThemeStore from '../../store/themeStore';
import { X, MousePointerClick, Palette, Download, Info, Keyboard, AlertTriangle } from 'lucide-react';

const TABS = [
  { id: 'start', label: 'Get Started' },
  { id: 'tips', label: 'Tips' },
  { id: 'export', label: 'Export' },
];

function StepCard({ number, icon: Icon, title, children }) {
  return (
    <div className="flex gap-3 items-start p-3 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] border border-[var(--border-default)]">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">
        {number}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          {Icon && <Icon size={13} className="text-[var(--color-primary)]" />}
          <span className="text-[11px] font-bold text-[var(--text-primary)]">{title}</span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function TipCard({ icon: Icon, title, variant, children }) {
  const isWarning = variant === 'warning';
  return (
    <div className={`p-3 rounded-[var(--radius-md)] border ${isWarning ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' : 'bg-[var(--bg-elevated)] border-[var(--border-default)]'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={13} className={isWarning ? 'text-amber-600' : 'text-[var(--color-primary)]'} />}
        <span className={`text-[11px] font-bold ${isWarning ? 'text-amber-700 dark:text-amber-400' : 'text-[var(--text-primary)]'}`}>{title}</span>
      </div>
      <p className={`text-[11px] leading-relaxed ${isWarning ? 'text-amber-700 dark:text-amber-300' : 'text-[var(--text-secondary)]'}`}>{children}</p>
    </div>
  );
}

function TabStart() {
  return (
    <div className="flex flex-col gap-2.5">
      <StepCard number={1} icon={MousePointerClick} title="Choose a visual">
        Click any card in the grid to open its property editor on the right side.
      </StepCard>
      <div className="flex justify-center">
        <div className="w-px h-3 bg-[var(--border-default)]" />
      </div>
      <StepCard number={2} icon={Palette} title="Edit properties">
        Adjust colors, fonts, sizes, and toggles. Changes update the live preview instantly.
      </StepCard>
      <div className="flex justify-center">
        <div className="w-px h-3 bg-[var(--border-default)]" />
      </div>
      <StepCard number={3} icon={Download} title="Export your theme">
        Download the .json file and import it in Power BI Desktop to apply your custom theme.
      </StepCard>
    </div>
  );
}

function TabTips() {
  return (
    <div className="flex flex-col gap-2.5">
      <TipCard icon={Info} title="Orange dot indicator">
        An orange dot on a visual card means you've customized properties for that visual. The number badge shows how many property cards were edited.
      </TipCard>
      <TipCard icon={Keyboard} title="Keyboard shortcuts">
        <span className="font-mono text-[10px] bg-[var(--bg-muted)] px-1 py-0.5 rounded">ESC</span> Close property drawer&nbsp;&nbsp;•&nbsp;&nbsp;
        <span className="font-mono text-[10px] bg-[var(--bg-muted)] px-1 py-0.5 rounded">Scroll</span> Zoom preview
      </TipCard>
      <TipCard icon={AlertTriangle} title="Preview limitations" variant="warning">
        Toggle properties (show/hide) may not reflect in the live preview for all visuals. This is a Power BI API limitation. The exported theme JSON is always correct.
      </TipCard>
    </div>
  );
}

function TabExport() {
  return (
    <div className="flex flex-col gap-2.5">
      <StepCard number={1} icon={Download} title="Export theme JSON">
        Click the Export button in the toolbar to download your theme as a .json file.
      </StepCard>
      <div className="flex justify-center">
        <div className="w-px h-3 bg-[var(--border-default)]" />
      </div>
      <StepCard number={2} icon={null} title="Open Power BI Desktop">
        Open the report where you want to apply the theme.
      </StepCard>
      <div className="flex justify-center">
        <div className="w-px h-3 bg-[var(--border-default)]" />
      </div>
      <StepCard number={3} icon={null} title="Import the theme">
        Go to <span className="font-semibold">View → Themes → Browse for themes</span> and select your downloaded .json file.
      </StepCard>
    </div>
  );
}

export default function HelpPanel() {
  const { helpPanelOpen, toggleHelpPanel } = useThemeStore();
  const [activeTab, setActiveTab] = useState('start');
  const panelRef = useRef(null);

  useEffect(() => {
    if (!helpPanelOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') toggleHelpPanel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [helpPanelOpen, toggleHelpPanel]);

  if (!helpPanelOpen) return null;

  const TabContent = { start: TabStart, tips: TabTips, export: TabExport }[activeTab];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 animate-fade-in"
        onClick={toggleHelpPanel}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-14 right-4 z-50 w-[380px] max-h-[75vh] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-2xl flex flex-col overflow-hidden animate-help-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <Info size={13} className="text-white" />
            </div>
            <span className="text-xs font-bold text-[var(--text-primary)]">Help & Info</span>
          </div>
          <button
            onClick={toggleHelpPanel}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
          >
            <X size={14} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2.5 border-b border-[var(--border-default)] shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-default)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <TabContent />
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[var(--border-default)] shrink-0">
          <p className="text-[10px] text-[var(--text-muted)] text-center">
            Power BI Theme Designer · M&M Software GmbH
          </p>
        </div>
      </div>
    </>
  );
}
