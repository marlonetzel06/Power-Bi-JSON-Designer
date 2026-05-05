// @ts-check
/**
 * visual-rendering.spec.js
 *
 * Verifies that property-panel changes are actually RENDERED in the
 * modal preview canvas — not just stored in THEME state.
 *
 * Strategy:
 *  - Chart.js visuals  → inspect Chart.getChart('#preview-canvas').options
 *    after every change + Apply (this is the live Chart.js config used
 *    to draw the canvas).
 *  - Canvas-2D visuals → compare canvas screenshots before / after a
 *    change to prove the pixel output actually changed.
 */
const { test, expect } = require('playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '..', 'pbi-json-designer.html');

// ── Helpers ───────────────────────────────────────────────────────────────────

async function openModal(page, visualKey) {
  await page.locator(`#visual-list li[data-key="${visualKey}"]`).click();
  await page.waitForSelector('#modal-overlay.open', { timeout: 8000 });
  // Give Chart.js time to render the initial preview
  await page.waitForTimeout(300);
}

async function expandCard(page, labelText) {
  const hdr = page.locator('.card-header', { hasText: new RegExp(`^${labelText}`) }).first();
  const isOpen = await hdr.evaluate(el => el.classList.contains('open'));
  if (!isOpen) await hdr.click();
  await page.waitForTimeout(100);
}

function propRow(page, labelText) {
  return page.locator('.card-body.open .prop-row').filter({
    has: page.locator('.prop-label', { hasText: new RegExp(`^${labelText}$`) })
  }).first();
}

/** Click Apply and wait for the debounced preview refresh (40 ms + buffer). */
async function applyAndWait(page) {
  await page.locator('button', { hasText: '▶ Apply' }).click();
  await page.waitForTimeout(300);
}

/**
 * Read the live Chart.js config from the modal preview canvas.
 * Returns null for canvas-2D visuals that don't use Chart.js.
 */
async function getChartOpts(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById('preview-canvas');
    if (!canvas) return null;
    const chart = typeof Chart !== 'undefined' ? Chart.getChart(canvas) : null;
    if (!chart) return null;
    const o = chart.options;
    // Normalise an rgba(...) or #hex color string to lowercase hex for comparison
    function toHex(c) {
      if (!c) return c;
      if (Array.isArray(c)) return toHex(c[0]);
      const m = String(c).match(/rgba?\((\d+),(\d+),(\d+)/);
      if (m) return '#' + [m[1],m[2],m[3]].map(n => (+n).toString(16).padStart(2,'0')).join('');
      return String(c).toLowerCase();
    }
    return {
      legendDisplay:  o?.plugins?.legend?.display,
      legendPosition: o?.plugins?.legend?.position,
      legendColor:    o?.plugins?.legend?.labels?.color,
      titleDisplay:   o?.plugins?.title?.display,
      titleColor:     o?.plugins?.title?.color,
      titleText:      o?.plugins?.title?.text,
      xDisplay:       o?.scales?.x?.display,
      yDisplay:       o?.scales?.y?.display,
      yGridDisplay:   o?.scales?.y?.grid?.display,
      xGridDisplay:   o?.scales?.x?.grid?.display,
      dataset0Bg:     toHex(chart.data?.datasets?.[0]?.backgroundColor),
    };
  });
}

/** Grab a PNG Buffer of the preview canvas for pixel-level comparison. */
async function canvasSnapshot(page) {
  return page.locator('#preview-canvas').screenshot();
}

// ── Suite ─────────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto(FILE_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#visual-list li', { timeout: 10000 });
});

// ─── 1. Legend — show / hide ──────────────────────────────────────────────────

test('barChart: legend show=OFF is rendered in preview', async ({ page }) => {
  await openModal(page, 'barChart');

  const before = await getChartOpts(page);
  // Default: legend is shown in modal (legendShow && isModal = true)
  expect(before?.legendDisplay).toBe(true);

  // Turn legend off
  await expandCard(page, 'Legend');
  await propRow(page, 'Show Legend').locator('.toggle').click();
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.legendDisplay).toBe(false);
});

test('clusteredColumnChart: legend show=OFF is rendered in preview', async ({ page }) => {
  await openModal(page, 'clusteredColumnChart');

  const before = await getChartOpts(page);
  expect(before?.legendDisplay).toBe(true);

  await expandCard(page, 'Legend');
  await propRow(page, 'Show Legend').locator('.toggle').click();
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.legendDisplay).toBe(false);
});

// ─── 2. Legend — position ────────────────────────────────────────────────────

