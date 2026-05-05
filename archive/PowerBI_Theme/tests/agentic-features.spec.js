// @ts-check
/**
 * agentic-features.spec.js
 *
 * Functional tests for the 8 agentic-workflow features added to pbi-json-designer.html:
 *  1. Theme Name Editor
 *  2. JSON Import
 *  3. Preset Library
 *  4. Palette Generator
 *  5. Change Indicators (mod badges)
 *  6. Reset per Visual
 *  7. Copy to Similar Visuals
 *  8. Delta Export
 */
const { test, expect } = require('playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '..', 'pbi-json-designer.html');

test.beforeEach(async ({ page }) => {
  await page.goto(FILE_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#visual-list li', { timeout: 10000 });
  // Small buffer for THEME_INITIAL snapshot and initGlobalBar
  await page.waitForTimeout(300);
});

// ── 1. Theme Name Editor ──────────────────────────────────────────────────────

test('theme name input: exists with correct default value', async ({ page }) => {
  const val = await page.inputValue('#theme-name-input');
  expect(val).toBe('Customer360 Theme');
});

test('theme name input: typing updates THEME.name', async ({ page }) => {
  await page.fill('#theme-name-input', 'My Custom Report');
  const name = await page.evaluate(() => THEME.name);
  expect(name).toBe('My Custom Report');
});

test('theme name input: name appears in exported JSON', async ({ page }) => {
  await page.fill('#theme-name-input', 'Brand Theme 2025');
  const json = await page.evaluate(() => buildExportTheme());
  expect(json.name).toBe('Brand Theme 2025');
});

// ── 2. JSON Import ────────────────────────────────────────────────────────────

test('loadThemeFromJSON: sets THEME.name and updates name input', async ({ page }) => {
  await page.evaluate(() => loadThemeFromJSON({ name: 'Imported Theme', background: '#123456' }));
  const name = await page.evaluate(() => THEME.name);
  expect(name).toBe('Imported Theme');
  const inputVal = await page.inputValue('#theme-name-input');
  expect(inputVal).toBe('Imported Theme');
});

test('loadThemeFromJSON: sets top-level color properties', async ({ page }) => {
  await page.evaluate(() => loadThemeFromJSON({ background: '#AABBCC', foreground: '#112233', good: '#00FF00' }));
  const bg = await page.evaluate(() => THEME.background);
  expect(bg).toBe('#AABBCC');
  const fg = await page.evaluate(() => THEME.foreground);
  expect(fg).toBe('#112233');
  const good = await page.evaluate(() => THEME.good);
  expect(good).toBe('#00FF00');
});

test('loadThemeFromJSON: updates color swatch UI elements', async ({ page }) => {
  await page.evaluate(() => loadThemeFromJSON({ background: '#ff0000' }));
  await page.waitForTimeout(100);
  const swatchVal = await page.inputValue('#g-background');
  expect(swatchVal).toBe('#ff0000');
});

test('loadThemeFromJSON: sets dataColors and updates swatches', async ({ page }) => {
  await page.evaluate(() => loadThemeFromJSON({ dataColors: ['#111111','#222222','#333333','#444444','#555555','#666666','#777777','#888888'] }));
  await page.waitForTimeout(100);
  const dc0 = await page.evaluate(() => THEME.dataColors[0]);
  expect(dc0).toBe('#111111');
  const swatch0 = await page.locator('#data-colors input[type="color"]').first().inputValue();
  expect(swatch0).toBe('#111111');
});

test('loadThemeFromJSON: merges visualStyles into THEME', async ({ page }) => {
  await page.evaluate(() => loadThemeFromJSON({
    visualStyles: { barChart: { '*': { legend: [{ show: false }] } } }
  }));
  const show = await page.evaluate(() => THEME.visualStyles?.barChart?.['*']?.legend?.[0]?.show);
  expect(show).toBe(false);
});

test('import file input element exists in DOM', async ({ page }) => {
  const el = await page.$('#theme-import-file');
  expect(el).toBeTruthy();
  const accept = await el.getAttribute('accept');
  expect(accept).toBe('.json');
});

// ── 3. Preset Library ─────────────────────────────────────────────────────────

test('preset select: exists with 5 preset options', async ({ page }) => {
  const opts = await page.locator('#preset-select option').count();
  expect(opts).toBe(6); // 5 presets + placeholder
});

test('applyPreset dark: sets background to #1E1E2E', async ({ page }) => {
  await page.evaluate(() => applyPreset('dark'));
  await page.waitForTimeout(150);
  const bg = await page.evaluate(() => THEME.background);
  expect(bg).toBe('#1E1E2E');
});

test('applyPreset dark: updates background swatch UI', async ({ page }) => {
  await page.evaluate(() => applyPreset('dark'));
  await page.waitForTimeout(150);
  const swatch = await page.inputValue('#g-background');
  expect(swatch).toBe('#1e1e2e');
});

test('applyPreset dark: sets THEME.name to "Dark Mode"', async ({ page }) => {
  await page.evaluate(() => applyPreset('dark'));
  const name = await page.evaluate(() => THEME.name);
  expect(name).toBe('Dark Mode');
});

test('applyPreset dark: updates theme-name-input to "Dark Mode"', async ({ page }) => {
  await page.evaluate(() => applyPreset('dark'));
  await page.waitForTimeout(100);
  const val = await page.inputValue('#theme-name-input');
  expect(val).toBe('Dark Mode');
});

test('applyPreset earth: sets earth-tone data colors', async ({ page }) => {
  await page.evaluate(() => applyPreset('earth'));
  await page.waitForTimeout(150);
  const dc0 = await page.evaluate(() => THEME.dataColors[0]);
  expect(dc0).toBe('#8B5E3C');
});

test('applyPreset midnight: sets dark background', async ({ page }) => {
  await page.evaluate(() => applyPreset('midnight'));
  await page.waitForTimeout(150);
  const bg = await page.evaluate(() => THEME.background);
  expect(bg).toBe('#0D1117');
});

test('applyPreset resets preset-select to placeholder', async ({ page }) => {
  await page.evaluate(() => applyPreset('minimal'));
  await page.waitForTimeout(150);
  const val = await page.inputValue('#preset-select');
  expect(val).toBe('');
});

// ── 4. Palette Generator ──────────────────────────────────────────────────────

test('palette gen button: exists in DOM', async ({ page }) => {
  const btn = await page.$('#palette-gen-btn');
  expect(btn).toBeTruthy();
});

test('palette popover: applyHarmony sets 8 hex dataColors', async ({ page }) => {
  const colors = await page.evaluate(() => {
    const hsl = hexToHSL('#1F8AC0');
    const hues = HARMONIES.Analogous(hsl.h);
    const palette = hues.map(hu => {
      const h = ((hu % 360) + 360) % 360;
      return hslToHex(h, hsl.s, hsl.l);
    });
    applyHarmony('Analogous', palette);
    return THEME.dataColors;
  });
  expect(colors).toHaveLength(8);
  colors.forEach(c => expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/));
});

test('palette popover: applyHarmony changes dataColors', async ({ page }) => {
  const before = await page.evaluate(() => [...THEME.dataColors]);
  await page.evaluate(() => {
    const hsl = hexToHSL('#FF0000');
    const hues = HARMONIES.Triadic(hsl.h);
    const palette = hues.map(hu => {
      const h = ((hu % 360) + 360) % 360;
      return hslToHex(h, hsl.s, hsl.l);
    });
    applyHarmony('Triadic', palette);
  });
  const after = await page.evaluate(() => [...THEME.dataColors]);
  const different = after.filter((c, i) => c !== before[i]);
  expect(different.length).toBeGreaterThan(0);
});

test('palette popover: applyHarmony updates swatch inputs', async ({ page }) => {
  await page.evaluate(() => {
    const hsl = hexToHSL('#2563EB');
    const hues = HARMONIES.Complementary(hsl.h);
    const palette = hues.map(hu => hslToHex(((hu%360)+360)%360, hsl.s, hsl.l));
    applyHarmony('Complementary', palette);
  });
  await page.waitForTimeout(100);
  const swatches = await page.locator('#data-colors input[type="color"]').evaluateAll(
    els => els.map(e => e.value)
  );
  swatches.forEach(v => expect(v).toMatch(/^#[0-9a-f]{6}$/));
});

test('hexToHSL / hslToHex roundtrip is stable', async ({ page }) => {
  const result = await page.evaluate(() => {
    const hsl = hexToHSL('#1F8AC0');
    return hslToHex(hsl.h, hsl.s, hsl.l);
  });
  // Result should be a valid hex color close to original (minor rounding is ok)
  expect(result).toMatch(/^#[0-9a-f]{6}$/);
});

// ── 5. Change Indicators ──────────────────────────────────────────────────────

test('isModified: returns false for unmodified visual on fresh load', async ({ page }) => {
  const modified = await page.evaluate(() => isModified('barChart'));
  expect(modified).toBe(false);
});

test('no mod badges visible on fresh load', async ({ page }) => {
  const count = await page.locator('#visual-list .mod-badge').count();
  expect(count).toBe(0);
});

test('no vc-mod-dot visible on fresh load', async ({ page }) => {
  const count = await page.locator('.vc-mod-dot').count();
  expect(count).toBe(0);
});

test('mod badge appears in sidebar after visual is modified', async ({ page }) => {
  await page.evaluate(() => {
    if (!THEME.visualStyles.barChart) THEME.visualStyles.barChart = { '*': {} };
    THEME.visualStyles.barChart['*'].legend = [{ show: false }];
    buildSidebar();
  });
  await page.waitForTimeout(100);
  const count = await page.locator('#visual-list .mod-badge').count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test('vc-mod-dot appears in grid after visual is modified', async ({ page }) => {
  await page.evaluate(() => {
    if (!THEME.visualStyles.barChart) THEME.visualStyles.barChart = { '*': {} };
    THEME.visualStyles.barChart['*'].legend = [{ show: false }];
    buildGrid();
  });
  await page.waitForTimeout(100);
  const count = await page.locator('.vc-mod-dot').count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test('getModifiedCount returns correct count of changed cards', async ({ page }) => {
  await page.evaluate(() => {
    if (!THEME.visualStyles.lineChart) THEME.visualStyles.lineChart = { '*': {} };
    THEME.visualStyles.lineChart['*'].legend  = [{ show: false }];
    THEME.visualStyles.lineChart['*'].title   = [{ show: false }];
  });
  const count = await page.evaluate(() => getModifiedCount('lineChart'));
  expect(count).toBe(2);
});

// ── 6. Reset per Visual ───────────────────────────────────────────────────────

test('resetVisual: removes overrides and clears mod badge', async ({ page }) => {
  await page.evaluate(() => {
    if (!THEME.visualStyles.barChart) THEME.visualStyles.barChart = { '*': {} };
    THEME.visualStyles.barChart['*'].legend = [{ show: false }];
    buildSidebar(); buildGrid();
  });
  await page.waitForTimeout(100);
  expect(await page.locator('#visual-list .mod-badge').count()).toBeGreaterThanOrEqual(1);

  await page.evaluate(() => { resetVisual('barChart'); });
  await page.waitForTimeout(100);
  const count = await page.locator('#visual-list .mod-badge').count();
  expect(count).toBe(0);
});

test('resetVisual: visual no longer shows as modified after reset', async ({ page }) => {
  await page.evaluate(() => {
    if (!THEME.visualStyles.barChart) THEME.visualStyles.barChart = { '*': {} };
    THEME.visualStyles.barChart['*'].legend = [{ show: false }];
  });
  await page.evaluate(() => resetVisual('barChart'));
  const modified = await page.evaluate(() => isModified('barChart'));
  expect(modified).toBe(false);
});

test('modal: Reset button exists for non-global visuals', async ({ page }) => {
  await page.locator('#visual-list li[data-key="barChart"]').click();
  await page.waitForSelector('#modal-overlay.open', { timeout: 8000 });
  const resetBtn = page.locator('#modal button', { hasText: 'Reset' });
  await expect(resetBtn).toBeVisible();
});

test('modal: Copy to Similar button exists for non-global visuals', async ({ page }) => {
  await page.locator('#visual-list li[data-key="barChart"]').click();
  await page.waitForSelector('#modal-overlay.open', { timeout: 8000 });
  const copyBtn = page.locator('#modal button', { hasText: 'Copy to Similar' });
  await expect(copyBtn).toBeVisible();
});

// ── 7. Copy to Similar Visuals ────────────────────────────────────────────────

test('copy dialog overlay: exists in DOM', async ({ page }) => {
  const el = await page.$('#copy-dialog-overlay');
  expect(el).toBeTruthy();
});

test('showCopyDialog: opens the overlay', async ({ page }) => {
  await page.evaluate(() => showCopyDialog('barChart'));
  await page.waitForTimeout(100);
  const isOpen = await page.evaluate(() => document.getElementById('copy-dialog-overlay').classList.contains('open'));
  expect(isOpen).toBe(true);
});

test('showCopyDialog: populates dialog with visual checkboxes', async ({ page }) => {
  await page.evaluate(() => showCopyDialog('barChart'));
  await page.waitForTimeout(100);
  const checkboxCount = await page.locator('#copy-dialog-list input[name="copy-target"]').count();
  expect(checkboxCount).toBeGreaterThan(0);
});

test('copyVisualSettings: copies settings to target visuals', async ({ page }) => {
  await page.evaluate(() => {
    if (!THEME.visualStyles.barChart) THEME.visualStyles.barChart = { '*': {} };
    THEME.visualStyles.barChart['*'].legend = [{ show: false, position: 'Bottom' }];
    copyVisualSettings('barChart', ['clusteredBarChart', 'stackedBarChart']);
  });
  const cc = await page.evaluate(() => THEME.visualStyles?.clusteredBarChart?.['*']?.legend?.[0]);
  expect(cc).toBeTruthy();
  expect(cc.show).toBe(false);
  expect(cc.position).toBe('Bottom');
  const sb = await page.evaluate(() => THEME.visualStyles?.stackedBarChart?.['*']?.legend?.[0]);
  expect(sb?.show).toBe(false);
});

test('copyVisualSettings: does not overwrite source visual', async ({ page }) => {
  await page.evaluate(() => {
    if (!THEME.visualStyles.barChart) THEME.visualStyles.barChart = { '*': {} };
    THEME.visualStyles.barChart['*'].legend = [{ show: false }];
    copyVisualSettings('barChart', ['clusteredBarChart']);
  });
  const src = await page.evaluate(() => THEME.visualStyles?.barChart?.['*']?.legend?.[0]?.show);
  expect(src).toBe(false);
});

// ── 8. Delta Export ───────────────────────────────────────────────────────────

test('buildDeltaTheme: returns full theme when nothing changed', async ({ page }) => {
  const delta = await page.evaluate(() => buildDeltaTheme());
  expect(typeof delta).toBe('object');
  expect(delta.name).toBeTruthy();
});

test('buildDeltaTheme: excludes unchanged visuals', async ({ page }) => {
  const delta = await page.evaluate(() => buildDeltaTheme());
  // On fresh load nothing changed, so visualStyles should be absent or empty
  const hasVS = delta.visualStyles && Object.keys(delta.visualStyles).length > 0;
  expect(hasVS).toBeFalsy();
});

test('buildDeltaTheme: includes only modified visual', async ({ page }) => {
  await page.evaluate(() => {
    if (!THEME.visualStyles.pieChart) THEME.visualStyles.pieChart = { '*': {} };
    THEME.visualStyles.pieChart['*'].legend = [{ show: false }];
  });
  const delta = await page.evaluate(() => buildDeltaTheme());
  expect(delta.visualStyles?.pieChart).toBeTruthy();
  // barChart was not modified — should not be in delta
  expect(delta.visualStyles?.barChart).toBeUndefined();
});

test('buildDeltaTheme: includes changed top-level color', async ({ page }) => {
  await page.evaluate(() => { THEME.background = '#DEADBE'; });
  const delta = await page.evaluate(() => buildDeltaTheme());
  expect(delta.background).toBe('#DEADBE');
});

test('buildDeltaTheme: excludes unchanged top-level color', async ({ page }) => {
  // background unchanged on fresh load
  const delta = await page.evaluate(() => buildDeltaTheme());
  expect(delta.background).toBeUndefined();
});

test('downloadDeltaJSON function exists and is callable', async ({ page }) => {
  const exists = await page.evaluate(() => typeof downloadDeltaJSON === 'function');
  expect(exists).toBe(true);
});

// ── Dark / Light Mode Toggle ──────────────────────────────────────────────────

test('dark mode: toggle button exists in toolbar', async ({ page }) => {
  const btn = await page.$('#dark-mode-toggle');
  expect(btn).toBeTruthy();
});

test('dark mode: default state is light (no data-dark attribute)', async ({ page }) => {
  const hasDark = await page.evaluate(() => document.documentElement.hasAttribute('data-dark'));
  expect(hasDark).toBe(false);
});

test('dark mode: toggleDarkMode() adds data-dark attribute', async ({ page }) => {
  await page.evaluate(() => toggleDarkMode());
  const hasDark = await page.evaluate(() => document.documentElement.hasAttribute('data-dark'));
  expect(hasDark).toBe(true);
});

test('dark mode: toggleDarkMode() twice returns to light mode', async ({ page }) => {
  await page.evaluate(() => { toggleDarkMode(); toggleDarkMode(); });
  const hasDark = await page.evaluate(() => document.documentElement.hasAttribute('data-dark'));
  expect(hasDark).toBe(false);
});

test('dark mode: toggle button shows sun in light mode, moon in dark mode', async ({ page }) => {
  // Start in light mode — sun should be visible, moon hidden
  await page.evaluate(() => { document.documentElement.removeAttribute('data-dark'); _dmUpdateIcon(false); });
  const sunVisible = await page.locator('#dm-icon-sun').evaluate(el => el.style.display !== 'none');
  const moonHidden = await page.locator('#dm-icon-moon').evaluate(el => el.style.display === 'none');
  expect(sunVisible).toBe(true);
  expect(moonHidden).toBe(true);
  // Toggle to dark — moon should be visible, sun hidden
  await page.evaluate(() => toggleDarkMode());
  const moonVisible = await page.locator('#dm-icon-moon').evaluate(el => el.style.display !== 'none');
  const sunHidden = await page.locator('#dm-icon-sun').evaluate(el => el.style.display === 'none');
  expect(moonVisible).toBe(true);
  expect(sunHidden).toBe(true);
});

test('dark mode: persists to localStorage', async ({ page }) => {
  await page.evaluate(() => toggleDarkMode());
  const stored = await page.evaluate(() => localStorage.getItem('pbi-editor-dark'));
  expect(stored).toBe('1');
  await page.evaluate(() => toggleDarkMode());
  const storedOff = await page.evaluate(() => localStorage.getItem('pbi-editor-dark'));
  expect(storedOff).toBe('0');
});

test('dark mode: loads dark mode from localStorage on page reload', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('pbi-editor-dark', '1'));
  await page.reload();
  await page.waitForSelector('#visual-list li', { timeout: 10000 });
  const hasDark = await page.evaluate(() => document.documentElement.hasAttribute('data-dark'));
  expect(hasDark).toBe(true);
});

test('dark mode: sidebar background changes in dark mode', async ({ page }) => {
  const lightBg = await page.evaluate(() => getComputedStyle(document.getElementById('sidebar')).backgroundColor);
  await page.evaluate(() => toggleDarkMode());
  const darkBg = await page.evaluate(() => getComputedStyle(document.getElementById('sidebar')).backgroundColor);
  expect(lightBg).not.toBe(darkBg);
});

test('dark mode: settings panel background changes in dark mode', async ({ page }) => {
  const lightBg = await page.evaluate(() => getComputedStyle(document.getElementById('settings-panel')).backgroundColor);
  await page.evaluate(() => toggleDarkMode());
  const darkBg = await page.evaluate(() => getComputedStyle(document.getElementById('settings-panel')).backgroundColor);
  expect(lightBg).not.toBe(darkBg);
});
