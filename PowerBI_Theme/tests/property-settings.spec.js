// @ts-check
const { test, expect } = require('playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '..', 'theme_editor.html');

// ── Helpers ──────────────────────────────────────────────────────────────────

async function openModal(page, visualKey) {
  const item = page.locator(`#visual-list li[data-key="${visualKey}"]`);
  await item.click();
  await page.waitForSelector('#modal-overlay.open', { timeout: 8000 });
}

async function closeModal(page) {
  await page.evaluate(() => closeEditModal());
  await page.waitForFunction(
    () => !document.getElementById('modal-overlay').classList.contains('open'),
    { timeout: 5000 }
  );
}

/** Expand a card section by its humanised label. */
async function expandCard(page, labelText) {
  const hdr = page.locator('.card-header', { hasText: new RegExp(`^${labelText}`) }).first();
  const isOpen = await hdr.evaluate(el => el.classList.contains('open'));
  if (!isOpen) await hdr.click();
  await page.waitForTimeout(120);
}

/** First prop-row whose label matches text inside an open card body. */
function propRow(page, labelText) {
  return page.locator('.card-body.open .prop-row', { hasText: labelText }).first();
}

/** Click the toggle label (not the hidden checkbox) to flip boolean. */
async function clickToggle(row) {
  await row.locator('.toggle').click();
}

/** Get the resolved color from a stored value (string or { solid:{color} }). */
function resolveColor(v) {
  return typeof v === 'string' ? v : v?.solid?.color ?? v;
}

// ── Suite ─────────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto(FILE_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#visual-list li', { timeout: 10000 });
});

// ─── 1. Page structure ───────────────────────────────────────────────────────

test('sidebar lists all visuals', async ({ page }) => {
  const count = await page.locator('#visual-list li').count();
  expect(count).toBeGreaterThan(25);
  await expect(page.locator('#visual-list li[data-key="barChart"]')).toBeVisible();
  await expect(page.locator('#visual-list li[data-key="*"]')).toBeVisible();
});

test('visual grid renders cards', async ({ page }) => {
  await expect(page.locator('#visual-grid')).toBeVisible();
  const count = await page.locator('.vis-card').count();
  expect(count).toBeGreaterThan(20);
});

test('sidebar search filters list', async ({ page }) => {
  await page.locator('#sidebar-search').fill('Bar');
  const count = await page.locator('#visual-list li').count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(15);
});

// ─── 2. Modal opens / closes ─────────────────────────────────────────────────

test('clicking sidebar item opens modal', async ({ page }) => {
  await openModal(page, 'barChart');
  await expect(page.locator('#modal-overlay')).toHaveClass(/open/);
  await expect(page.locator('#modal-title')).toContainText('Bar Chart');
});

test('clicking grid card opens modal', async ({ page }) => {
  const card = page.locator('.vis-card', { hasText: 'Line Chart' }).first();
  await card.click();
  await page.waitForSelector('#modal-overlay.open');
  await expect(page.locator('#modal-title')).toContainText('Line Chart');
});

test('modal closes on overlay click', async ({ page }) => {
  await openModal(page, 'barChart');
  await page.locator('#modal-overlay').click({ position: { x: 5, y: 5 } });
  await page.waitForFunction(
    () => !document.getElementById('modal-overlay').classList.contains('open')
  );
  await expect(page.locator('#modal-overlay')).not.toHaveClass(/open/);
});

// ─── 3. Boolean toggles update THEME ─────────────────────────────────────────

test('barChart › legend show toggle → THEME', async ({ page }) => {
  await openModal(page, 'barChart');
  await expandCard(page, 'Legend');
  const row = propRow(page, 'Show Legend');
  const cb = row.locator('input[type="checkbox"]');
  const wasBefore = await cb.isChecked();
  await clickToggle(row);
  const val = await page.evaluate(() => getCardData('barChart', 'legend').show);
  expect(val).toBe(!wasBefore);
});

