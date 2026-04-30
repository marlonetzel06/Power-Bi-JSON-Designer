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
  const modifiedCount = Object.keys(cardData).length;
  const hasChanges = modifiedCount > 0;

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${hasChanges ? 'border-[#1f8ac0] dark:border-[#89b4fa]' : 'border-[#e6edf5] dark:border-[#2d3555]'}`}>
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none bg-white hover:bg-[#f0f4fa] dark:bg-[#24263e] dark:hover:bg-[#2a2d4a] transition-colors duration-150"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-3 h-3 text-[#0f4c81] dark:text-[#89b4fa] transition-transform duration-200 ${collapsed ? 'rotate-0' : 'rotate-90'}`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M6 4l4 4-4 4z" />
          </svg>
          <span className="text-[12px] font-semibold text-[#333] dark:text-[#c0caf5]">{displayName}</span>
          {hasChanges && (
            <span className="text-[10px] font-medium text-[#1f8ac0] dark:text-[#89b4fa] bg-[#e8f2fa] dark:bg-[#1f8ac0]/15 rounded-full px-1.5 py-0 leading-[18px]">
              {modifiedCount}
            </span>
          )}
        </div>
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}
      >
        <div className="overflow-hidden">
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
        </div>
      </div>
    </div>
  );
}
