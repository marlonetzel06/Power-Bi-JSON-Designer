#!/usr/bin/env python3
"""
fix_schema.py — apply all verified PBI theme JSON schema corrections to theme_editor.html
"""
import re, json, sys

SRC = 'theme_editor.html'

with open(SRC, 'r', encoding='utf-8') as f:
    html = f.read()

original = html  # keep for diff check at end

# ═══════════════════════════════════════════════════════════════════════════════
# 1.  CARD_DEFS — property key fixes
# ═══════════════════════════════════════════════════════════════════════════════

# 1a. columnHeaders: background → backColor
html = html.replace(
    "    { key:'background',  type:'color',  label:'Background',   def:'#0F4C81' },\n"
    "    { key:'outline',     type:'enum',   label:'Outline',      def:'None'",
    "    { key:'backColor',   type:'color',  label:'Background',   def:'#0F4C81' },\n"
    "    { key:'outline',     type:'enum',   label:'Outline',      def:'None'"
)

# 1b. rowHeaders: background → backColor
html = html.replace(
    "    { key:'background',               type:'color',  label:'Background',           def:'#FFFFFF' },\n"
    "    { key:'outline',                  type:'enum',   label:'Outline',              def:'None'",
    "    { key:'backColor',               type:'color',  label:'Background',           def:'#FFFFFF' },\n"
    "    { key:'outline',                  type:'enum',   label:'Outline',              def:'None'"
)

# 1c. values: background → backColor AND bandedRowColor → backColorSecondary
html = html.replace(
    "    { key:'background',     type:'color',  label:'Background',     def:'#FFFFFF' },\n"
    "    { key:'bandedRowColor', type:'color',  label:'Banded Row Color',def:'#F0F6FB' },",
    "    { key:'backColor',      type:'color',  label:'Background',     def:'#FFFFFF' },\n"
    "    { key:'backColorSecondary', type:'color',  label:'Banded Row Color',def:'#F0F6FB' },"
)

# 1d. total: background → backColor
html = html.replace(
    "    { key:'background', type:'color',   label:'Background',   def:'#E8F0F7' },\n"
    "    { key:'outline',    type:'enum',    label:'Outline',      def:'Top'",
    "    { key:'backColor',  type:'color',   label:'Background',   def:'#E8F0F7' },\n"
    "    { key:'outline',    type:'enum',    label:'Outline',      def:'Top'"
)

# 1e. subtotals: rename card key → subTotals, background → backColor
html = html.replace(
    "  subtotals: [\n"
    "    { key:'rowSubtotals',    type:'boolean', label:'Row Subtotals',    def:true },\n"
    "    { key:'columnSubtotals', type:'boolean', label:'Column Subtotals', def:true },\n"
    "    { key:'fontFamily',      type:'enum',    label:'Font Family',      def:'Segoe UI Semibold', options:FONTS },\n"
    "    { key:'fontSize',        type:'number',  label:'Font Size',        def:11, min:6, max:40 },\n"
    "    { key:'fontColor',       type:'color',   label:'Font Color',       def:'#0F4C81' },\n"
    "    { key:'bold',            type:'boolean', label:'Bold',             def:true },\n"
    "    { key:'background',      type:'color',   label:'Background',       def:'#E8F0F7' },",
    "  subTotals: [\n"
    "    { key:'rowSubtotals',    type:'boolean', label:'Row Subtotals',    def:true },\n"
    "    { key:'columnSubtotals', type:'boolean', label:'Column Subtotals', def:true },\n"
    "    { key:'fontFamily',      type:'enum',    label:'Font Family',      def:'Segoe UI Semibold', options:FONTS },\n"
    "    { key:'fontSize',        type:'number',  label:'Font Size',        def:11, min:6, max:40 },\n"
    "    { key:'fontColor',       type:'color',   label:'Font Color',       def:'#0F4C81' },\n"
    "    { key:'bold',            type:'boolean', label:'Bold',             def:true },\n"
    "    { key:'backColor',       type:'color',   label:'Background',       def:'#E8F0F7' },"
)

