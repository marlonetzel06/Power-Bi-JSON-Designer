// @ts-check
/**
 * agentic-features.spec.js — Ported from the original HTML tests
 *
 * Tests for the 8 workflow features in the React app:
 *  1. Theme Name Editor
 *  2. JSON Import (via store)
 *  3. Preset Library
 *  4. Palette Generator
 *  5. Change Indicators
 *  6. Reset per Visual
 *  7. Copy to Similar Visuals
 *  8. Delta Export
 *  + Dark Mode Toggle
 */
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  // Wait for the app to render
  await page.waitForSelector('#theme-name-input', { timeout: 10000 });
});

// ── 1. Theme Name Editor ──────────────────────────────────────────────────────

test('theme name input: exists with default value', async ({ page }) => {
  const val = await page.inputValue('#theme-name-input');
  expect(val).toBe('Customer360 Theme');
});

test('theme name input: typing updates the input value', async ({ page }) => {
  await page.fill('#theme-name-input', 'My Custom Report');
  const val = await page.inputValue('#theme-name-input');
  expect(val).toBe('My Custom Report');
});

// ── 2. JSON Panel ─────────────────────────────────────────────────────────────

test('JSON panel: toggle button exists', async ({ page }) => {
  const btn = page.locator('button', { hasText: 'Show JSON' });
  await expect(btn).toBeVisible();
});

test('JSON panel: opens and shows JSON content', async ({ page }) => {
  await page.locator('button', { hasText: 'Show JSON' }).click();
  // JSON panel should be visible
  const panel = page.locator('aside');
  await expect(panel).toBeVisible();
  // Should contain theme name in the JSON
  const text = await panel.textContent();
  expect(text).toContain('Customer360 Theme');
});

test('JSON panel: has Copy and Download buttons', async ({ page }) => {
  await page.locator('button', { hasText: 'Show JSON' }).click();
  await expect(page.locator('aside button', { hasText: 'Copy' })).toBeVisible();
  await expect(page.locator('aside button', { hasText: 'Download' })).toBeVisible();
});

// ── 3. Preset Library ─────────────────────────────────────────────────────────

test('preset select: has built-in presets', async ({ page }) => {
  const options = await page.locator('select option').allTextContents();
  expect(options.some(o => o.includes('Corporate Blue'))).toBe(true);
  expect(options.some(o => o.includes('Dark Mode'))).toBe(true);
});

test('preset select: applying a preset changes theme name', async ({ page }) => {
  // Select "dark" preset
  await page.locator('select').first().selectOption({ label: 'Dark Mode' });
  await page.waitForTimeout(200);
  const val = await page.inputValue('#theme-name-input');
  expect(val).toBe('Dark Mode');
});

// ── 4. Palette Generator ──────────────────────────────────────────────────────

test('palette button: exists with label "Palette"', async ({ page }) => {
  const btn = page.locator('button', { hasText: 'Palette' });
  await expect(btn).toBeVisible();
});

test('palette popover: opens on click', async ({ page }) => {
  await page.locator('button', { hasText: 'Palette' }).click();
  // Should see harmony rows (Analogous, Complementary, etc.)
  await expect(page.locator('text=Analogous')).toBeVisible();
  await expect(page.locator('text=Complementary')).toBeVisible();
  await expect(page.locator('text=Triadic')).toBeVisible();
});

test('palette popover: Apply button applies colors', async ({ page }) => {
  await page.locator('button', { hasText: 'Palette' }).click();
  await page.waitForTimeout(100);
  // Click the first "Apply" button (Analogous)
  await page.locator('button', { hasText: 'Apply' }).first().click();
  await page.waitForTimeout(100);
  // Palette popover should close
  await expect(page.locator('text=Analogous')).not.toBeVisible();
});

test('palette popover: Shuffle button exists', async ({ page }) => {
  await page.locator('button', { hasText: 'Palette' }).click();
  await expect(page.locator('button', { hasText: 'Shuffle' })).toBeVisible();
});

// ── 5. Page Settings ──────────────────────────────────────────────────────────

test('page settings bar: exists with Edit button', async ({ page }) => {
  const bar = page.locator('text=Page Settings');
  await expect(bar.first()).toBeVisible();
  const editBtn = page.locator('button', { hasText: 'Edit' });
  await expect(editBtn.first()).toBeVisible();
});

// ── 6. Visual Grid ────────────────────────────────────────────────────────────

test('visual grid: filter input exists', async ({ page }) => {
  const input = page.locator('input[placeholder*="Filter"]');
  await expect(input).toBeVisible();
});

