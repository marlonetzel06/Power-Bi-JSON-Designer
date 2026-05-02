import useThemeStore from '../../../store/themeStore';

export default function ToggleControl({ prop, value, visualKey, cardKey }) {
  const { setCardProp } = useThemeStore();
  const checked = value === true || value === 'true';

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
      <span className="flex-1 min-w-0 truncate">{prop.label || prop.key}</span>
      <div
        className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-subtle)]'}`}
        onClick={() => setCardProp(visualKey, cardKey, prop.key, !checked)}
      >
        <div className={`w-[15px] h-[15px] rounded-full bg-white absolute top-[2.5px] transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-[2.5px]'}`} />
      </div>
    </label>
  );
}