# 1f. text card (actionButton): fontBold → bold
html = html.replace(
    "    { key:'fontBold',          type:'boolean', label:'Bold',               def:false },",
    "    { key:'bold',              type:'boolean', label:'Bold',               def:false },"
)

# 1g. line card → shapeOutline (rename + fix properties)
html = html.replace(
    "  line: [\n"
    "    { key:'show',        type:'boolean', label:'Show Line',     def:false },\n"
    "    { key:'strokeColor', type:'color',   label:'Line Color',    def:'#0F4C81' },\n"
    "    { key:'strokeWidth', type:'number',  label:'Line Width',    def:1, min:1, max:10 },\n"
    "  ],",
    "  shapeOutline: [\n"
    "    { key:'show',         type:'boolean', label:'Show Outline',   def:false },\n"
    "    { key:'lineColor',    type:'color',   label:'Outline Color',  def:'#0F4C81' },\n"
    "    { key:'weight',       type:'number',  label:'Outline Weight', def:1, min:1, max:10 },\n"
    "    { key:'transparency', type:'number',  label:'Transparency',   def:0, min:0, max:100 },\n"
    "  ],"
)

# 1h. Add slicerHeader and slicerItems after existing slicer-related cards
# Insert after searchBox card definition
html = html.replace(
    "  searchBox: [\n"
    "    { key:'show', type:'boolean', label:'Show Search', def:false },\n"
    "    { key:'color', type:'color', label:'Text Color', def:'#333333' },\n"
    "    { key:'background', type:'color', label:'Background', def:'#FFFFFF' },\n"
    "    { key:'border', type:'color', label:'Border Color', def:'#E0E0E0' },\n"
    "  ],",
    "  searchBox: [\n"
    "    { key:'show', type:'boolean', label:'Show Search', def:false },\n"
    "    { key:'color', type:'color', label:'Text Color', def:'#333333' },\n"
    "    { key:'background', type:'color', label:'Background', def:'#FFFFFF' },\n"
    "    { key:'border', type:'color', label:'Border Color', def:'#E0E0E0' },\n"
    "  ],\n"
    "  slicerHeader: [\n"
    "    { key:'show',       type:'boolean', label:'Show Header',  def:true },\n"
    "    { key:'fontFamily', type:'enum',    label:'Font Family',  def:'Segoe UI Semibold', options:FONTS },\n"
    "    { key:'textSize',   type:'number',  label:'Font Size',    def:12, min:6, max:40 },\n"
    "    { key:'fontColor',  type:'color',   label:'Font Color',   def:'#0F4C81' },\n"
    "    { key:'bold',       type:'boolean', label:'Bold',         def:true },\n"
    "    { key:'italic',     type:'boolean', label:'Italic',       def:false },\n"
    "    { key:'underline',  type:'boolean', label:'Underline',    def:false },\n"
    "    { key:'background', type:'color',   label:'Background',   def:'#FFFFFF' },\n"
    "    { key:'outline',    type:'enum',    label:'Outline',      def:'None', options:['None','Frame','Top','Bottom','Left','Right','TopBottom'] },\n"
    "  ],\n"
    "  slicerItems: [\n"
    "    { key:'fontFamily', type:'enum',    label:'Font Family',  def:'Segoe UI', options:FONTS },\n"
    "    { key:'textSize',   type:'number',  label:'Font Size',    def:11, min:6, max:40 },\n"
    "    { key:'fontColor',  type:'color',   label:'Font Color',   def:'#333333' },\n"
    "    { key:'bold',       type:'boolean', label:'Bold',         def:false },\n"
    "    { key:'italic',     type:'boolean', label:'Italic',       def:false },\n"
    "    { key:'background', type:'color',   label:'Background',   def:'#FFFFFF' },\n"
    "    { key:'outline',    type:'enum',    label:'Outline Style',def:'Frame', options:['None','Frame','Top','Bottom','Left','Right','TopBottom'] },\n"
    "    { key:'padding',    type:'number',  label:'Padding',      def:3, min:0, max:20 },\n"
    "  ],"
)