test('global (*) › title bold toggle → THEME', async ({ page }) => {
  await openModal(page, '*');

  // Expand Title card + click its Bold toggle via evaluate (avoids scroll-container clip)
  const flipped = await page.evaluate(() => {
    // Expand title card if closed
    const hdrs = [...document.querySelectorAll('.card-header')];
    const titleHdr = hdrs.find(h => h.textContent.trim().startsWith('Title'));
    if (titleHdr && !titleHdr.classList.contains('open')) titleHdr.click();

    // Small pause so DOM updates, then find Bold toggle
    return new Promise(resolve => {
      setTimeout(() => {
        const rows = document.querySelectorAll('.card-body.open .prop-row');
        for (const row of rows) {
          const lbl = row.querySelector('.prop-label');
          if (lbl && lbl.textContent.trim() === 'Bold') {
            const inp = row.querySelector('input[type="checkbox"]');
            const before = inp ? inp.checked : null;
            row.querySelector('.toggle')?.click();
            resolve({ before, after: inp ? inp.checked : null });
            return;
          }
        }
        resolve(null);
      }, 150);
    });
  });

  expect(flipped).not.toBeNull();
  expect(flipped.after).toBe(!flipped.before);

  // Verify THEME was updated
  const themeVal = await page.evaluate(() => getCardData('*', 'title').bold);
  expect(themeVal).toBe(flipped.after);
});

test('matrix › subtotals rowSubtotals toggle → THEME', async ({ page }) => {
  await openModal(page, 'matrix');
  await expandCard(page, 'Subtotals');
  const row = propRow(page, 'Row Subtotals');
  const cb = row.locator('input[type="checkbox"]');
  const before = await cb.isChecked();
  await clickToggle(row);
  const val = await page.evaluate(() => getCardData('matrix', 'subtotals').rowSubtotals);
  expect(val).toBe(!before);
});

test('slicer › selection singleSelect toggle → THEME', async ({ page }) => {
  await openModal(page, 'slicer');
  await expandCard(page, 'Selection');
  const row = propRow(page, 'Single Select');
  const cb = row.locator('input[type="checkbox"]');
  const before = await cb.isChecked();
  await clickToggle(row);
  const val = await page.evaluate(() => getCardData('slicer', 'selection').singleSelect);
  expect(val).toBe(!before);
});

test('kpi › indicator show toggle → THEME', async ({ page }) => {
  await openModal(page, 'kpi');
  await expandCard(page, 'Indicator');
  const row = propRow(page, 'Show Indicator');
  const cb = row.locator('input[type="checkbox"]');
  const before = await cb.isChecked();
  await clickToggle(row);
  const val = await page.evaluate(() => getCardData('kpi', 'indicator').show);
  expect(val).toBe(!before);
});

test('tableEx › grid gridHorizontal toggle → THEME', async ({ page }) => {
  await openModal(page, 'tableEx');
  await expandCard(page, 'Grid');
  const row = propRow(page, 'Horizontal Gridlines');
  const cb = row.locator('input[type="checkbox"]');
  const before = await cb.isChecked();
  await clickToggle(row);
  const val = await page.evaluate(() => getCardData('tableEx', 'grid').gridHorizontal);
  expect(val).toBe(!before);
});

// ─── 4. Number inputs update THEME ───────────────────────────────────────────

test('barChart › legend fontSize → THEME', async ({ page }) => {
  await openModal(page, 'barChart');
  await expandCard(page, 'Legend');
  const inp = propRow(page, 'Font Size').locator('input[type="number"]');
  await inp.fill('14');
  await inp.dispatchEvent('change');
  const val = await page.evaluate(() => getCardData('barChart', 'legend').fontSize);
  expect(val).toBe(14);
});

test('global (*) › title fontSize → THEME', async ({ page }) => {
  await openModal(page, '*');
  await expandCard(page, 'Title');
  const inp = propRow(page, 'Font Size').locator('input[type="number"]');
  await inp.fill('20');
  await inp.dispatchEvent('change');
  const val = await page.evaluate(() => getCardData('*', 'title').fontSize);
  expect(val).toBe(20);
});

test('gauge › arcAngle → THEME', async ({ page }) => {
  await openModal(page, 'gauge');
  await expandCard(page, 'Gauge');
  const inp = propRow(page, 'Arc Angle').locator('input[type="number"]');
  await inp.fill('180');
  await inp.dispatchEvent('change');
  const val = await page.evaluate(() => getCardData('gauge', 'gauge').arcAngle);
  expect(val).toBe(180);
});

test('matrix › grid rowPadding → THEME', async ({ page }) => {
  await openModal(page, 'matrix');
  await expandCard(page, 'Grid');
  const inp = propRow(page, 'Row Padding').locator('input[type="number"]');
  await inp.fill('8');
  await inp.dispatchEvent('change');
  const val = await page.evaluate(() => getCardData('matrix', 'grid').rowPadding);
  expect(val).toBe(8);
});

test('lineChart › lineStyles strokeWidth → THEME', async ({ page }) => {
  await openModal(page, 'lineChart');
  await expandCard(page, 'Line Styles');
  const inp = propRow(page, 'Line Width').locator('input[type="number"]');
  await inp.fill('4');
  await inp.dispatchEvent('change');
  const val = await page.evaluate(() => getCardData('lineChart', 'lineStyles').strokeWidth);
  expect(val).toBe(4);
});

