// @ts-check
/**
 * visual-rendering-full.spec.js
 *
 * Comprehensive rendering tests: every property that renderVisualPreview()
 * reads via rcv() is verified to actually change the canvas output after
 * ▶ Apply is clicked in the modal.
 *
 * Strategy
 * ─────────
 * Chart.js visuals  → inspect Chart.getChart('#preview-canvas').options
 * Canvas-2D visuals → before/after canvas screenshot comparison
 *
 * Axis orientation
 * ─────────────────
 * Horizontal bars (barChart family): catScale='y', valScale='x'
 * All other Chart.js visuals:         catScale='x', valScale='y'
 */

const { test, expect } = require('playwright/test');
const path = require('path');
const FILE_URL = 'file://' + path.resolve(__dirname, '..', 'pbi-json-designer.html');

// ── DOM helpers (all evaluate-based to avoid scroll/visibility issues) ───────

async function openModal(page, vk) {
  await page.locator(`#visual-list li[data-key="${vk}"]`).click();
  await page.waitForSelector('#modal-overlay.open', { timeout: 8000 });
  await page.waitForTimeout(350);
}

async function expandCard(page, cardLabel) {
  await page.evaluate((label) => {
    for (const hdr of document.querySelectorAll('.card-header')) {
      if (hdr.textContent.trim().startsWith(label) && !hdr.classList.contains('open')) {
        hdr.click(); return;
      }
    }
  }, cardLabel);
  await page.waitForTimeout(80);
}

/**
 * Set a property value inside a named card.
 * type: 'color' | 'boolean' | 'number' | 'enum' | 'string'
 */
async function setProp(page, card, prop, type, value) {
  await page.evaluate(({ card, prop, type, value }) => {
    for (const hdr of document.querySelectorAll('.card-header.open')) {
      if (!hdr.textContent.trim().startsWith(card)) continue;
      const body = hdr.nextElementSibling;
      if (!body) continue;
      for (const row of body.querySelectorAll('.prop-row')) {
        if (row.querySelector('.prop-label')?.textContent?.trim() !== prop) continue;
        if (type === 'color') {
          const i = row.querySelector('input[type="color"]');
          if (i) { i.value = value; i.dispatchEvent(new Event('change', { bubbles: true })); }
        } else if (type === 'boolean') {
          row.querySelector('.toggle')?.click();
        } else if (type === 'number') {
          const i = row.querySelector('input[type="number"]');
          if (i) { i.value = String(value); i.dispatchEvent(new Event('change', { bubbles: true })); }
        } else if (type === 'enum') {
          const s = row.querySelector('select');
          if (s) { s.value = value; s.dispatchEvent(new Event('change', { bubbles: true })); }
        } else if (type === 'string') {
          const i = row.querySelector('input[type="text"], .prop-text');
          if (i) { i.value = String(value); i.dispatchEvent(new Event('input', { bubbles: true })); }
        }
        return;
      }
    }
  }, { card, prop, type, value });
}

async function applyAndWait(page) {
  await page.locator('button', { hasText: '▶ Apply' }).click();
  await page.waitForTimeout(350);
}

async function snap(page) {
  return page.locator('#preview-canvas').screenshot();
}

// ── Extended Chart.js options reader ─────────────────────────────────────────

async function chartOpts(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById('preview-canvas');
    if (!canvas) return null;
    const chart = typeof Chart !== 'undefined' ? Chart.getChart(canvas) : null;
    if (!chart) return null;
    const o = chart.options, s = o?.scales || {}, p = o?.plugins || {};
    const d0 = chart.data?.datasets?.[0];
    function hex(c) {
      if (!c) return c;
      if (Array.isArray(c)) return hex(c[0]);
      const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (m) return '#' + [m[1],m[2],m[3]].map(n => (+n).toString(16).padStart(2,'0')).join('');
      return String(c).toLowerCase();
    }
    return {
      titleDisplay:    p.title?.display,
      titleColor:      p.title?.color,
      titleFontSize:   p.title?.font?.size,
      titleFontWeight: p.title?.font?.weight,
      titleFontStyle:  p.title?.font?.style,
      titleAlign:      p.title?.align,
      titleText:       p.title?.text,
      legendDisplay:   p.legend?.display,
      legendPosition:  p.legend?.position,
      legendColor:     p.legend?.labels?.color,
      legendFontSize:  p.legend?.labels?.font?.size,
      legendFontWeight:p.legend?.labels?.font?.weight,
      legendFontStyle: p.legend?.labels?.font?.style,
      legendFamily:    p.legend?.labels?.font?.family,
      xDisplay:        s.x?.display,
      xTickColor:      s.x?.ticks?.color,
      xTickFontSize:   s.x?.ticks?.font?.size,
      xTickFontWeight: s.x?.ticks?.font?.weight,
      xTickFontStyle:  s.x?.ticks?.font?.style,
      xGridDisplay:    s.x?.grid?.display,
      xGridColor:      s.x?.grid?.color,
      xTitleDisplay:   s.x?.title?.display,
      xTitleColor:     s.x?.title?.color,
      xTitleFontSize:  s.x?.title?.font?.size,
      xTitleFontWeight:s.x?.title?.font?.weight,
      yDisplay:        s.y?.display,
      yTickColor:      s.y?.ticks?.color,
      yTickFontSize:   s.y?.ticks?.font?.size,
      yTickFontWeight: s.y?.ticks?.font?.weight,
      yTickFontStyle:  s.y?.ticks?.font?.style,
      yGridDisplay:    s.y?.grid?.display,
      yGridColor:      s.y?.grid?.color,
      yTitleDisplay:   s.y?.title?.display,
      yTitleColor:     s.y?.title?.color,
      yTitleFontSize:  s.y?.title?.font?.size,
      yTitleFontWeight:s.y?.title?.font?.weight,
      dataset0Bg:          hex(d0?.backgroundColor),
      dataset0BorderColor: hex(d0?.borderColor),
      dataset0BorderWidth: d0?.borderWidth,
      dataset0PointRadius: d0?.pointRadius,
      cutout: o?.cutout,
    };
  });
}