test('lineChart: legend position change is rendered in preview', async ({ page }) => {
  await openModal(page, 'lineChart');

  const before = await getChartOpts(page);
  // default is 'top' (from THEME position:"Top")
  expect(before?.legendPosition).toBe('top');

  await expandCard(page, 'Legend');
  const sel = propRow(page, 'Position').locator('select');
  await sel.selectOption('Bottom');
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.legendPosition).toBe('bottom');
});

test('pieChart: legend position Right → Bottom is rendered in preview', async ({ page }) => {
  await openModal(page, 'pieChart');

  const before = await getChartOpts(page);
  expect(before?.legendPosition).toBe('right');

  await expandCard(page, 'Legend');
  const sel = propRow(page, 'Position').locator('select');
  await sel.selectOption('Bottom');
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.legendPosition).toBe('bottom');
});

// ─── 3. Legend — label colour ────────────────────────────────────────────────

test('barChart: legend label colour change is rendered in preview', async ({ page }) => {
  await openModal(page, 'barChart');

  const before = await getChartOpts(page);
  // default is #444444
  expect(before?.legendColor?.toUpperCase()).toBe('#444444');

  await expandCard(page, 'Legend');
  const colorInp = propRow(page, 'Label Color').locator('input[type="color"]');
  await colorInp.fill('#ff0000');
  await colorInp.dispatchEvent('change');
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.legendColor?.toUpperCase()).toBe('#FF0000');
});

// ─── 4. Title — show / hide ──────────────────────────────────────────────────

test('lineChart: title show=OFF is rendered in preview', async ({ page }) => {
  await openModal(page, 'lineChart');

  const before = await getChartOpts(page);
  expect(before?.titleDisplay).toBe(true);

  // Title card is inside the modal — expand it
  await expandCard(page, 'Title');
  // Use evaluate to click toggle for the scroll-clipped Show Title row
  await page.evaluate(() => {
    const rows = document.querySelectorAll('.card-body.open .prop-row');
    for (const row of rows) {
      if (row.querySelector('.prop-label')?.textContent?.trim() === 'Show Title') {
        row.querySelector('.toggle')?.click();
        return;
      }
    }
  });
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.titleDisplay).toBe(false);
});

// ─── 5. Title — font colour ──────────────────────────────────────────────────

test('barChart: title font colour change is rendered in preview', async ({ page }) => {
  await openModal(page, 'barChart');

  const before = await getChartOpts(page);
  expect(before?.titleColor?.toUpperCase()).toBe('#0F4C81');

  await expandCard(page, 'Title');
  const colorInp = propRow(page, 'Font Color').locator('input[type="color"]');
  await colorInp.fill('#ff0000');
  await colorInp.dispatchEvent('change');
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.titleColor?.toUpperCase()).toBe('#FF0000');
});

// ─── 6. Category Axis — show / hide ──────────────────────────────────────────

test('lineChart: category axis show=OFF is rendered in preview', async ({ page }) => {
  await openModal(page, 'lineChart');

  const before = await getChartOpts(page);
  expect(before?.xDisplay).toBe(true);

  await expandCard(page, 'Category Axis');
  await propRow(page, 'Show Axis').locator('.toggle').click();
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.xDisplay).toBe(false);
});

test('clusteredColumnChart: category axis show=OFF is rendered in preview', async ({ page }) => {
  await openModal(page, 'clusteredColumnChart');

  const before = await getChartOpts(page);
  expect(before?.xDisplay).toBe(true);

  await expandCard(page, 'Category Axis');
  await propRow(page, 'Show Axis').locator('.toggle').click();
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.xDisplay).toBe(false);
});

// ─── 7. Value Axis — show / hide ─────────────────────────────────────────────

test('lineChart: value axis show=OFF is rendered in preview', async ({ page }) => {
  await openModal(page, 'lineChart');

  const before = await getChartOpts(page);
  expect(before?.yDisplay).toBe(true);

  await expandCard(page, 'Value Axis');
  await propRow(page, 'Show Axis').locator('.toggle').click();
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.yDisplay).toBe(false);
});

// ─── 8. Value Axis — gridlines show / hide ───────────────────────────────────

test('lineChart: value axis gridlines OFF is rendered in preview', async ({ page }) => {
  await openModal(page, 'lineChart');

  const before = await getChartOpts(page);
  // default: gridlines on for value axis
  expect(before?.yGridDisplay).toBe(true);

  await expandCard(page, 'Value Axis');
  await propRow(page, 'Show Gridlines').locator('.toggle').click();
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.yGridDisplay).toBe(false);
});

test('stackedBarChart: value axis gridlines OFF is rendered in preview', async ({ page }) => {
  await openModal(page, 'stackedBarChart');

  // stackedBarChart is horizontal (indexAxis:'y'): value axis = scales.x, category = scales.y
  const before = await getChartOpts(page);
  expect(before?.xGridDisplay).toBe(true);

  await expandCard(page, 'Value Axis');
  await propRow(page, 'Show Gridlines').locator('.toggle').click();
  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.xGridDisplay).toBe(false);
});