test('donutChart › innerRadius innerRadiusRatio → THEME', async ({ page }) => {
  await openModal(page, 'donutChart');
  await expandCard(page, 'Inner Radius');
  const inp = propRow(page, 'Inner Radius %').locator('input[type="number"]');
  await inp.fill('60');
  await inp.dispatchEvent('change');
  const val = await page.evaluate(() => getCardData('donutChart', 'innerRadius').innerRadiusRatio);
  expect(val).toBe(60);
});

// ─── 5. Color pickers update THEME ───────────────────────────────────────────

test('barChart › legend labelColor → THEME', async ({ page }) => {
  await openModal(page, 'barChart');
  await expandCard(page, 'Legend');
  const inp = propRow(page, 'Label Color').locator('input[type="color"]');
  await inp.fill('#ff0000');
  await inp.dispatchEvent('change');
  const raw = await page.evaluate(() => getCardData('barChart', 'legend').labelColor);
  expect(resolveColor(raw)).toBe('#FF0000');
});

test('global (*) › title fontColor → THEME', async ({ page }) => {
  await openModal(page, '*');
  await expandCard(page, 'Title');
  const inp = propRow(page, 'Font Color').locator('input[type="color"]');
  await inp.fill('#00ff00');
  await inp.dispatchEvent('change');
  const raw = await page.evaluate(() => getCardData('*', 'title').fontColor);
  expect(resolveColor(raw)).toBe('#00FF00');
});

test('tableEx › columnHeaders background → THEME', async ({ page }) => {
  await openModal(page, 'tableEx');
  await expandCard(page, 'Column Headers');
  const inp = propRow(page, 'Background').locator('input[type="color"]');
  await inp.fill('#1234ab');
  await inp.dispatchEvent('change');
  const raw = await page.evaluate(() => getCardData('tableEx', 'columnHeaders').background);
  expect(resolveColor(raw)).toBe('#1234AB');
});

test('waterfallChart › sentimentColors increase → THEME', async ({ page }) => {
  await openModal(page, 'waterfallChart');
  await expandCard(page, 'Sentiment Colors');
  const inp = propRow(page, 'Increase Color').locator('input[type="color"]');
  await inp.fill('#aabbcc');
  await inp.dispatchEvent('change');
  const raw = await page.evaluate(() => getCardData('waterfallChart', 'sentimentColors').increaseFill);
  expect(resolveColor(raw)).toBe('#AABBCC');
});

test('gauge › gauge foregroundColor → THEME', async ({ page }) => {
  await openModal(page, 'gauge');
  await expandCard(page, 'Gauge');
  const inp = propRow(page, 'Foreground Color').locator('input[type="color"]');
  await inp.fill('#123456');
  await inp.dispatchEvent('change');
  const raw = await page.evaluate(() => getCardData('gauge', 'gauge').foregroundColor);
  expect(resolveColor(raw)).toBe('#123456');
});

// ─── 6. Select / Enum controls update THEME ──────────────────────────────────

test('barChart › legend position select → THEME', async ({ page }) => {
  await openModal(page, 'barChart');
  await expandCard(page, 'Legend');
  const sel = propRow(page, 'Position').locator('select');
  await sel.selectOption('Bottom');
  const val = await page.evaluate(() => getCardData('barChart', 'legend').position);
  expect(val).toBe('Bottom');
});

test('global (*) › title alignment select → THEME', async ({ page }) => {
  await openModal(page, '*');
  await expandCard(page, 'Title');
  const sel = propRow(page, 'Alignment').locator('select');
  await sel.selectOption('center');
  const val = await page.evaluate(() => getCardData('*', 'title').alignment);
  expect(val).toBe('center');
});

test('slicer › data mode select → THEME', async ({ page }) => {
  await openModal(page, 'slicer');
  await expandCard(page, 'Data');
  const sel = propRow(page, 'Slicer Mode').locator('select');
  await sel.selectOption('Dropdown');
  const val = await page.evaluate(() => getCardData('slicer', 'data').mode);
  expect(val).toBe('Dropdown');
});

test('tableEx › values alignment select → THEME', async ({ page }) => {
  await openModal(page, 'tableEx');
  await expandCard(page, 'Values');
  const sel = propRow(page, 'Alignment').locator('select');
  await sel.selectOption('right');
  const val = await page.evaluate(() => getCardData('tableEx', 'values').alignment);
  expect(val).toBe('right');
});