# ═══════════════════════════════════════════════════════════════════════════════
# 2.  VISUAL_SCHEMA — card key fixes
# ═══════════════════════════════════════════════════════════════════════════════

# 2a. matrix: subtotals → subTotals
html = html.replace(
    "  matrix:                         ['general','title','grid','rowHeaders','columnHeaders','values','subtotals','sparklines','columnFormatting','accessibility','background','border'],",
    "  matrix:                         ['general','title','grid','rowHeaders','columnHeaders','values','subTotals','sparklines','columnFormatting','accessibility','background','border'],"
)
# 2b. pivotTable: subtotals → subTotals
html = html.replace(
    "  pivotTable:                     ['general','title','grid','rowHeaders','columnHeaders','values','subtotals','sparklines','accessibility','background','border'],",
    "  pivotTable:                     ['general','title','grid','rowHeaders','columnHeaders','values','subTotals','sparklines','accessibility','background','border'],"
)
# 2c. shape: line → shapeOutline
html = html.replace(
    "  shape:                          ['general','title','fill','line','background','border'],",
    "  shape:                          ['general','title','fill','shapeOutline','background','border'],"
)
# 2d. slicer: header→slicerHeader, items→slicerItems
html = html.replace(
    "  slicer:                         ['general','title','header','items','selection','data','searchBox','slider','background','border'],",
    "  slicer:                         ['general','title','slicerHeader','slicerItems','selection','data','searchBox','slider','background','border'],"
)
html = html.replace(
    "  advancedSlicerVisual:           ['general','title','header','items','selection','searchBox','background','border'],",
    "  advancedSlicerVisual:           ['general','title','slicerHeader','slicerItems','selection','searchBox','background','border'],"
)
html = html.replace(
    "  listSlicer:                     ['general','title','header','items','selection','searchBox','background','border'],",
    "  listSlicer:                     ['general','title','slicerHeader','slicerItems','selection','searchBox','background','border'],"
)

# ═══════════════════════════════════════════════════════════════════════════════
# 3.  THEME JSON — transform the embedded JSON blob
# ═══════════════════════════════════════════════════════════════════════════════

# Extract the THEME constant (it's on a single line: const THEME = {...};)
theme_match = re.search(r'(const THEME = )(\{.*?\});(\s*\n)', html, re.DOTALL)
if not theme_match:
    print("ERROR: could not find THEME constant", file=sys.stderr)
    sys.exit(1)

prefix   = theme_match.group(1)
json_str = theme_match.group(2)
suffix   = theme_match.group(3)

theme = json.loads(json_str)
vs = theme['visualStyles']

# Visuals that must keep 'dataLabels' (not rename to 'labels')
KEEP_DATA_LABELS = {'gauge','card','multiRowCard','kpi','decompositionTree','decompositionTreeVisual'}

def fix_axis(card_obj):
    """Fix a categoryAxis or valueAxis card object in-place."""
    if card_obj is None:
        return
    # color → labelColor
    if 'color' in card_obj and 'labelColor' not in card_obj:
        card_obj['labelColor'] = card_obj.pop('color')
    # gridlines:[{show,color}] → flat gridlineShow / gridlineColor
    if 'gridlines' in card_obj:
        gl = card_obj.pop('gridlines')
        if isinstance(gl, list) and len(gl) > 0:
            g = gl[0]
            card_obj['gridlineShow'] = g.get('show', False)
            if 'color' in g:
                card_obj['gridlineColor'] = g['color']

def fix_background_to_backcolor(card_obj):
    """Rename background→backColor in table cell cards."""
    if card_obj is None:
        return
    if 'background' in card_obj:
        card_obj['backColor'] = card_obj.pop('background')

def fix_banded_row(card_obj):
    """Rename bandedRowColor→backColorSecondary."""
    if card_obj is None:
        return
    if 'bandedRowColor' in card_obj:
        card_obj['backColorSecondary'] = card_obj.pop('bandedRowColor')

def get_card0(visual_obj, card_key):
    """Return the [0] object of a card, or None."""
    v = visual_obj.get(card_key)
    if isinstance(v, list) and len(v) > 0:
        return v[0]
    return None

