import useThemeStore from '../../store/themeStore';
import { MockVisual } from '../../preview/MockVisual';
import { useThemeStore as useNewThemeStore } from '../../store/theme';

/** LEGACY (replaced in Phase 4): grid card with a theme-driven mock preview. */
export default function VisualCard({ visualKey, label }) {
  const { setCurrentVisual, isModified, getModifiedCount } = useThemeStore();
  const modified = visualKey !== '*' && isModified(visualKey);
  const modCount = modified ? getModifiedCount(visualKey) : 0;
  const newTheme = useNewThemeStore((s) => s.theme);
  const mockKey = visualKey === '__page__' ? 'page' : visualKey;

  return (
    <button
      type="button"
      className="bg-[var(--bg-surface)] rounded-[var(--radius-md)] overflow-hidden shadow-sm cursor-pointer border-2 border-transparent transition-all duration-150 hover:border-[var(--color-accent)] hover:shadow-md flex flex-col relative text-left w-full"
      onClick={() => setCurrentVisual(visualKey)}
      aria-label={modified ? `${label}, ${modCount} geänderte Karten` : label}
    >
      <div className="bg-[var(--bg-elevated)] h-[236px] overflow-hidden relative p-3">
        <MockVisual theme={newTheme} visualKey={mockKey} />
        {modified && (
          <span className="absolute top-2 right-2 rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning-text)] text-[10px] font-semibold px-2 py-0.5">
            {modCount} geändert
          </span>
        )}
      </div>
      <div className="px-4 py-3">
        <div className="text-xs font-medium text-[var(--text-secondary)]">{label}</div>
      </div>
    </button>
  );
}
