// @ts-check
/**
 * json-output.spec.js — JSON Correctness Tests
 *
 * Verifies that property changes in the UI are correctly reflected
 * in the exported JSON theme at the correct path.
 */
import { test, expect } from '@playwright/test';

/** Open JSON panel and return parsed JSON */
async function getJson(page) {
  const raw = await page.locator('[data-testid="json-raw"]').textContent();
  return JSON.parse(raw);
}

/** Ensure JSON panel is open */
async function openJsonPanel(page) {
  const panel = page.locator('[data-testid="json-raw"]');
  if (await panel.count() === 0) {
    await page.locator('button', { hasText: 'JSON' }).click();
    await page.waitForSelector('[data-testid="json-raw"]', { state: 'attached', timeout: 3000 });
  }
}

/** Open a specific visual's edit modal by filtering and clicking the card label */
async function openVisualModal(page, visualLabel) {
  await page.fill('input[placeholder*="Filter"]', visualLabel);
  await page.waitForTimeout(200);
  // Click the card name label (px-4 py-3 area below preview) — no overlay there
  const label = page.locator(`text=${visualLabel}`).first();
  await label.click();
  await page.waitForTimeout(600);
}

/** Expand a property card inside the modal by clicking its header */
async function expandCard(page, cardName) {
  // Property card headers are span.text-xs.font-semibold inside a clickable div
  const header = page.locator(`span.text-xs.font-semibold:has-text("${cardName}")`).first();
  await header.click();
  await page.waitForTimeout(200);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#theme-name-input', { timeout: 10000 });
  await openJsonPanel(page);
});

// ── Theme Name ────────────────────────────────────────────────────────────────

test('theme name: appears in JSON root', async ({ page }) => {
  const json = await getJson(page);
  expect(json.name).toBe('Customer360 Theme');
});

test('theme name: change is reflected in JSON', async ({ page }) => {
  await page.fill('#theme-name-input', 'My New Theme');
  await page.waitForTimeout(100);
  const json = await getJson(page);
  expect(json.name).toBe('My New Theme');
});

// ── Data Colors ───────────────────────────────────────────────────────────────

test('data colors: default array has 8 entries', async ({ page }) => {
  const json = await getJson(page);
  expect(json.dataColors).toHaveLength(8);
});

test('data colors: adding a color extends the array', async ({ page }) => {
  const before = (await getJson(page)).dataColors.length;
  // Click the Add button in Data Colors section
  await page.locator('button', { hasText: 'Add' }).click();
  await page.waitForTimeout(100);
  const after = (await getJson(page)).dataColors.length;
  expect(after).toBe(before + 1);
});

test('data colors: removing a color shrinks the array', async ({ page }) => {
  const before = (await getJson(page)).dataColors.length;
  await page.locator('button', { hasText: 'Remove' }).click();
  await page.waitForTimeout(100);
  const after = (await getJson(page)).dataColors.length;
  expect(after).toBe(before - 1);
});

// ── Semantic Colors ───────────────────────────────────────────────────────────

test('semantic colors: background is in JSON root', async ({ page }) => {
  const json = await getJson(page);
  expect(json.background).toBeDefined();
  expect(json.background).toMatch(/^#/);
});

test('semantic colors: foreground is in JSON root', async ({ page }) => {
  const json = await getJson(page);
  expect(json.foreground).toBeDefined();
  expect(json.foreground).toMatch(/^#/);
});

test('semantic colors: good/neutral/bad are in JSON root', async ({ page }) => {
  const json = await getJson(page);
  expect(json.good).toMatch(/^#/);
  expect(json.neutral).toMatch(/^#/);
  expect(json.bad).toMatch(/^#/);
});

// ── Preset Application ────────────────────────────────────────────────────────

test('preset: applying Dark Mode changes theme name and colors', async ({ page }) => {
  await page.locator('select').first().selectOption({ label: 'Dark Mode' });
  await page.waitForTimeout(200);
  const json = await getJson(page);
  expect(json.name).toBe('Dark Mode');
  expect(json.dataColors.length).toBeGreaterThanOrEqual(6);
});

// ── Visual Properties → visualStyles ──────────────────────────────────────────

test('title show: toggling updates visualStyles', async ({ page }) => {
  await openVisualModal(page, 'Bar Chart');
  await expandCard(page, 'Title');
  await page.waitForTimeout(200);
  // Toggle the first toggle in the expanded card (show property)
  const toggle = page.locator('[class*="rounded-full"][class*="w-9"]').first();
  if (await toggle.count() > 0) {
    await toggle.click({ force: true });
    await page.waitForTimeout(100);
  }
  // Close modal and check JSON
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const json = await getJson(page);
  // Should have visualStyles with the barChart key
  expect(json.visualStyles).toBeDefined();
  expect(json.visualStyles.barChart).toBeDefined();
});

test('title fontSize: number change updates visualStyles', async ({ page }) => {
  // Use the exposed Zustand store to call setCardProp directly
  await page.evaluate(() => {
    window.__themeStore.getState().setCardProp('clusteredColumnChart', 'title', 'fontSize', 18);
  });
  await page.waitForTimeout(200);
  const json = await getJson(page);
  expect(json.visualStyles).toBeDefined();
  expect(json.visualStyles.clusteredColumnChart).toBeDefined();
  const titleCard = json.visualStyles.clusteredColumnChart?.['*']?.title;
  expect(titleCard).toBeDefined();
  if (titleCard) {
    expect(titleCard[0].fontSize).toBe(18);
  }
});

// ── Text Classes ──────────────────────────────────────────────────────────────

test('text classes: exist in JSON', async ({ page }) => {
  const json = await getJson(page);
  expect(json.textClasses).toBeDefined();
  expect(json.textClasses.title).toBeDefined();
  expect(json.textClasses.header).toBeDefined();
  expect(json.textClasses.label).toBeDefined();
});

// ── JSON Structure Integrity ──────────────────────────────────────────────────

test('export JSON: has all required top-level keys', async ({ page }) => {
  const json = await getJson(page);
  expect(json.name).toBeDefined();
  expect(json.dataColors).toBeInstanceOf(Array);
  expect(json.background).toBeDefined();
  expect(json.foreground).toBeDefined();
  expect(json.tableAccent).toBeDefined();
  expect(json.textClasses).toBeDefined();
});

test('export JSON: dataColors are valid hex strings', async ({ page }) => {
  const json = await getJson(page);
  for (const color of json.dataColors) {
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  }
});

test('export JSON: visualStyles uses correct nested structure', async ({ page }) => {
  // Make a change to generate visualStyles
  await openVisualModal(page, 'Line Chart');
  await expandCard(page, 'Title');
  await page.waitForTimeout(200);
  const input = page.locator('input[type="number"]').first();
  await input.focus();
  await input.fill('');
  await input.type('14');
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const json = await getJson(page);
  // Structure: visualStyles.{visualKey}.*.{cardName}[0].{prop}
  const lineChart = json.visualStyles?.lineChart;
  expect(lineChart).toBeDefined();
  expect(lineChart['*']).toBeDefined();
  // At least one card should be an array
  const firstCard = Object.values(lineChart['*'])[0];
  expect(Array.isArray(firstCard)).toBe(true);
  expect(firstCard.length).toBe(1);
  expect(typeof firstCard[0]).toBe('object');
});

// ── ESC Key closes modal ──────────────────────────────────────────────────────

test('ESC key: closes the edit modal', async ({ page }) => {
  await openVisualModal(page, 'Pie');
  await expect(page.locator('button', { hasText: 'Reset' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await expect(page.locator('button', { hasText: 'Reset' })).not.toBeVisible();
});