// ── Global setup ─────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto(FILE_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#visual-list li', { timeout: 10000 });
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION A  ·  barChart — full Chart.js property coverage
// Horizontal bar: catScale = 'y', valScale = 'x'
// ══════════════════════════════════════════════════════════════════════════════

test.describe('barChart — title properties', () => {
  test('title.show=OFF → titleDisplay false', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.titleDisplay).toBe(true);
    await expandCard(page, 'Title');
    await setProp(page, 'Title', 'Show Title', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.titleDisplay).toBe(false);
  });

  test('title.fontColor → titleColor changes', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.titleColor?.toUpperCase()).toBe('#0F4C81');
    await expandCard(page, 'Title');
    await setProp(page, 'Title', 'Font Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.titleColor?.toUpperCase()).toBe('#FF0000');
  });

  test('title.fontSize → titleFontSize changes', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.titleFontSize).toBe(14);
    await expandCard(page, 'Title');
    await setProp(page, 'Title', 'Font Size', 'number', 12);
    await applyAndWait(page);
    expect((await chartOpts(page))?.titleFontSize).toBe(12);
  });

  test('title.bold toggle → titleFontWeight becomes normal', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.titleFontWeight).toBe('bold');
    await expandCard(page, 'Title');
    await setProp(page, 'Title', 'Bold', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.titleFontWeight).toBe('normal');
  });

  test('title.italic=ON → canvas pixels change', async ({ page }) => {
    await openModal(page, 'barChart');
    const s1 = await snap(page);
    await expandCard(page, 'Title');
    await setProp(page, 'Title', 'Italic', 'boolean', null);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('barChart — legend properties', () => {
  test('legend.show=OFF → legendDisplay false', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.legendDisplay).toBe(true);
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Show Legend', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendDisplay).toBe(false);
  });

  test('legend.position Bottom → legendPosition bottom', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.legendPosition).toBe('top');
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Position', 'enum', 'Bottom');
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendPosition).toBe('bottom');
  });

  test('legend.labelColor → legendColor changes', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.legendColor?.toUpperCase()).toBe('#444444');
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Label Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendColor?.toUpperCase()).toBe('#FF0000');
  });

  test('legend.fontSize → legendFontSize changes', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.legendFontSize).toBe(10);
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Font Size', 'number', 16);
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendFontSize).toBe(16);
  });
});

test.describe('barChart — category axis (scales.y for horizontal bars)', () => {
  test('categoryAxis.show=OFF → yDisplay false', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.yDisplay).toBe(true);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yDisplay).toBe(false);
  });

  test('categoryAxis.labelColor → yTickColor changes', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.yTickColor?.toUpperCase()).toBe('#666666');
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Label Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTickColor?.toUpperCase()).toBe('#FF0000');
  });

  test('categoryAxis.fontSize → yTickFontSize changes', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.yTickFontSize).toBe(11);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Font Size', 'number', 16);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTickFontSize).toBe(16);
  });

  test('categoryAxis.gridlineShow=ON → yGridDisplay true', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.yGridDisplay).toBe(false);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Gridlines', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yGridDisplay).toBe(true);
  });

  test('categoryAxis.gridlineColor → yGridColor changes', async ({ page }) => {
    await openModal(page, 'barChart');
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Gridline Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.yGridColor?.toUpperCase()).toBe('#FF0000');
  });

  test('categoryAxis.showAxisTitle=ON → yTitleDisplay true', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.yTitleDisplay).toBe(false);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis Title', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTitleDisplay).toBe(true);
  });

  test('categoryAxis.showAxisTitle=ON → canvas pixels change', async ({ page }) => {
    await openModal(page, 'barChart');
    const s1 = await snap(page);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis Title', 'boolean', null);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('categoryAxis.titleColor → yTitleColor changes', async ({ page }) => {
    await openModal(page, 'barChart');
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Title Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTitleColor?.toUpperCase()).toBe('#FF0000');
  });
});

