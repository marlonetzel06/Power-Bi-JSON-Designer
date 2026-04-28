import useThemeStore from '../../../store/themeStore';

export default function TextControl({ prop, value, visualKey, cardKey }) {
  const { setCardProp } = useThemeStore();
  const val = value ?? prop.def ?? prop.default ?? '';

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-[#555] dark:text-[#a9b1d6]">
      <span className="flex-1 min-w-0 truncate">{prop.label || prop.key}</span>
      <input
        type="text"
        value={val}
        onChange={(e) => setCardProp(visualKey, cardKey, prop.key, e.target.value)}
        className="max-w-[160px] px-1.5 py-1 text-xs border border-[#ccd] rounded outline-none focus:border-[#1f8ac0] dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
      />
    </label>
  );
}