// ─── 9. Data colours affect chart bars / lines ───────────────────────────────

test('barChart: changing first data colour changes bar colour in preview', async ({ page }) => {
  await openModal(page, 'barChart');

  const before = await getChartOpts(page);
  // dataset0Bg is normalised to lowercase hex by getChartOpts
  expect(before?.dataset0Bg).toBe('#0f4c81');

  // Change data colour 1 in the global colour bar
  const colorInp = page.locator('#data-colors input[type="color"]').first();
  await colorInp.fill('#ff0000');
  await colorInp.dispatchEvent('input');   // updates THEME.dataColors[0]

  await applyAndWait(page);

  const after = await getChartOpts(page);
  expect(after?.dataset0Bg).toBe('#ff0000');
});

// ─── 10. Canvas-2D visuals: pixel output changes when colour is edited ────────

test('gauge: canvas changes when foreground colour is edited', async ({ page }) => {
  await openModal(page, 'gauge');
  const snap1 = await canvasSnapshot(page);

  await expandCard(page, 'Gauge');
  const colorInp = propRow(page, 'Foreground Color').locator('input[type="color"]');
  await colorInp.fill('#ff0000');
  await colorInp.dispatchEvent('change');
  await applyAndWait(page);

  const snap2 = await canvasSnapshot(page);
  // The canvas pixels must differ after the colour change
  expect(snap1.equals(snap2)).toBe(false);
});

test('slicer: canvas changes when header font colour is edited', async ({ page }) => {
  await openModal(page, 'slicer');
  const snap1 = await canvasSnapshot(page);

  await expandCard(page, 'Header');
  const colorInp = propRow(page, 'Font Color').locator('input[type="color"]');
  await colorInp.fill('#ff0000');
  await colorInp.dispatchEvent('change');
  await applyAndWait(page);

  const snap2 = await canvasSnapshot(page);
  expect(snap1.equals(snap2)).toBe(false);
});

test('tableEx: canvas changes when column header background colour is edited', async ({ page }) => {
  await openModal(page, 'tableEx');
  const snap1 = await canvasSnapshot(page);

  await expandCard(page, 'Column Headers');
  const colorInp = propRow(page, 'Background').locator('input[type="color"]');
  await colorInp.fill('#ff0000');
  await colorInp.dispatchEvent('change');
  await applyAndWait(page);

  const snap2 = await canvasSnapshot(page);
  expect(snap1.equals(snap2)).toBe(false);
});

test('kpi: canvas changes when data label colour is edited', async ({ page }) => {
  await openModal(page, 'kpi');
  const snap1 = await canvasSnapshot(page);

  await expandCard(page, 'Data Labels');
  const colorInp = propRow(page, 'Color').locator('input[type="color"]');
  await colorInp.fill('#ff0000');
  await colorInp.dispatchEvent('change');
  await applyAndWait(page);

  const snap2 = await canvasSnapshot(page);
  expect(snap1.equals(snap2)).toBe(false);
});

// ─── 11. Combination: multiple changes accumulate correctly ──────────────────

test('lineChart: hiding legend AND changing its colour both render correctly', async ({ page }) => {
  await openModal(page, 'lineChart');
  await expandCard(page, 'Legend');

  // Change colour first
  const colorInp = propRow(page, 'Label Color').locator('input[type="color"]');
  await colorInp.fill('#00ff00');
  await colorInp.dispatchEvent('change');

  // Then hide legend
  await propRow(page, 'Show Legend').locator('.toggle').click();
  await applyAndWait(page);

  const cfg = await getChartOpts(page);
  expect(cfg?.legendDisplay).toBe(false);
  expect(cfg?.legendColor?.toUpperCase()).toBe('#00FF00');
});

test('barChart: axis off + title colour change both render correctly', async ({ page }) => {
  await openModal(page, 'barChart');

  // Hide category axis
  await expandCard(page, 'Category Axis');
  await propRow(page, 'Show Axis').locator('.toggle').click();

  // Change title colour
  await expandCard(page, 'Title');
  const colorInp = propRow(page, 'Font Color').locator('input[type="color"]');
  await colorInp.fill('#ff00ff');
  await colorInp.dispatchEvent('change');

  await applyAndWait(page);

  const cfg = await getChartOpts(page);
  // For barChart (horizontal): category axis = y scale
  expect(cfg?.yDisplay).toBe(false);
  expect(cfg?.titleColor?.toUpperCase()).toBe('#FF00FF');
});