# ── Global * visual ──
global_title = get_card0(vs.get('*', {}).get('*', {}), 'title')
if global_title and 'fontBold' in global_title:
    global_title['bold'] = global_title.pop('fontBold')

# ── Per-visual fixes ──
for vk, vis in vs.items():
    if vk in ('*', '__page__'):
        continue
    star = vis.get('*', {})

    # dataLabels → labels for standard chart visuals
    if vk not in KEEP_DATA_LABELS and 'dataLabels' in star:
        star['labels'] = star.pop('dataLabels')

    # Fix categoryAxis
    ca = get_card0(star, 'categoryAxis')
    fix_axis(ca)

    # Fix valueAxis
    va = get_card0(star, 'valueAxis')
    fix_axis(va)

    # tableEx / matrix cell cards
    if vk in ('tableEx', 'matrix', 'pivotTable'):
        fix_background_to_backcolor(get_card0(star, 'columnHeaders'))
        fix_background_to_backcolor(get_card0(star, 'rowHeaders'))
        ch = get_card0(star, 'values')
        fix_background_to_backcolor(ch)
        fix_banded_row(ch)
        fix_background_to_backcolor(get_card0(star, 'total'))

        # subtotals → subTotals
        if 'subtotals' in star:
            st = star.pop('subtotals')
            star['subTotals'] = st
        sub = get_card0(star, 'subTotals')
        fix_background_to_backcolor(sub)

    # shape: line → shapeOutline with correct property names
    if vk == 'shape' and 'line' in star:
        line_data = star.pop('line')
        if isinstance(line_data, list) and len(line_data) > 0:
            lo = line_data[0]
            if 'strokeColor' in lo:
                lo['lineColor'] = lo.pop('strokeColor')
            if 'strokeWidth' in lo:
                lo['weight'] = lo.pop('strokeWidth')
        star['shapeOutline'] = line_data

    # slicer: header→slicerHeader (textSize), items→slicerItems (textSize)
    if vk in ('slicer', 'advancedSlicerVisual', 'listSlicer'):
        if 'header' in star:
            hdr = star.pop('header')
            if isinstance(hdr, list) and len(hdr) > 0:
                h = hdr[0]
                if 'fontSize' in h:
                    h['textSize'] = h.pop('fontSize')
            star['slicerHeader'] = hdr
        if 'items' in star:
            itms = star.pop('items')
            if isinstance(itms, list) and len(itms) > 0:
                it = itms[0]
                if 'fontSize' in it:
                    it['textSize'] = it.pop('fontSize')
            star['slicerItems'] = itms

    # actionButton: text.fontBold→bold, fill.color→fillColor
    if vk == 'actionButton':
        txt = get_card0(star, 'text')
        if txt and 'fontBold' in txt:
            txt['bold'] = txt.pop('fontBold')
        fll = get_card0(star, 'fill')
        if fll and 'color' in fll and 'fillColor' not in fll:
            fll['fillColor'] = fll.pop('color')

# Re-serialize compactly (single line, as original)
new_json_str = json.dumps(theme, separators=(',', ':'), ensure_ascii=False)
html = html[:theme_match.start()] + prefix + new_json_str + ';' + suffix + html[theme_match.end():]

# ═══════════════════════════════════════════════════════════════════════════════
# 4.  CARD_NAME_MAP — add new entries
# ═══════════════════════════════════════════════════════════════════════════════

html = html.replace(
    "    subtotals:'Subtotals', bubbles:'Bubbles',",
    "    subTotals:'Subtotals', bubbles:'Bubbles',"
)
html = html.replace(
    "    cardTitle:'Card Title', indicator:'Indicator', trendline:'Trend Line',",
    "    cardTitle:'Card Title', shapeOutline:'Outline', slicerHeader:'Header', slicerItems:'Items',\n"
    "    indicator:'Indicator', trendline:'Trend Line',"
)
# remove 'line' entry from map (it's been replaced by shapeOutline)
html = html.replace(
    "    fill:'Fill', line:'Line',\n",
    "    fill:'Fill',\n"
)