test('barChart › legend fontFamily select → THEME', async ({ page }) => {
  await openModal(page, 'barChart');
  await expandCard(page, 'Legend');
  const sel = propRow(page, 'Font Family').locator('select');
  await sel.selectOption('Calibri');
  const val = await page.evaluate(() => getCardData('barChart', 'legend').fontFamily);
  expect(val).toBe('Calibri');
});

test('matrix › subtotals outline select → THEME', async ({ page }) => {
  await openModal(page, 'matrix');
  await expandCard(page, 'Subtotals');
  // "Outline" label matches multiple rows — scope to the Subtotals card specifically
  const subtotalsCard = page.locator('.card', {
    has: page.locator('.card-header', { hasText: /^Subtotals/ }),
  });
  await page.waitForSelector('.card-body.open .prop-row:has-text("Outline")', { timeout: 5000 });
  const sel = subtotalsCard.locator('.card-body.open .prop-row', { hasText: 'Outline' }).first().locator('select');
  await sel.selectOption('Frame');
  const val = await page.evaluate(() => getCardData('matrix', 'subtotals').outline);
  expect(val).toBe('Frame');
});

// ─── 7. JSON preview reflects changes ────────────────────────────────────────

test('JSON preview updates on legend position change', async ({ page }) => {
  await page.locator('#json-toggle-btn').click();
  await expect(page.locator('#json-panel')).toHaveClass(/open/);
  await openModal(page, 'barChart');
  await expandCard(page, 'Legend');
  const sel = propRow(page, 'Position').locator('select');
  await sel.selectOption('Right');
  const json = await page.locator('#json-output').textContent();
  expect(json).toContain('"position"');
});

test('JSON preview contains full THEME after visual opened', async ({ page }) => {
  // Opening a visual triggers updateJSON
  await openModal(page, 'barChart');
  await closeModal(page);
  await page.locator('#json-toggle-btn').click();
  const json = await page.locator('#json-output').textContent();
  expect(json).toContain('"visualStyles"');
  expect(json).toContain('"dataColors"');
});

// ─── 8. Changes are isolated per visual ──────────────────────────────────────

test('barChart and lineChart legend font sizes are independent', async ({ page }) => {
  await openModal(page, 'barChart');
  await expandCard(page, 'Legend');
  const inp1 = propRow(page, 'Font Size').locator('input[type="number"]');
  await inp1.fill('16');
  await inp1.dispatchEvent('change');
  await closeModal(page);

  await openModal(page, 'lineChart');
  await expandCard(page, 'Legend');
  const inp2 = propRow(page, 'Font Size').locator('input[type="number"]');
  await inp2.fill('9');
  await inp2.dispatchEvent('change');
  await closeModal(page);

  const [bar, line] = await page.evaluate(() => [
    getCardData('barChart', 'legend').fontSize,
    getCardData('lineChart', 'legend').fontSize,
  ]);
  expect(bar).toBe(16);
  expect(line).toBe(9);
});

// ─── 9. Global color bar updates THEME directly ──────────────────────────────

test('global bar background color → THEME', async ({ page }) => {
  const inp = page.locator('#g-background');
  await inp.fill('#112233');
  await inp.dispatchEvent('input');
  const val = await page.evaluate(() => THEME.background);
  expect(val).toBe('#112233');
});

test('global bar foreground color → THEME', async ({ page }) => {
  const inp = page.locator('#g-foreground');
  await inp.fill('#aabbcc');
  await inp.dispatchEvent('input');
  const val = await page.evaluate(() => THEME.foreground);
  expect(val).toBe('#AABBCC');
});

// ─── 10. All schema visuals open without JS errors ───────────────────────────

test('all schema visuals open modal successfully', async ({ page }) => {
  const keys = await page.evaluate(
    () => Object.keys(VISUAL_SCHEMA).filter(k => k !== '__page__')
  );

  for (const key of keys) {
    const item = page.locator(`#visual-list li[data-key="${key}"]`);
    if (await item.count() === 0) continue;

    await item.click();
    await page.waitForSelector('#modal-overlay.open', { timeout: 6000 });

    // At least one property card must render
    const cardCount = await page.locator('.card').count();
    expect(cardCount, `${key} should render at least one card`).toBeGreaterThan(0);

    // Modal title must show a non-empty label
    const title = await page.locator('#modal-title').textContent();
    expect(title?.trim().length, `${key} modal title must not be empty`).toBeGreaterThan(0);

    await closeModal(page);
  }
});
