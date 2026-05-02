import useThemeStore from '../../../store/themeStore';

export default function DropdownControl({ prop, value, visualKey, cardKey }) {
  const { setCardProp } = useThemeStore();
  const options = prop.options || [];
  const val = value ?? prop.def ?? prop.default ?? '';

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
      <span className="flex-1 min-w-0 truncate">{prop.label || prop.key}</span>
      <select
        value={val}
        onChange={(e) => setCardProp(visualKey, cardKey, prop.key, e.target.value)}
        className="max-w-[160px] px-1.5 py-1 text-xs border border-[var(--border-subtle)] rounded-[var(--radius-sm)] outline-none cursor-pointer bg-[var(--bg-surface)] text-[var(--text-default)]"
      >
        {options.map(opt => {
          const label = typeof opt === 'object' ? opt.label : opt;
          const v = typeof opt === 'object' ? opt.value : opt;
          return <option key={v} value={v}>{label}</option>;
        })}
      </select>
    </label>
  );
}