# ═══════════════════════════════════════════════════════════════════════════════
# 5.  buildExportTheme() — remap internal card keys to PBI JSON keys
# ═══════════════════════════════════════════════════════════════════════════════

remap_code = """\
  // ── Remap internal card keys to correct PBI theme JSON keys ──
  const SLICER_VISUALS = ['slicer','advancedSlicerVisual','listSlicer'];
  for (const vk of Object.keys(t.visualStyles)) {
    const star = t.visualStyles[vk]?.['*'];
    if (!star) continue;
    // shapeOutline → outline  (shape visual)
    if (vk === 'shape' && star.shapeOutline !== undefined) {
      star.outline = star.shapeOutline;
      delete star.shapeOutline;
    }
    // slicerHeader → header, slicerItems → items  (slicer-family)
    if (SLICER_VISUALS.includes(vk)) {
      if (star.slicerHeader !== undefined) { star.header = star.slicerHeader; delete star.slicerHeader; }
      if (star.slicerItems  !== undefined) { star.items  = star.slicerItems;  delete star.slicerItems;  }
    }
  }
"""

html = html.replace(
    "function buildExportTheme() {\n"
    "  const t = JSON.parse(JSON.stringify(THEME));\n"
    "  if (Object.keys(PAGE_SETTINGS).length > 0) {",
    "function buildExportTheme() {\n"
    "  const t = JSON.parse(JSON.stringify(THEME));\n"
    + remap_code +
    "  if (Object.keys(PAGE_SETTINGS).length > 0) {"
)

# ═══════════════════════════════════════════════════════════════════════════════
# 6.  renderVisualPreview() — update slicer rcv calls
# ═══════════════════════════════════════════════════════════════════════════════

html = html.replace(
    "    const hc      = rcv(vk,'header','fontColor','#0F4C81');\n"
    "    const hbg     = rcv(vk,'header','background','#FFFFFF');\n"
    "    const hFontSz = rcv(vk,'header','fontSize', 12);\n"
    "    const hShow   = rcv(vk,'header','show', true);\n"
    "    const ic      = rcv(vk,'items','fontColor','#333333');\n"
    "    const ibg     = rcv(vk,'items','background','#FFFFFF');\n"
    "    const iFontSz = rcv(vk,'items','fontSize', 11);",
    "    const hc      = rcv(vk,'slicerHeader','fontColor','#0F4C81');\n"
    "    const hbg     = rcv(vk,'slicerHeader','background','#FFFFFF');\n"
    "    const hFontSz = rcv(vk,'slicerHeader','textSize', 12);\n"
    "    const hShow   = rcv(vk,'slicerHeader','show', true);\n"
    "    const ic      = rcv(vk,'slicerItems','fontColor','#333333');\n"
    "    const ibg     = rcv(vk,'slicerItems','background','#FFFFFF');\n"
    "    const iFontSz = rcv(vk,'slicerItems','textSize', 11);"
)

# ── Also update tableEx/matrix cell background reads ──
html = html.replace(
    "    const hbg = rcv(vk,'columnHeaders','background','#0F4C81');",
    "    const hbg = rcv(vk,'columnHeaders','backColor','#0F4C81');"
)
html = html.replace(
    "    const banded = rcv(vk,'values','bandedRowColor','#F0F6FB');",
    "    const banded = rcv(vk,'values','backColorSecondary','#F0F6FB');"
)
# matrix row headers background (two occurrences - second one is matrix)
html = html.replace(
    "    const rbg = rcv(vk,'rowHeaders','background','#FFFFFF');",
    "    const rbg = rcv(vk,'rowHeaders','backColor','#FFFFFF');"
)

# ═══════════════════════════════════════════════════════════════════════════════
# 7.  Verify & write
# ═══════════════════════════════════════════════════════════════════════════════

if html == original:
    print("WARNING: no changes were made — check patterns", file=sys.stderr)
    sys.exit(1)

with open(SRC, 'w', encoding='utf-8') as f:
    f.write(html)

print("Done. Changes applied to", SRC)
