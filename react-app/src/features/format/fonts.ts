/** Fonts offered in the font family select (Power BI Desktop list + M&M fonts). */
export const PBI_FONTS: readonly string[] = [
  'Segoe UI', 'Segoe UI Light', 'Segoe UI Semibold', 'Segoe UI Bold', 'Segoe (Bold)',
  'DIN', 'Arial', 'Arial Black', 'Arial Unicode MS', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel',
  'Courier New', 'Georgia', 'Lucida Sans Unicode', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Wingdings',
  'IBM Plex Sans', 'IBM Plex Mono', 'Titillium Web',
];

export function fontOptions(current?: string): { value: string; label: string }[] {
  const list = current && !PBI_FONTS.includes(current) ? [current, ...PBI_FONTS] : [...PBI_FONTS];
  return list.map((f) => ({ value: f, label: f }));
}
