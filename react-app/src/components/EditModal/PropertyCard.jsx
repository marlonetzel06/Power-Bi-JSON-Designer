import { useState } from 'react';
import useThemeStore from '../../store/themeStore';
import { CARD_NAME_MAP } from '../../constants/visualNames';
import ColorControl from './controls/ColorControl';
import ToggleControl from './controls/ToggleControl';
import NumberControl from './controls/NumberControl';
import DropdownControl from './controls/DropdownControl';
import TextControl from './controls/TextControl';

const CONTROL_MAP = {
  color: ColorControl,
  toggle: ToggleControl,
  boolean: ToggleControl,
  number: NumberControl,
  dropdown: DropdownControl,
  enum: DropdownControl,
  text: TextControl,
  string: TextControl,
};

export default function PropertyCard({ visualKey, cardKey, cardDef }) {
  const [collapsed, setCollapsed] = useState(true);
  const { getCardData, rcv, isModified } = useThemeStore();
  const displayName = CARD_NAME_MAP[cardKey] || cardKey;
  // cardDef can be an array (from CARD_DEFS) or an object with { label, props }
  const props = Array.isArray(cardDef) ? cardDef : (cardDef.props || []);
  const cardData = getCardData(visualKey, cardKey) || {};
  const hasChanges = Object.keys(cardData).length > 0;

  return (
    <div className={`border rounded-lg overflow-hidden ${hasChanges ? 'border-[#1f8ac0] dark:border-[#89b4fa]' : 'border-[#e6edf5] dark:border-[#2d3555]'}`}>
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none bg-white hover:bg-[#f8fafd] dark:bg-[#24263e] dark:hover:bg-[#272950]"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#888]">{collapsed ? '▶' : '▼'}</span>
          <span className="text-[12px] font-semibold text-[#333] dark:text-[#c0caf5]">{displayName}</span>
          {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-[#1f8ac0] dark:bg-[#89b4fa]" />}
        </div>
      </div>
      {!collapsed && (
        <div className="bg-[#fafbfe] px-4 py-3 border-t border-[#e6edf5] dark:bg-[#1e2038] dark:border-[#2d3555]">
          <div className="flex flex-col gap-2">
            {props.map(prop => {
              const Control = CONTROL_MAP[prop.type] || TextControl;
              const value = rcv(visualKey, cardKey, prop.key);
              return (
                <Control
                  key={prop.key}
                  prop={prop}
                  value={value}
                  visualKey={visualKey}
                  cardKey={cardKey}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
