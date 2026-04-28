import useThemeStore from '../../store/themeStore';

export default function VisualCard({ visualKey, label }) {
  const { setCurrentVisual, isModified, getModifiedCount } = useThemeStore();
  const modified = visualKey !== '*' && isModified(visualKey);
  const modCount = modified ? getModifiedCount(visualKey) : 0;

  return (
    <div
      className="bg-white rounded-[10px] overflow-hidden shadow-sm cursor-pointer border-2 border-transparent transition-all hover:border-[#1f8ac0] hover:shadow-md flex flex-col dark:bg-[#24263e] dark:shadow-[0_1px_4px_rgba(0,0,0,.4)] dark:hover:border-[#89b4fa]"
      onClick={() => setCurrentVisual(visualKey)}
    >
      <div className="bg-[#f8fafd] flex items-center justify-center h-[175px] overflow-hidden relative dark:bg-[#1e2038]">
        {/* Placeholder — will be replaced by PBI Embed in Phase 4 */}
        <div className="text-center">
          <div className="text-[#aaa] text-sm dark:text-[#505373]">{label}</div>
          <div className="text-[#1f8ac0] text-[10px] mt-1 dark:text-[#89b4fa]">Click to configure</div>
        </div>
        {modified && (
          <div
            className="absolute top-1.5 right-1.5 w-[9px] h-[9px] rounded-full bg-[#1f8ac0] border-[1.5px] border-white"
            title={`${modCount} card(s) customized`}
          />
        )}
      </div>
      <div className="px-3.5 py-2.5">
        <div className="text-xs font-medium text-[#555] dark:text-[#a9b1d6]">{label}</div>
        <div className="text-[10px] text-[#bbb] font-mono mt-0.5">{visualKey}</div>
      </div>
    </div>
  );
}