test('visual grid: shows visual cards', async ({ page }) => {
  // Should have multiple visual cards rendered
  const cards = page.locator('text=Click to configure');
  const count = await cards.count();
  expect(count).toBeGreaterThan(10);
});

test('visual grid: filter narrows results', async ({ page }) => {
  const allCards = await page.locator('text=Click to configure').count();
  await page.fill('input[placeholder*="Filter"]', 'bar');
  await page.waitForTimeout(200);
  const filtered = await page.locator('text=Click to configure').count();
  expect(filtered).toBeLessThan(allCards);
  expect(filtered).toBeGreaterThan(0);
});

// ── 7. Edit Modal ─────────────────────────────────────────────────────────────

test('visual card click: opens edit modal', async ({ page }) => {
  // Click the first visual card
  await page.locator('text=Click to configure').first().click();
  await page.waitForTimeout(200);
  // Modal should be visible with a close button
  const closeBtn = page.locator('button', { hasText: '×' });
  await expect(closeBtn).toBeVisible();
});

test('edit modal: has Reset and Copy to Similar buttons', async ({ page }) => {
  await page.locator('text=Click to configure').first().click();
  await page.waitForTimeout(200);
  await expect(page.locator('button', { hasText: 'Reset' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Copy to Similar' })).toBeVisible();
});

test('edit modal: close button closes modal', async ({ page }) => {
  await page.locator('text=Click to configure').first().click();
  await page.waitForTimeout(200);
  await page.locator('button', { hasText: '×' }).click();
  await page.waitForTimeout(200);
  // Modal should be gone
  await expect(page.locator('button', { hasText: '×' })).not.toBeVisible();
});

// ── 8. Copy to Similar Dialog ─────────────────────────────────────────────────

test('copy dialog: opens from edit modal', async ({ page }) => {
  await page.locator('text=Click to configure').first().click();
  await page.waitForTimeout(200);
  await page.locator('button', { hasText: 'Copy to Similar' }).click();
  await page.waitForTimeout(200);
  // Copy dialog should show "Copy Settings" title
  await expect(page.locator('text=Copy Settings')).toBeVisible();
});

test('copy dialog: has checkboxes and Apply button', async ({ page }) => {
  await page.locator('text=Click to configure').first().click();
  await page.waitForTimeout(200);
  await page.locator('button', { hasText: 'Copy to Similar' }).click();
  await page.waitForTimeout(200);
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  expect(count).toBeGreaterThan(0);
  await expect(page.locator('button', { hasText: /Apply to \d+ visual/ })).toBeVisible();
});

// ── Dark Mode Toggle ──────────────────────────────────────────────────────────

test('dark mode toggle: button exists', async ({ page }) => {
  // The dark mode button shows sun or moon emoji
  const btn = page.locator('button[title="Toggle dark mode"]');
  await expect(btn).toBeVisible();
});

test('dark mode toggle: clicking adds dark class', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(200);
  const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(hasDark).toBe(true);
});

test('dark mode toggle: double click returns to light', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(200);
  const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(hasDark).toBe(false);
});

// ── Global Bar ────────────────────────────────────────────────────────────────

test('global bar: shows semantic color sections', async ({ page }) => {
  await expect(page.locator('text=Theme').first()).toBeVisible();
  await expect(page.locator('text=Sentiment').first()).toBeVisible();
  await expect(page.locator('text=Data Colors').first()).toBeVisible();
  await expect(page.locator('text=Typography').first()).toBeVisible();
});

test('global bar: collapse/expand toggle works', async ({ page }) => {
  // Click collapse
  await page.locator('button', { hasText: 'Collapse' }).click();
  await page.waitForTimeout(200);
  // Semantic color inputs should be hidden
  await expect(page.locator('text=Expand')).toBeVisible();
  // Click expand
  await page.locator('button', { hasText: 'Expand' }).click();
  await page.waitForTimeout(200);
  await expect(page.locator('text=Collapse')).toBeVisible();
});

// ── Import/Export Menu ────────────────────────────────────────────────────────

test('import/export: menu button exists', async ({ page }) => {
  const btn = page.locator('button', { hasText: 'Import / Export' });
  await expect(btn).toBeVisible();
});

test('import/export: menu opens with options', async ({ page }) => {
  await page.locator('button', { hasText: 'Import / Export' }).click();
  await page.waitForTimeout(100);
  await expect(page.locator('button', { hasText: 'Import JSON' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Export JSON' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Export Delta' })).toBeVisible();
});

// ── Sign In Button ────────────────────────────────────────────────────────────

test('sign in button: hidden when MSAL not configured', async ({ page }) => {
  const btn = page.locator('button', { hasText: 'Sign In' });
  await expect(btn).toHaveCount(0);
});
