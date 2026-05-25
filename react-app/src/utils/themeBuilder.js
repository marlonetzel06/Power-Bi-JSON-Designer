export function buildExportTheme(theme, pageSettings) {
  const t = JSON.parse(JSON.stringify(theme));
  const SLICER_VISUALS = ['slicer', 'advancedSlicerVisual', 'listSlicer'];
  for (const vk of Object.keys(t.visualStyles)) {
    const star = t.visualStyles[vk]?.['*'];
    if (!star) continue;
    if (vk === 'shape' && star.shapeOutline !== undefined) {
      star.outline = star.shapeOutline;
      delete star.shapeOutline;
    }
    if (SLICER_VISUALS.includes(vk)) {
      if (star.slicerHeader !== undefined) { star.header = star.slicerHeader; delete star.slicerHeader; }
      if (star.slicerItems !== undefined) { star.items = star.slicerItems; delete star.slicerItems; }
    }
    if (star.subheader !== undefined) { star.subTitle = star.subheader; delete star.subheader; }
  }
  if (pageSettings && Object.keys(pageSettings).length > 0) {
    if (!t.visualStyles.__page__) t.visualStyles.__page__ = { '*': {} };
    Object.entries(pageSettings).forEach(([card, data]) => {
      t.visualStyles.__page__['*'][card] = [data];
    });
  }
  // Clean textClasses for PBI schema: strip fontBold, rename fontColor→color
  if (t.textClasses) {
    for (const cls of Object.keys(t.textClasses)) {
      const { fontBold, fontColor, ...rest } = t.textClasses[cls];
      t.textClasses[cls] = fontColor ? { ...rest, color: fontColor } : rest;
    }
  }
  return t;
}

export function buildDeltaTheme(theme, initial) {
  const delta = {};
  const simple = [
    'name', 'background', 'foreground', 'tableAccent',
    'good', 'neutral', 'bad', 'maximum', 'center', 'minimum', 'null',
    'firstLevelElements', 'secondLevelElements', 'thirdLevelElements', 'fourthLevelElements', 'secondaryBackground',
  ];
  simple.forEach(k => {
    if (theme[k] !== initial[k]) delta[k] = theme[k];
  });
  if (JSON.stringify(theme.dataColors) !== JSON.stringify(initial.dataColors)) {
    delta.dataColors = theme.dataColors;
  }
  if (JSON.stringify(theme.textClasses) !== JSON.stringify(initial.textClasses)) {
    // Clean for PBI schema: strip fontBold, rename fontColor→color
    const cleaned = {};
    for (const [cls, props] of Object.entries(theme.textClasses)) {
      const { fontBold, fontColor, ...rest } = props;
      cleaned[cls] = fontColor ? { ...rest, color: fontColor } : rest;
    }
    delta.textClasses = cleaned;
  }
  // visualStyles delta
  const vs = theme.visualStyles || {};
  const ivs = initial.visualStyles || {};
  const deltaVs = {};
  const SLICER_VISUALS = ['slicer', 'advancedSlicerVisual', 'listSlicer'];
  for (const [vk, vv] of Object.entries(vs)) {
    const star = vv['*'] || {};
    const iStar = ivs[vk]?.['*'] || {};
    const deltaCards = {};
    for (const [card, arr] of Object.entries(star)) {
      if (JSON.stringify(arr) !== JSON.stringify(iStar[card])) {
        // Rename internal card names to PBI schema names
        const exportKey = card === 'subheader' ? 'subTitle'
          : card === 'shapeOutline' && vk === 'shape' ? 'outline'
          : card === 'slicerHeader' && SLICER_VISUALS.includes(vk) ? 'header'
          : card === 'slicerItems' && SLICER_VISUALS.includes(vk) ? 'items'
          : card;
        deltaCards[exportKey] = arr;
      }
    }
    if (Object.keys(deltaCards).length > 0) {
      deltaVs[vk] = { '*': deltaCards };
    }
  }
  if (Object.keys(deltaVs).length > 0) delta.visualStyles = deltaVs;
  return delta;
}

export function syntaxHL(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[0-9a-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (m) => {
        let cls = 'json-num';
        if (/^"/.test(m)) cls = /:$/.test(m) ? 'json-key' : 'json-str';
        else if (/true|false/.test(m)) cls = 'json-bool';
        else if (/null/.test(m)) cls = 'json-null';
        return `<span class="${cls}">${m}</span>`;
      }
    );
}
