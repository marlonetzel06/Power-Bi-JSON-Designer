import useThemeStore from '../../../store/themeStore';
import HexColorInput from '../../HexColorInput';

export default function ColorControl({ prop, value, visualKey, cardKey }) {
  const { setCardProp } = useThemeStore();
  const color = (value || prop.def || prop.default || '#888888').toString();

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
      <span className="flex-1 min-w-0 truncate">{prop.label || prop.key}</span>
      <HexColorInput
        value={color}
        onChange={(hex) => setCardProp(visualKey, cardKey, prop.key, hex)}
      />
    </label>
  );
}
