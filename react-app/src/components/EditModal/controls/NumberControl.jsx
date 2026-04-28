import useThemeStore from '../../../store/themeStore';
import { VALIDATION } from '../../../constants/enums';

export default function NumberControl({ prop, value, visualKey, cardKey }) {
  const { setCardProp } = useThemeStore();
  const v = VALIDATION[prop.key] || {};
  const num = value ?? prop.def ?? prop.default ?? v.min ?? 0;

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-[#555] dark:text-[#a9b1d6]">
      <span className="flex-1 min-w-0 truncate">{prop.label || prop.key}</span>
      <input
        type="number"
        value={num}
        min={v.min}
        max={v.max}
        step={v.step || 1}
        onChange={(e) => {
          let n = Number(e.target.value);
          if (v.min != null && n < v.min) n = v.min;
          if (v.max != null && n > v.max) n = v.max;
          setCardProp(visualKey, cardKey, prop.key, n);
        }}
        className="w-[70px] px-1.5 py-1 text-xs text-right border border-[#ccd] rounded outline-none focus:border-[#1f8ac0] dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
      />
    </label>
  );
}
