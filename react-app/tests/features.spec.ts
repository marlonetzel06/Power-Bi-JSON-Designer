import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const fixture = (name: string) => path.join(here, 'fixtures', name);

async function openApp(page: Page, locale: 'de' | 'en' = 'de') {
  await page.goto('/');
  await page.evaluate((loc) => {
    localStorage.clear();
    localStorage.setItem('pbi-designer.ui', JSON.stringify({ state: { locale: loc, theme: 'light' }, version: 1 }));
  }, locale);
  await page.reload();
  await expect(page.getByTestId('report-canvas')).toBeVisible();
}

async function importFile(page: Page, file: string) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('design-menu').click();
  await page.getByTestId('menu-import-json').click();
  await (await chooser).setFiles(file);
}

async function noSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test('imports a theme file, shows it everywhere and exports it unchanged and schema-valid', async ({ page }) => {
  await openApp(page);
  await importFile(page, fixture('valid-theme.json'));
  await expect(page.getByTestId('topbar-theme-name')).toHaveValue('E2E Theme');
  await expect(page.getByTestId('change-count')).toHaveCount(0); // imported theme is the new baseline
  await page.getByTestId('canvas-barChart').click();
  await expect(page.locator('[data-card="card-barChart-legend"]')).toBeVisible();

  const download = page.waitForEvent('download');
  await page.getByTestId('design-menu').click();
  await page.getByTestId('menu-export-full').click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/E2E.*\.json$/i);
  const exported = JSON.parse(readFileSync(await file.path(), 'utf8'));
  expect(exported.name).toBe('E2E Theme');
  expect(exported.dataColors).toEqual(['#111111', '#222222', '#333333', '#444444']);
  expect(exported.visualStyles.barChart['*'].legend[0].position).toBe('Bottom');

  const schema = JSON.parse(readFileSync(path.join(here, '..', 'schema', 'reportThemeSchema-2.144.json'), 'utf8'));
  const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false, allowUnionTypes: true });
  const ok = ajv.validate(schema, exported);
  expect(ajv.errors ?? [], 'schema errors').toEqual([]);
  expect(ok).toBe(true);
});

test('flags invalid cards and properties after import and jumps to the affected visual', async ({ page }) => {
  await openApp(page);
  await importFile(page, fixture('invalid-theme.json'));
  await page.getByTestId('toggle-json-pane').click();
  await expect(page.getByTestId('validation-badge')).toContainText(/Fehler/);
  const issues = page.getByTestId('validation-issues');
  await expect(issues).toContainText('gauge');
  await expect(issues).toContainText('nichtVorhanden');
  await issues.getByRole('button', { name: 'Zur Karte' }).first().click();
  await expect(page.getByTestId('format-visual-name')).toHaveText(/Messgerät|Liniendiagramm/);
});

test('undo and redo work from the keyboard and the toolbar', async ({ page }) => {
  await openApp(page);
  await page.getByTestId('canvas-pieChart').click();
  await page.locator('[data-card="card-pieChart-legend"]').getByRole('switch').click();
  await expect(page.getByTestId('change-count')).toHaveText('1');
  await page.getByTestId('report-canvas').click({ position: { x: 5, y: 5 } }); // move focus away from the pane
  await page.keyboard.press('Control+z');
  await expect(page.getByTestId('change-count')).toHaveCount(0);
  await page.keyboard.press('Control+y');
  await expect(page.getByTestId('change-count')).toHaveText('1');
  await page.getByTestId('undo').click();
  await expect(page.getByTestId('change-count')).toHaveCount(0);
});

test('theme edits, colour mode and language survive a reload', async ({ page }) => {
  await openApp(page);
  await page.getByTestId('topbar-theme-name').fill('Persistenz');
  await page.getByTestId('toggle-color-mode').click();
  await page.getByRole('radio', { name: 'EN' }).click();
  await page.reload();
  await expect(page.getByTestId('topbar-theme-name')).toHaveValue('Persistenz');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByTestId('pane-visualizations')).toContainText('Visualizations');
});

test('panes resize with the keyboard and collapse to a strip', async ({ page }) => {
  await openApp(page);
  const handle = page.getByRole('separator', { name: /Visualisierungen/ });
  const before = Number(await handle.getAttribute('aria-valuenow'));
  await handle.focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(handle).toHaveAttribute('aria-valuenow', String(before + 32));
  await page.getByRole('button', { name: /Bereich einklappen: Visualisierungen/ }).click();
  await expect(page.getByTestId('pane-visualizations')).toHaveAttribute('data-collapsed', '');
  await page.getByRole('button', { name: /Bereich ausklappen: Visualisierungen/ }).click();
  await expect(page.getByTestId('pane-visualizations')).not.toHaveAttribute('data-collapsed', '');
  await expect(page.getByTestId('gallery-barChart')).toBeVisible();
});

test('copy formatting to similar visuals and reset a visual', async ({ page }) => {
  await openApp(page);
  await page.getByTestId('canvas-clusteredColumnChart').click();
  await page.locator('[data-card="card-clusteredColumnChart-legend"]').getByRole('switch').click();
  await expect(page.getByTestId('change-count')).toHaveText('1');
  await page.getByRole('button', { name: /ähnliche Visuals/ }).click();
  await page.getByRole('button', { name: /Auf 2 Visuals anwenden/ }).click();
  await expect(page.getByTestId('change-count')).not.toHaveText('1');
  await page.getByTestId('gallery-columnChart').click();
  await expect(page.getByTestId('format-visual-name')).toHaveText('Gestapeltes Säulendiagramm');
  await page.getByTestId('reset-visual').click();
  await page.getByRole('button', { name: 'Auf Standard zurücksetzen' }).click();
  await expect(page.getByTestId('gallery-columnChart')).not.toHaveAttribute('aria-label', /geändert/);
});

test('theme pane, JSON pane and dialogs have no serious accessibility violations', async ({ page }) => {
  await openApp(page);
  await page.getByTestId('toggle-theme-pane').click();
  await page.getByTestId('toggle-json-pane').click();
  await expect(page.getByTestId('json-output')).toBeVisible();
  await noSeriousViolations(page);
  await page.getByTestId('canvas-barChart').click();
  await page.getByRole('button', { name: /ähnliche Visuals/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await noSeriousViolations(page);
  await page.keyboard.press('Escape');
  await page.getByTestId('open-help').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await noSeriousViolations(page);
});
