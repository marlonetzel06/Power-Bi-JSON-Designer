import useThemeStore from '../../../store/themeStore';

export default function ColorControl({ prop, value, visualKey, cardKey }) {
  const { setCardProp } = useThemeStore();
  const color = (value || prop.default || '#888888').toString().toLowerCase();

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-[#555] dark:text-[#a9b1d6]">
      <span className="flex-1 min-w-0 truncate">{prop.label || prop.key}</span>
      <input
        type="color"
        value={color}
        onChange={(e) => setCardProp(visualKey, cardKey, prop.key, e.target.value.toUpperCase())}
        className="w-8 h-8 border-[1.5px] border-[#c8d8e8] rounded cursor-pointer shrink-0 dark:border-[#373963]"
      />
    </label>
  );
}
