const _PBIP_HEX = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const _PBIP_SKIP_OBJ = new Set(['stylePreset']);
const _PBIP_SLICER = new Set(['advancedSlicerVisual', 'slicerVisual', 'listSlicer', 'actionButton']);
const _PBIP_VALID_SEL = new Set(['default', 'interaction:hover', 'selection:selected', 'interaction:hoverSelected', 'selection:unselected']);
const _PBIP_BAD_PROP = new Set(['paragraphs', 'text', 'name', 'imageUrl', 'imageType']);
const _PBIP_FONT_MAP = {
  fontFamily: 'fontFace', fontSize: 'fontSize', fontColor: 'color', color: 'color',
  bold: 'bold', italic: 'italic', underline: 'underline',
  fontBold: 'bold', fontItalic: 'italic', fontUnderline: 'underline',
};

function pbipVal(v) {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'object') return v;
  if (Array.isArray(v)) { const a = v.map(pbipVal).filter(x => x !== null); return a.length ? a : null; }
  if ('expr' in v) return pbipExpr(v.expr);
  if (v.solid?.color) return v.solid.color;
  const out = {};
  for (const [k, x] of Object.entries(v)) { const r = pbipVal(x); if (r !== null && r !== undefined) out[k] = r; }
  return Object.keys(out).length ? out : null;
}

function pbipExpr(e) {
  if (!e || typeof e !== 'object') return null;
  if ('Measure' in e || 'ResourcePackageItem' in e) return null;
  if ('Literal' in e) return pbipLit(e.Literal);
  if ('ThemeDataColor' in e) return { expr: e };
  return null;
}

function pbipLit(l) {
  if (!l || !('Value' in l)) return null;
  const v = l.Value;
  return typeof v === 'string' ? pbipStr(v) : v;
}

function pbipStr(v) {
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) v = v.slice(1, -1);
  const lo = v.toLowerCase();
  if (lo === 'true') return true;
  if (lo === 'false') return false;
  if (['0', '1', '2', '3'].includes(v)) return parseInt(v);
  const n = Number(v);
  return (!isNaN(n) && v !== '') ? n : v;
}

function pbipFont(fontFamily) {
  if (typeof fontFamily !== 'string') return 'Segoe UI';
  for (const p of fontFamily.replace(/\\"/g, '"').replace(/^['"]|['"]$/g, '').split(',')) {
    const c = p.trim().replace(/^['"]|['"]$/g, '');
    if (c && !c.startsWith('wf_')) return c;
  }
  return 'Segoe UI';
}

function pbipProps(properties) {
  const out = {};
  for (const [k, v] of Object.entries(properties)) {
    if (_PBIP_BAD_PROP.has(k) || typeof k !== 'string' || k.startsWith('dynamic')) continue;
    let val = pbipVal(v);
    if (val === null || val === undefined) continue;
    if (k === 'fontFamily') val = pbipFont(val);
    out[_PBIP_FONT_MAP[k] ? _PBIP_FONT_MAP[k] : k] = val;
  }
  return Object.keys(out).length ? out : null;
}

function pbipColors(obj, freq) {
  if (!obj || typeof obj !== 'object') return;
  for (const val of Object.values(obj)) {
    if (typeof val === 'string' && _PBIP_HEX.test(val)) { freq[val] = (freq[val] || 0) + 1; }
    else if (val && typeof val === 'object') {
      if (val.solid?.color && _PBIP_HEX.test(val.solid.color)) { freq[val.solid.color] = (freq[val.solid.color] || 0) + 1; }
      const lit = val?.expr?.Literal?.Value;
      if (typeof lit === 'string') { const m = lit.match(/'(#[0-9a-fA-F]{6,8})'/); if (m) freq[m[1]] = (freq[m[1]] || 0) + 1; }
      pbipColors(val, freq);
    }
  }
}

export async function extractThemeFromVisuals(visualFiles) {
  const freq = {}, visualStyles = {};
  for (const file of visualFiles) {
    let vd;
    try { vd = JSON.parse(await file.text()); } catch { continue; }
    pbipColors(vd, freq);
    const vType = vd?.visual?.visualType;
    const objects = vd?.visual?.objects || {};
    if (!vType || !Object.keys(objects).length) continue;
    const isSlicer = _PBIP_SLICER.has(vType);
    if (!visualStyles[vType]) visualStyles[vType] = { '*': {} };
    for (const [card, items] of Object.entries(objects)) {
      if (_PBIP_SKIP_OBJ.has(card)) continue;
      if (!Array.isArray(items)) continue;
      const resolved = [];
      for (const item of items) {
        if (!item?.properties) continue;
        const selId = item.selector?.id || null;
        if (selId && selId !== 'default' && !_PBIP_VALID_SEL.has(selId)) continue;
        const props = pbipProps(item.properties);
        if (!props) continue;
        if (isSlicer && selId && selId !== 'default') resolved.push({ $id: selId, ...props });
        else resolved.push(props);
      }
      if (!resolved.length) continue;
      const existing = visualStyles[vType]['*'][card];
      if (!existing) { visualStyles[vType]['*'][card] = resolved; }
      else { for (const r of resolved) { if (!existing.some(e => JSON.stringify(e) === JSON.stringify(r))) existing.push(r); } }
    }
  }
  const dataColors = Object.entries(freq)
    .filter(([c]) => !['#FFFFFF', '#ffffff', '#000000', '#000'].includes(c))
    .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c]) => c);
  return { dataColors, visualStyles };
}