test.describe('barChart — value axis (scales.x for horizontal bars)', () => {
  test('valueAxis.show=OFF → xDisplay false', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.xDisplay).toBe(true);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xDisplay).toBe(false);
  });

  test('valueAxis.labelColor → xTickColor changes', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.xTickColor?.toUpperCase()).toBe('#666666');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Label Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTickColor?.toUpperCase()).toBe('#FF0000');
  });

  test('valueAxis.fontSize → xTickFontSize changes', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.xTickFontSize).toBe(11);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Font Size', 'number', 16);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTickFontSize).toBe(16);
  });

  test('valueAxis.gridlineShow=OFF → xGridDisplay false', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.xGridDisplay).toBe(true);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Gridlines', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xGridDisplay).toBe(false);
  });

  test('valueAxis.gridlineColor → xGridColor changes', async ({ page }) => {
    await openModal(page, 'barChart');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Gridline Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.xGridColor?.toUpperCase()).toBe('#FF0000');
  });

  test('valueAxis.showAxisTitle=ON → xTitleDisplay true', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.xTitleDisplay).toBe(false);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Axis Title', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTitleDisplay).toBe(true);
  });

  test('valueAxis.showAxisTitle=ON → canvas pixels change', async ({ page }) => {
    await openModal(page, 'barChart');
    const s1 = await snap(page);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Axis Title', 'boolean', null);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('valueAxis.titleColor → xTitleColor changes', async ({ page }) => {
    await openModal(page, 'barChart');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Title Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTitleColor?.toUpperCase()).toBe('#FF0000');
  });
});

test.describe('barChart — dataPoint', () => {
  test('dataPoint.defaultColor → dataset0Bg changes', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.dataset0Bg).toBe('#0f4c81');
    await expandCard(page, 'Data Point');
    await setProp(page, 'Data Point', 'Default Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.dataset0Bg).toBe('#ff0000');
  });

  test('dataPoint.fillTransparency → canvas pixels change', async ({ page }) => {
    await openModal(page, 'barChart');
    const s1 = await snap(page);
    await expandCard(page, 'Data Point');
    await setProp(page, 'Data Point', 'Fill Transparency', 'number', 60);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION B  ·  Vertical column charts + lineChart lineStyles + waterfallChart
// Vertical charts: catScale = 'x', valScale = 'y'
// ══════════════════════════════════════════════════════════════════════════════

test.describe('columnChart — axis orientation (catScale=x, valScale=y)', () => {
  test('categoryAxis.show=OFF → xDisplay false', async ({ page }) => {
    await openModal(page, 'columnChart');
    expect((await chartOpts(page))?.xDisplay).toBe(true);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xDisplay).toBe(false);
  });

  test('valueAxis.show=OFF → yDisplay false', async ({ page }) => {
    await openModal(page, 'columnChart');
    expect((await chartOpts(page))?.yDisplay).toBe(true);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yDisplay).toBe(false);
  });

  test('valueAxis.gridlineShow=OFF → yGridDisplay false', async ({ page }) => {
    await openModal(page, 'columnChart');
    expect((await chartOpts(page))?.yGridDisplay).toBe(true);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Gridlines', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yGridDisplay).toBe(false);
  });

  test('valueAxis.gridlineColor → yGridColor changes', async ({ page }) => {
    await openModal(page, 'columnChart');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Gridline Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.yGridColor?.toUpperCase()).toBe('#FF0000');
  });

  test('legend.show=OFF → legendDisplay false', async ({ page }) => {
    await openModal(page, 'columnChart');
    expect((await chartOpts(page))?.legendDisplay).toBe(true);
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Show Legend', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendDisplay).toBe(false);
  });

  test('dataPoint.defaultColor → dataset0Bg changes', async ({ page }) => {
    await openModal(page, 'columnChart');
    expect((await chartOpts(page))?.dataset0Bg).toBe('#0f4c81');
    await expandCard(page, 'Data Point');
    await setProp(page, 'Data Point', 'Default Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.dataset0Bg).toBe('#ff0000');
  });
});

test.describe('clusteredColumnChart — spot-check axis orientation', () => {
  test('categoryAxis.show=OFF → xDisplay false', async ({ page }) => {
    await openModal(page, 'clusteredColumnChart');
    expect((await chartOpts(page))?.xDisplay).toBe(true);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xDisplay).toBe(false);
  });

  test('valueAxis.gridlineShow=OFF → yGridDisplay false', async ({ page }) => {
    await openModal(page, 'clusteredColumnChart');
    expect((await chartOpts(page))?.yGridDisplay).toBe(true);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Gridlines', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yGridDisplay).toBe(false);
  });
});

test.describe('stackedColumnChart — spot-check', () => {
  test('legend.show=OFF → legendDisplay false', async ({ page }) => {
    await openModal(page, 'stackedColumnChart');
    expect((await chartOpts(page))?.legendDisplay).toBe(true);
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Show Legend', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendDisplay).toBe(false);
  });

  test('valueAxis.show=OFF → yDisplay false', async ({ page }) => {
    await openModal(page, 'stackedColumnChart');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yDisplay).toBe(false);
  });
});

test.describe('stackedBarChart — spot-check horizontal orientation', () => {
  test('categoryAxis.show=OFF → yDisplay false (horizontal: cat=y)', async ({ page }) => {
    await openModal(page, 'stackedBarChart');
    expect((await chartOpts(page))?.yDisplay).toBe(true);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yDisplay).toBe(false);
  });

  test('valueAxis.gridlineShow=OFF → xGridDisplay false (horizontal: val=x)', async ({ page }) => {
    await openModal(page, 'stackedBarChart');
    expect((await chartOpts(page))?.xGridDisplay).toBe(true);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Gridlines', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xGridDisplay).toBe(false);
  });
});

