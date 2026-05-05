import useThemeStore from '../../../store/themeStore';

export default function TextControl({ prop, value, visualKey, cardKey }) {
  const { setCardProp } = useThemeStore();
  const val = value ?? prop.def ?? prop.default ?? '';

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
      <span className="flex-1 min-w-0 truncate">{prop.label || prop.key}</span>
      <input
        type="text"
        value={val}
        onChange={(e) => setCardProp(visualKey, cardKey, prop.key, e.target.value)}
        className="max-w-[160px] px-1.5 py-1 text-xs border border-[var(--border-subtle)] rounded-[var(--radius-sm)] outline-none focus:border-[var(--color-primary)] bg-[var(--bg-surface)] text-[var(--text-default)]"
      />
    </label>
  );
}
