import { useRef, useState, useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import { VISUAL_CATEGORIES } from '../../constants/visualNames';
import { VISUAL_PAGE_MAP } from '../../constants/visualPageMap';
import PbiReportEmbed from '../PbiEmbed/PbiReportEmbed';

const CATEGORY_ICONS = {
  'Bar Charts': '📊',
  'Column Charts': '📊',
  'Line & Area': '📈',
  'Combo Charts': '📈',
  'Other Cartesian': '📊',
  'Pie / Donut / Tree': '🍩',
  'Maps': '🗺️',
  'Cards & KPI': '🔢',
  'Tables': '📋',
  'Slicers': '🎚️',
  'AI / Analytics': '🧠',
  'Navigation & Buttons': '🔘',
  'Static Elements': '✏️',
};

function getVisualIcon(visualKey) {
  if (visualKey === '*') return '⚙️';
  if (visualKey === '__page__') return '📄';
  for (const [category, keys] of Object.entries(VISUAL_CATEGORIES)) {
    if (keys.includes(visualKey)) return CATEGORY_ICONS[category] || '📊';
  }
  return '📊';
}

function CardPreview({ visualKey, embedConfig }) {
  const pageName = VISUAL_PAGE_MAP[visualKey];

  if (!pageName || !embedConfig) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-1">{getVisualIcon(visualKey)}</div>
        <div className="text-[#1f8ac0] text-[10px] mt-1 dark:text-[#89b4fa]">Click to configure</div>
      </div>
    );
  }

  // Use base config without pageName — navigation happens via targetPage prop
  const cardConfig = {
    ...embedConfig,
    settings: {
      ...embedConfig.settings,
      panes: { filters: { visible: false }, pageNavigation: { visible: false } },
      navContentPaneEnabled: false,
      background: 1,
    },
  };

  return (
    <PbiReportEmbed
      embedConfig={cardConfig}
      targetPage={pageName}
      className="w-full h-full pointer-events-none"
    />
  );
}

export default function VisualCard({ visualKey, label, embedConfig }) {
  const { setCurrentVisual, isModified, getModifiedCount } = useThemeStore();
  const modified = visualKey !== '*' && isModified(visualKey);
  const modCount = modified ? getModifiedCount(visualKey) : 0;

  // Lazy loading: only render embed when card is visible
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const hasPageMap = !!VISUAL_PAGE_MAP[visualKey];
  const showEmbed = hasPageMap && isVisible && !!embedConfig;

  useEffect(() => {
    if (!hasPageMap) return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasPageMap]);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-[10px] overflow-hidden shadow-sm cursor-pointer border-2 border-transparent transition-all hover:border-[#1f8ac0] hover:shadow-md flex flex-col dark:bg-[#24263e] dark:shadow-[0_1px_4px_rgba(0,0,0,.4)] dark:hover:border-[#89b4fa] relative"
      onClick={() => setCurrentVisual(visualKey)}
    >
      <div className="bg-[#f8fafd] flex items-center justify-center h-[175px] overflow-hidden relative dark:bg-[#1e2038]">
        {showEmbed ? (
          <CardPreview visualKey={visualKey} embedConfig={embedConfig} />
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-1">{getVisualIcon(visualKey)}</div>
            <div className="text-[#1f8ac0] text-[10px] mt-1 dark:text-[#89b4fa]">Click to configure</div>
          </div>
        )}
        {/* Clickable overlay — ensures click always works even over iframe */}
        <div className="absolute inset-0 z-10" />
        {modified && (
          <div
            className="absolute top-1.5 right-1.5 w-[9px] h-[9px] rounded-full bg-[#1f8ac0] border-[1.5px] border-white z-20"
            title={`${modCount} card(s) customized`}
          />
        )}
      </div>
      <div className="px-3.5 py-2.5">
        <div className="text-xs font-medium text-[#555] dark:text-[#a9b1d6]">{label}</div>
      </div>
    </div>
  );
}
