import { useState, lazy, Suspense } from 'react';
import useThemeStore from '../../store/themeStore';
import { SEMANTIC_KEYS, TEXT_CLASSES } from '../../constants/themeDefaults';
import { FONTS } from '../../constants/enums';
const PalettePopover = lazy(() => import('../PaletteGenerator/PalettePopover'));
import HexColorInput from '../HexColorInput';
import ResizeHandle from '../ui/ResizeHandle';
import { Settings2, ChevronRight, Plus, Minus } from 'lucide-react';

const SEMANTIC_LABEL_MAP = {
  background: 'Background',
  foreground: 'Foreground',
  tableAccent: 'Accent',
  good: 'Good',
  neutral: 'Neutral',
  bad: 'Bad',
  maximum: 'Maximum',
  center: 'Center',
  minimum: 'Minimum',
  null: 'Null',
  firstLevelElements: 'Primary',
  secondLevelElements: 'Secondary',
  thirdLevelElements: 'Tertiary',
  fourthLevelElements: 'Quaternary',
  secondaryBackground: 'Secondary BG',
};

const SEMANTIC_GROUPS = [
  { label: 'Theme', keys: ['background', 'foreground', 'tableAccent'] },
  { label: 'Sentiment', keys: ['good', 'neutral', 'bad'] },
  { label: 'Scale', keys: ['maximum', 'center', 'minimum', 'null'] },
  { label: 'Hierarchy', keys: ['firstLevelElements', 'secondLevelElements', 'thirdLevelElements', 'fourthLevelElements', 'secondaryBackground'] },
];

function SidebarSection({ title, defaultOpen = true, children, trailing }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-1.5 cursor-pointer group"
      >
        <div className="flex items-center gap-1.5">
          <ChevronRight size={12} className={`text-[var(--text-muted)] transition-transform duration-150 ${open ? 'rotate-90' : ''}`} />
          <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--color-primary)] transition-colors">{title}</h3>
        </div>
        {trailing && <div onClick={e => e.stopPropagation()}>{trailing}</div>}
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="pt-2 pb-1">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function Sidebar() {
  const { theme, setSemanticColor, setDataColor, addDataColor, removeDataColor, setTextClass, setCurrentVisual } = useThemeStore();
  const [sidebarWidth, setSidebarWidth] = useState(280);

  return (
    <>
      <aside style={{ width: sidebarWidth }} className="flex-shrink-0 bg-[var(--bg-surface)] border-r border-[var(--border-default)] overflow-y-auto flex flex-col gap-1 p-4">

      {/* Semantic Colors – each group is a collapsible section */}
      {SEMANTIC_GROUPS.map(group => (
        <SidebarSection key={group.label} title={group.label}>
          <div className="grid grid-cols-4 gap-2">
            {group.keys.map(key => (
              <div key={key} className="flex flex-col items-center gap-1">
                <HexColorInput
                  value={theme[key] || '#888888'}
                  onChange={(hex) => setSemanticColor(key, hex)}
                  swatchClassName="w-12 h-12 border-[1.5px] border-[var(--border-subtle)] rounded-[var(--radius-sm)] cursor-pointer hover:scale-110 transition-transform"
                />
                <span className="text-[9px] text-[var(--text-muted)] text-center leading-tight">{SEMANTIC_LABEL_MAP[key] || key}</span>
              </div>
            ))}
          </div>
        </SidebarSection>
      ))}

      <hr className="border-[var(--border-default)] my-1" />

      {/* Data Colors */}
      <SidebarSection title="Data Colors" trailing={<Suspense fallback={null}><PalettePopover /></Suspense>}>
        <div className="flex gap-[6px] flex-wrap">
          {theme.dataColors.map((col, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <HexColorInput
                value={col}
                onChange={(hex) => setDataColor(i, hex)}
                swatchClassName="w-8 h-8 border-[1.5px] border-[var(--border-subtle)] rounded-[var(--radius-sm)] cursor-pointer hover:scale-110 transition-transform"
              />
              <span className="text-[9px] text-[var(--text-muted)]">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => addDataColor('#888888')}
            className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
          >
            <Plus size={10} /> Add
          </button>
          {theme.dataColors.length > 1 && (
            <button
              onClick={() => removeDataColor(theme.dataColors.length - 1)}
              className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
            >
              <Minus size={10} /> Remove
            </button>
          )}
        </div>
      </SidebarSection>

      <hr className="border-[var(--border-default)] my-1" />

      {/* Typography */}
      <SidebarSection title="Typography" defaultOpen={false}>
        <div className="flex flex-col gap-[6px]">
          {TEXT_CLASSES.map(cls => {
            const tc = theme.textClasses?.[cls] || {};
            return (
              <div key={cls} className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-2 py-1.5">
                <span className="text-[10px] font-semibold text-[var(--text-primary)] capitalize w-14">{cls}</span>
                <div className="flex items-center gap-1">
                  <select
                    value={tc.fontFace || 'Segoe UI'}
                    onChange={(e) => setTextClass(cls, 'fontFace', e.target.value)}
                    className="text-[9px] px-1 py-0.5 border border-[var(--border-subtle)] rounded-[var(--radius-sm)] bg-[var(--bg-surface)] text-[var(--text-default)] w-[72px]"
                  >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <input
                    type="number"
                    value={tc.fontSize || 12}
                    onChange={(e) => setTextClass(cls, 'fontSize', Number(e.target.value))}
                    className="text-[9px] px-1 py-0.5 border border-[var(--border-subtle)] rounded-[var(--radius-sm)] w-8 text-right bg-[var(--bg-surface)] text-[var(--text-default)]"
                  />
                  <HexColorInput
                    value={tc.fontColor || '#000000'}
                    onChange={(hex) => setTextClass(cls, 'fontColor', hex)}
                    swatchClassName="w-4 h-4 border border-[var(--border-subtle)] rounded-[2px] cursor-pointer"
                  />
                  <label className="text-[9px] text-[var(--text-secondary)] flex items-center gap-0.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!tc.fontBold}
                      onChange={(e) => setTextClass(cls, 'fontBold', e.target.checked)}
                      className="w-3 h-3"
                    />
                    B
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </SidebarSection>

      <hr className="border-[var(--border-default)] my-1" />

      {/* Page Settings — opens modal with specific section */}
      <SidebarSection title="Page Settings" defaultOpen={true}>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setCurrentVisual('__page__')}
            className="w-full flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[11px] text-[var(--text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Settings2 size={12} />
              Canvas, Background, Wallpaper
            </span>
            <span className="text-[var(--text-muted)]">→</span>
          </button>
        </div>
      </SidebarSection>
    </aside>
    <ResizeHandle side="right" width={sidebarWidth} onResize={setSidebarWidth} min={220} max={480} />
    </>
  );
}