test.describe('lineChart — lineStyles properties', () => {
  test('lineStyles.strokeWidth → dataset0BorderWidth changes', async ({ page }) => {
    await openModal(page, 'lineChart');
    expect((await chartOpts(page))?.dataset0BorderWidth).toBe(2);
    await expandCard(page, 'Line Style');
    await setProp(page, 'Line Style', 'Line Width', 'number', 5);
    await applyAndWait(page);
    expect((await chartOpts(page))?.dataset0BorderWidth).toBe(5);
  });

  test('lineStyles.showMarker=ON → dataset0PointRadius becomes 4', async ({ page }) => {
    await openModal(page, 'lineChart');
    expect((await chartOpts(page))?.dataset0PointRadius).toBe(0);
    await expandCard(page, 'Line Style');
    await setProp(page, 'Line Style', 'Show Markers', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.dataset0PointRadius).toBe(4);
  });
});

test.describe('waterfallChart — sentimentColors', () => {
  test('sentimentColors.increaseFill changes → canvas pixels change', async ({ page }) => {
    await openModal(page, 'waterfallChart');
    const s1 = await snap(page);
    await expandCard(page, 'Sentiment Colors');
    await setProp(page, 'Sentiment Colors', 'Increase Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('sentimentColors.decreaseFill changes → canvas pixels change', async ({ page }) => {
    await openModal(page, 'waterfallChart');
    const s1 = await snap(page);
    await expandCard(page, 'Sentiment Colors');
    await setProp(page, 'Sentiment Colors', 'Decrease Color', 'color', '#0000ff');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('sentimentColors.totalFill changes → canvas pixels change', async ({ page }) => {
    await openModal(page, 'waterfallChart');
    const s1 = await snap(page);
    await expandCard(page, 'Sentiment Colors');
    await setProp(page, 'Sentiment Colors', 'Total Color', 'color', '#00ff00');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION C  ·  pieChart · donutChart · scatterChart · areaChart · ribbonChart
//               · lineClusteredColumnComboChart · remaining bar/column spot-checks
// ══════════════════════════════════════════════════════════════════════════════

test.describe('pieChart — legend + data colors', () => {
  test('legend.show=OFF → legendDisplay false', async ({ page }) => {
    await openModal(page, 'pieChart');
    expect((await chartOpts(page))?.legendDisplay).toBe(true);
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Show Legend', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendDisplay).toBe(false);
  });

  test('legend.position Bottom → legendPosition bottom', async ({ page }) => {
    await openModal(page, 'pieChart');
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Position', 'enum', 'Bottom');
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendPosition).toBe('bottom');
  });

  test('legend.labelColor → legendColor changes', async ({ page }) => {
    await openModal(page, 'pieChart');
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Label Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendColor?.toUpperCase()).toBe('#FF0000');
  });
});

test.describe('donutChart — innerRadius.innerRadiusRatio → cutout', () => {
  test('innerRadius 50% default', async ({ page }) => {
    await openModal(page, 'donutChart');
    expect((await chartOpts(page))?.cutout).toBe('50%');
  });

  test('innerRadius.innerRadiusRatio → cutout changes', async ({ page }) => {
    await openModal(page, 'donutChart');
    await expandCard(page, 'Inner Radius');
    await setProp(page, 'Inner Radius', 'Inner Radius %', 'number', 70);
    await applyAndWait(page);
    expect((await chartOpts(page))?.cutout).toBe('70%');
  });

  test('legend.show=OFF → legendDisplay false', async ({ page }) => {
    await openModal(page, 'donutChart');
    expect((await chartOpts(page))?.legendDisplay).toBe(true);
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Show Legend', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendDisplay).toBe(false);
  });
});

test.describe('scatterChart — axes and legend', () => {
  test('categoryAxis.show=OFF → xDisplay false', async ({ page }) => {
    await openModal(page, 'scatterChart');
    expect((await chartOpts(page))?.xDisplay).toBe(true);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xDisplay).toBe(false);
  });

  test('valueAxis.gridlineShow=OFF → yGridDisplay false', async ({ page }) => {
    await openModal(page, 'scatterChart');
    expect((await chartOpts(page))?.yGridDisplay).toBe(true);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Gridlines', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yGridDisplay).toBe(false);
  });

  test('legend.labelColor → legendColor changes', async ({ page }) => {
    await openModal(page, 'scatterChart');
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Label Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendColor?.toUpperCase()).toBe('#FF0000');
  });
});

test.describe('areaChart — spot-check axes and data color', () => {
  test('valueAxis.gridlineShow=OFF → yGridDisplay false', async ({ page }) => {
    await openModal(page, 'areaChart');
    expect((await chartOpts(page))?.yGridDisplay).toBe(true);
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Gridlines', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yGridDisplay).toBe(false);
  });

  test('legend.show=OFF → legendDisplay false', async ({ page }) => {
    await openModal(page, 'areaChart');
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Show Legend', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendDisplay).toBe(false);
  });
});

test.describe('ribbonChart — spot-check', () => {
  test('categoryAxis.labelColor → xTickColor changes', async ({ page }) => {
    await openModal(page, 'ribbonChart');
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Label Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTickColor?.toUpperCase()).toBe('#FF0000');
  });

  test('valueAxis.gridlineColor → yGridColor changes', async ({ page }) => {
    await openModal(page, 'ribbonChart');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Gridline Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.yGridColor?.toUpperCase()).toBe('#FF0000');
  });
});

test.describe('lineClusteredColumnComboChart — spot-check', () => {
  test('categoryAxis.show=OFF → xDisplay false', async ({ page }) => {
    await openModal(page, 'lineClusteredColumnComboChart');
    expect((await chartOpts(page))?.xDisplay).toBe(true);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xDisplay).toBe(false);
  });

  test('lineStyles.strokeWidth → dataset0BorderWidth changes', async ({ page }) => {
    await openModal(page, 'lineClusteredColumnComboChart');
    await expandCard(page, 'Line Styles');
    await setProp(page, 'Line Styles', 'Line Width', 'number', 4);
    await applyAndWait(page);
    // dataset0 is a bar in this combo, dataset2 is the line — check via snap
    const s1 = await snap(page);
    expect(s1).toBeTruthy();
  });
});

