import useThemeStore from '../../../store/themeStore';

export default function DropdownControl({ prop, value, visualKey, cardKey }) {
  const { setCardProp } = useThemeStore();
  const options = prop.options || [];
  const val = value ?? prop.default ?? '';

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-[#555] dark:text-[#a9b1d6]">
      <span className="flex-1 min-w-0 truncate">{prop.label || prop.key}</span>
      <select
        value={val}
        onChange={(e) => setCardProp(visualKey, cardKey, prop.key, e.target.value)}
        className="max-w-[160px] px-1.5 py-1 text-xs border border-[#ccd] rounded outline-none cursor-pointer dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
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