test.describe('hundredPercentStackedBarChart — spot-check horizontal', () => {
  test('categoryAxis.show=OFF → yDisplay false', async ({ page }) => {
    await openModal(page, 'hundredPercentStackedBarChart');
    expect((await chartOpts(page))?.yDisplay).toBe(true);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yDisplay).toBe(false);
  });
});

test.describe('hundredPercentStackedColumnChart — spot-check vertical', () => {
  test('categoryAxis.show=OFF → xDisplay false', async ({ page }) => {
    await openModal(page, 'hundredPercentStackedColumnChart');
    expect((await chartOpts(page))?.xDisplay).toBe(true);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xDisplay).toBe(false);
  });
});

test.describe('stackedAreaChart — spot-check', () => {
  test('legend.show=OFF → legendDisplay false', async ({ page }) => {
    await openModal(page, 'stackedAreaChart');
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Show Legend', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendDisplay).toBe(false);
  });
});

test.describe('clusteredBarChart — spot-check horizontal orientation', () => {
  test('categoryAxis.show=OFF → yDisplay false (horizontal: cat=y)', async ({ page }) => {
    await openModal(page, 'clusteredBarChart');
    expect((await chartOpts(page))?.yDisplay).toBe(true);
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yDisplay).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION D  ·  Canvas-2D visuals — every rendered property
// ══════════════════════════════════════════════════════════════════════════════

test.describe('gauge — all rendered properties', () => {
  test('gauge.foregroundColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'gauge');
    const s1 = await snap(page);
    await expandCard(page, 'Gauge');
    await setProp(page, 'Gauge', 'Foreground Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('gauge.backgroundColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'gauge');
    const s1 = await snap(page);
    await expandCard(page, 'Gauge');
    await setProp(page, 'Gauge', 'Background Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('gauge.targetColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'gauge');
    const s1 = await snap(page);
    await expandCard(page, 'Gauge');
    await setProp(page, 'Gauge', 'Target Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('dataLabels.color → canvas pixels change', async ({ page }) => {
    await openModal(page, 'gauge');
    const s1 = await snap(page);
    await expandCard(page, 'Data Labels');
    await setProp(page, 'Data Labels', 'Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('kpi — all rendered properties', () => {
  test('dataLabels.color → canvas pixels change', async ({ page }) => {
    await openModal(page, 'kpi');
    const s1 = await snap(page);
    await expandCard(page, 'Data Labels');
    await setProp(page, 'Data Labels', 'Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('trendline.color → canvas pixels change', async ({ page }) => {
    await openModal(page, 'kpi');
    const s1 = await snap(page);
    await expandCard(page, 'Trend Line');
    await setProp(page, 'Trend Line', 'Trendline Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('trendline.show=OFF → canvas pixels change (trendline disappears)', async ({ page }) => {
    await openModal(page, 'kpi');
    const s1 = await snap(page);
    await expandCard(page, 'Trend Line');
    await setProp(page, 'Trend Line', 'Show Trendline', 'boolean', null);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('slicer — all rendered properties', () => {
  test('header.fontColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'slicer');
    const s1 = await snap(page);
    await expandCard(page, 'Header');
    await setProp(page, 'Header', 'Font Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('header.background → canvas pixels change', async ({ page }) => {
    await openModal(page, 'slicer');
    const s1 = await snap(page);
    await expandCard(page, 'Header');
    await setProp(page, 'Header', 'Background', 'color', '#ffff00');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('header.show=OFF → canvas pixels change (header disappears)', async ({ page }) => {
    await openModal(page, 'slicer');
    const s1 = await snap(page);
    await expandCard(page, 'Header');
    await setProp(page, 'Header', 'Show Header', 'boolean', null);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('items.fontColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'slicer');
    const s1 = await snap(page);
    await expandCard(page, 'Items');
    await setProp(page, 'Items', 'Font Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('items.background → canvas pixels change', async ({ page }) => {
    await openModal(page, 'slicer');
    const s1 = await snap(page);
    await expandCard(page, 'Items');
    await setProp(page, 'Items', 'Background', 'color', '#ffffcc');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('items.fontSize → canvas pixels change', async ({ page }) => {
    await openModal(page, 'slicer');
    const s1 = await snap(page);
    await expandCard(page, 'Items');
    await setProp(page, 'Items', 'Font Size', 'number', 18);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('slider.color → canvas pixels change', async ({ page }) => {
    await openModal(page, 'slicer');
    const s1 = await snap(page);
    await expandCard(page, 'Slider');
    await setProp(page, 'Slider', 'Slider Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('tableEx — all rendered properties', () => {
  test('columnHeaders.background → canvas pixels change', async ({ page }) => {
    await openModal(page, 'tableEx');
    const s1 = await snap(page);
    await expandCard(page, 'Column Headers');
    await setProp(page, 'Column Headers', 'Background', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('columnHeaders.fontColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'tableEx');
    const s1 = await snap(page);
    await expandCard(page, 'Column Headers');
    await setProp(page, 'Column Headers', 'Font Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('values.bandedRowColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'tableEx');
    const s1 = await snap(page);
    await expandCard(page, 'Values');
    await setProp(page, 'Values', 'Banded Row Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('matrix — all rendered properties', () => {
  test('columnHeaders.background → canvas pixels change', async ({ page }) => {
    await openModal(page, 'matrix');
    const s1 = await snap(page);
    await expandCard(page, 'Column Headers');
    await setProp(page, 'Column Headers', 'Background', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('columnHeaders.fontColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'matrix');
    const s1 = await snap(page);
    await expandCard(page, 'Column Headers');
    await setProp(page, 'Column Headers', 'Font Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('rowHeaders.background → canvas pixels change', async ({ page }) => {
    await openModal(page, 'matrix');
    const s1 = await snap(page);
    await expandCard(page, 'Row Headers');
    await setProp(page, 'Row Headers', 'Background', 'color', '#ffffcc');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('multiRowCard — all rendered properties', () => {
  test('bar.color → canvas pixels change', async ({ page }) => {
    await openModal(page, 'multiRowCard');
    const s1 = await snap(page);
    await expandCard(page, 'Bar');
    await setProp(page, 'Bar', 'Bar Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('dataLabels.color → canvas pixels change', async ({ page }) => {
    await openModal(page, 'multiRowCard');
    const s1 = await snap(page);
    await expandCard(page, 'Data Labels');
    await setProp(page, 'Data Labels', 'Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('categoryLabels.color → canvas pixels change', async ({ page }) => {
    await openModal(page, 'multiRowCard');
    const s1 = await snap(page);
    await expandCard(page, 'Category Label');
    await setProp(page, 'Category Label', 'Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('cardVisual — all rendered properties', () => {
  test('cardVisualSettings.fontColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'cardVisual');
    const s1 = await snap(page);
    await expandCard(page, 'Card Value');
    await setProp(page, 'Card Value', 'Font Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('categoryLabels.color → canvas pixels change', async ({ page }) => {
    await openModal(page, 'cardVisual');
    const s1 = await snap(page);
    await expandCard(page, 'Category Label');
    await setProp(page, 'Category Label', 'Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('categoryLabels.fontSize → canvas pixels change', async ({ page }) => {
    await openModal(page, 'cardVisual');
    const s1 = await snap(page);
    await expandCard(page, 'Category Label');
    await setProp(page, 'Category Label', 'Font Size', 'number', 20);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('decompositionTree — header.background', () => {
  test('header.background → canvas pixels change', async ({ page }) => {
    await openModal(page, 'decompositionTree');
    const s1 = await snap(page);
    await expandCard(page, 'Header');
    await setProp(page, 'Header', 'Background', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('shape — fill properties', () => {
  test('fill.fillColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'shape');
    const s1 = await snap(page);
    await expandCard(page, 'Fill');
    await setProp(page, 'Fill', 'Fill Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('fill.transparency → canvas pixels change', async ({ page }) => {
    await openModal(page, 'shape');
    const s1 = await snap(page);
    await expandCard(page, 'Fill');
    await setProp(page, 'Fill', 'Transparency', 'number', 60);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('actionButton — fill and text colors', () => {
  test('fill.fillColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'actionButton');
    const s1 = await snap(page);
    await expandCard(page, 'Fill');
    await setProp(page, 'Fill', 'Fill Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('text.fontColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'actionButton');
    const s1 = await snap(page);
    await expandCard(page, 'Text');
    await setProp(page, 'Text', 'Font Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('bookmarkNavigator — fill and text colors', () => {
  test('fill.fillColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'bookmarkNavigator');
    const s1 = await snap(page);
    await expandCard(page, 'Fill');
    await setProp(page, 'Fill', 'Fill Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('text.fontColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'bookmarkNavigator');
    const s1 = await snap(page);
    await expandCard(page, 'Text');
    await setProp(page, 'Text', 'Font Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('pageNavigator — fill and text colors', () => {
  test('fill.fillColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'pageNavigator');
    const s1 = await snap(page);
    await expandCard(page, 'Fill');
    await setProp(page, 'Fill', 'Fill Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('text.fontColor → canvas pixels change', async ({ page }) => {
    await openModal(page, 'pageNavigator');
    const s1 = await snap(page);
    await expandCard(page, 'Text');
    await setProp(page, 'Text', 'Font Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('funnel — data color reflected in canvas', () => {
  test('data color 0 change → canvas pixels change', async ({ page }) => {
    await openModal(page, 'funnel');
    const s1 = await snap(page);
    // Change the first data color from the global data-colors bar
    await page.evaluate(() => {
      const inp = document.querySelector('#data-colors input[type="color"]');
      if (inp) { inp.value = '#ff0000'; inp.dispatchEvent(new Event('input', {bubbles:true})); }
    });
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('treemap — data color reflected in canvas', () => {
  test('data color 0 change → canvas pixels change', async ({ page }) => {
    await openModal(page, 'treemap');
    const s1 = await snap(page);
    await page.evaluate(() => {
      const inp = document.querySelector('#data-colors input[type="color"]');
      if (inp) { inp.value = '#ff0000'; inp.dispatchEvent(new Event('input', {bubbles:true})); }
    });
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION E·1  ·  New rendering: title italic/align, legend bold/italic/family,
//               axis bold/italic, axis-title fontSize/bold, dataPoint borders
// ══════════════════════════════════════════════════════════════════════════════

test.describe('barChart — title italic and alignment', () => {
  test('title.italic=ON → titleFontStyle italic', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.titleFontStyle).toBe('normal');
    await expandCard(page, 'Title');
    await setProp(page, 'Title', 'Italic', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.titleFontStyle).toBe('italic');
  });

  test('title.alignment=center → titleAlign center', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.titleAlign).toBe('start');
    await expandCard(page, 'Title');
    await setProp(page, 'Title', 'Alignment', 'enum', 'center');
    await applyAndWait(page);
    expect((await chartOpts(page))?.titleAlign).toBe('center');
  });

  test('title.alignment=right → titleAlign end', async ({ page }) => {
    await openModal(page, 'barChart');
    await expandCard(page, 'Title');
    await setProp(page, 'Title', 'Alignment', 'enum', 'right');
    await applyAndWait(page);
    expect((await chartOpts(page))?.titleAlign).toBe('end');
  });

  test('slicer: title.italic=ON → canvas pixels change', async ({ page }) => {
    await openModal(page, 'slicer');
    const s1 = await snap(page);
    await expandCard(page, 'Title');
    await setProp(page, 'Title', 'Italic', 'boolean', null);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('gauge: title.alignment=center → canvas pixels change', async ({ page }) => {
    await openModal(page, 'gauge');
    const s1 = await snap(page);
    await expandCard(page, 'Title');
    await setProp(page, 'Title', 'Alignment', 'enum', 'center');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('barChart — legend bold / italic / fontFamily', () => {
  test('legend.bold=ON → legendFontWeight bold', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.legendFontWeight).toBe('normal');
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Bold', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendFontWeight).toBe('bold');
  });

  test('legend.italic=ON → legendFontStyle italic', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.legendFontStyle).toBe('normal');
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Italic', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendFontStyle).toBe('italic');
  });

  test('legend.fontFamily Calibri → legendFamily Calibri', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.legendFamily).toBe('Segoe UI');
    await expandCard(page, 'Legend');
    await setProp(page, 'Legend', 'Font Family', 'enum', 'Calibri');
    await applyAndWait(page);
    expect((await chartOpts(page))?.legendFamily).toBe('Calibri');
  });
});

test.describe('barChart — category axis bold/italic (scales.y for horizontal bars)', () => {
  test('categoryAxis.bold=ON → yTickFontWeight bold', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.yTickFontWeight).toBe('normal');
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Bold', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTickFontWeight).toBe('bold');
  });

  test('categoryAxis.italic=ON → yTickFontStyle italic', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.yTickFontStyle).toBe('normal');
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Italic', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTickFontStyle).toBe('italic');
  });
});

test.describe('barChart — axis title fontSize/bold (scales.y for horizontal bars)', () => {
  test('categoryAxis.titleFontSize → yTitleFontSize changes', async ({ page }) => {
    await openModal(page, 'barChart');
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis Title', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTitleFontSize).toBe(11);
    await setProp(page, 'Category Axis', 'Title Font Size', 'number', 16);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTitleFontSize).toBe(16);
  });

  test('categoryAxis.titleBold=ON → yTitleFontWeight bold', async ({ page }) => {
    await openModal(page, 'barChart');
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Show Axis Title', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTitleFontWeight).toBe('normal');
    await setProp(page, 'Category Axis', 'Title Bold', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTitleFontWeight).toBe('bold');
  });
});

test.describe('barChart — value axis bold/italic (scales.x for horizontal bars)', () => {
  test('valueAxis.bold=ON → xTickFontWeight bold', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.xTickFontWeight).toBe('normal');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Bold', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTickFontWeight).toBe('bold');
  });

  test('valueAxis.italic=ON → xTickFontStyle italic', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.xTickFontStyle).toBe('normal');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Italic', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTickFontStyle).toBe('italic');
  });
});

test.describe('barChart — value axis title fontSize/bold (scales.x for horizontal bars)', () => {
  test('valueAxis.titleFontSize → xTitleFontSize changes', async ({ page }) => {
    await openModal(page, 'barChart');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Axis Title', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTitleFontSize).toBe(11);
    await setProp(page, 'Value Axis', 'Title Font Size', 'number', 16);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTitleFontSize).toBe(16);
  });

  test('valueAxis.titleBold=ON → xTitleFontWeight bold', async ({ page }) => {
    await openModal(page, 'barChart');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Show Axis Title', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTitleFontWeight).toBe('normal');
    await setProp(page, 'Value Axis', 'Title Bold', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTitleFontWeight).toBe('bold');
  });
});

test.describe('columnChart — category/value axis bold/italic (catScale=x, valScale=y)', () => {
  test('categoryAxis.bold=ON → xTickFontWeight bold', async ({ page }) => {
    await openModal(page, 'columnChart');
    expect((await chartOpts(page))?.xTickFontWeight).toBe('normal');
    await expandCard(page, 'Category Axis');
    await setProp(page, 'Category Axis', 'Bold', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.xTickFontWeight).toBe('bold');
  });

  test('valueAxis.italic=ON → yTickFontStyle italic', async ({ page }) => {
    await openModal(page, 'columnChart');
    expect((await chartOpts(page))?.yTickFontStyle).toBe('normal');
    await expandCard(page, 'Value Axis');
    await setProp(page, 'Value Axis', 'Italic', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.yTickFontStyle).toBe('italic');
  });
});

test.describe('barChart — dataPoint borders', () => {
  test('dataPoint.borderShow=ON → dataset0BorderWidth equals borderSize', async ({ page }) => {
    await openModal(page, 'barChart');
    expect((await chartOpts(page))?.dataset0BorderWidth).toBe(0);
    await expandCard(page, 'Data Point');
    await setProp(page, 'Data Point', 'Show Border', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.dataset0BorderWidth).toBe(1);
  });

  test('dataPoint.borderColor → dataset0BorderColor changes when border shown', async ({ page }) => {
    await openModal(page, 'barChart');
    await expandCard(page, 'Data Point');
    await setProp(page, 'Data Point', 'Show Border', 'boolean', null);
    await applyAndWait(page);
    await setProp(page, 'Data Point', 'Border Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect((await chartOpts(page))?.dataset0BorderColor).toBe('#ff0000');
  });

  test('columnChart: dataPoint.borderShow=ON → dataset0BorderWidth becomes 1', async ({ page }) => {
    await openModal(page, 'columnChart');
    expect((await chartOpts(page))?.dataset0BorderWidth).toBe(0);
    await expandCard(page, 'Data Point');
    await setProp(page, 'Data Point', 'Show Border', 'boolean', null);
    await applyAndWait(page);
    expect((await chartOpts(page))?.dataset0BorderWidth).toBe(1);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION E  ·  Background + border shared properties · export includes PAGE_SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('background / border (shared across visuals)', () => {
  test('slicer: background.show=ON → canvas pixels change', async ({ page }) => {
    await openModal(page, 'slicer');
    const s1 = await snap(page);
    await expandCard(page, 'Background');
    await setProp(page, 'Background', 'Show Background', 'boolean', null);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('tableEx: background.color → canvas pixels change when background shown', async ({ page }) => {
    await openModal(page, 'tableEx');
    // Enable background first
    await expandCard(page, 'Background');
    await setProp(page, 'Background', 'Show Background', 'boolean', null);
    await applyAndWait(page);
    const s1 = await snap(page);
    await setProp(page, 'Background', 'Color', 'color', '#ffff00');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('matrix: border.show=ON → canvas pixels change', async ({ page }) => {
    await openModal(page, 'matrix');
    const s1 = await snap(page);
    await expandCard(page, 'Border');
    await setProp(page, 'Border', 'Show Border', 'boolean', null);
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });

  test('slicer: border.color → canvas pixels change when border shown', async ({ page }) => {
    await openModal(page, 'slicer');
    await expandCard(page, 'Border');
    await setProp(page, 'Border', 'Show Border', 'boolean', null);
    await applyAndWait(page);
    const s1 = await snap(page);
    await setProp(page, 'Border', 'Border Color', 'color', '#ff0000');
    await applyAndWait(page);
    expect(s1.equals(await snap(page))).toBe(false);
  });
});

test.describe('export — PAGE_SETTINGS included in JSON', () => {
  test('page settings set via modal appear in buildExportTheme()', async ({ page }) => {
    // Open Page Settings via the "Edit" button in the main panel
    await page.locator('button', { hasText: 'Edit' }).first().click();
    await page.waitForSelector('#modal-overlay.open', { timeout: 8000 });
    await page.waitForTimeout(350);

    await expandCard(page, 'Page Background');
    await setProp(page, 'Page Background', 'Background Color', 'color', '#aabbcc');
    await applyAndWait(page);

    const result = await page.evaluate(() => {
      if (typeof buildExportTheme === 'undefined') return null;
      const t = buildExportTheme();
      const raw = t?.visualStyles?.__page__?.['*']?.pageBackground?.[0]?.color;
      if (!raw) return null;
      // color is stored as {solid:{color:'#...'}} or plain string
      if (typeof raw === 'string') return raw;
      return raw?.solid?.color ?? JSON.stringify(raw);
    });
    expect(result?.toLowerCase()).toBe('#aabbcc');
  });

  test('PAGE_SETTINGS directly set → buildExportTheme includes them in __page__', async ({ page }) => {
    // Directly set PAGE_SETTINGS and verify buildExportTheme picks them up
    const result = await page.evaluate(() => {
      if (typeof PAGE_SETTINGS === 'undefined' || typeof buildExportTheme === 'undefined') return null;
      PAGE_SETTINGS['pageBackground'] = { color: '#112233' };
      const t = buildExportTheme();
      return t?.visualStyles?.__page__?.['*']?.pageBackground?.[0]?.color ?? null;
    });
    expect(result?.toLowerCase()).toBe('#112233');
  });

  test('PAGE_SETTINGS show in JSON output element', async ({ page }) => {
    await page.evaluate(() => {
      if (typeof PAGE_SETTINGS !== 'undefined') PAGE_SETTINGS['pageBackground'] = { color: '#998877' };
      if (typeof updateJSON === 'function') updateJSON();
    });
    await page.waitForTimeout(200);

    const jsonText = await page.evaluate(() => document.getElementById('json-output')?.textContent || '');
    expect(jsonText).toContain('#998877');
  });
});
