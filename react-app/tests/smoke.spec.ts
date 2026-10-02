import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function openApp(page: Page, locale: 'de' | 'en' = 'de') {
  await page.goto('/');
  await page.evaluate((loc) => {
    localStorage.clear();
    localStorage.setItem('pbi-designer.ui', JSON.stringify({ state: { locale: loc, theme: 'light' }, version: 1 }));
  }, locale);
  await page.reload();
  await expect(page.getByTestId('report-canvas')).toBeVisible();
}

test('shows the report page with mock visuals and the panes', async ({ page }) => {
  await openApp(page);
  await expect(page.getByTestId('canvas-clusteredColumnChart')).toBeVisible();
  await expect(page.getByTestId('pane-visualizations')).toBeVisible();
  await expect(page.getByTestId('topbar-theme-name')).toHaveValue('Custom Theme');
});

test('selecting a visual and changing a property updates preview and JSON', async ({ page }) => {
  await openApp(page);
  await page.getByTestId('canvas-clusteredColumnChart').click();
  await expect(page.getByTestId('format-visual-name')).toHaveText('Gruppiertes Säulendiagramm');
  // Open the legend card and switch the legend off via the header toggle.
  const legendCard = page.locator('[data-card="card-clusteredColumnChart-legend"]');
  await legendCard.getByRole('switch').click();
  await expect(page.getByTestId('change-count')).toHaveText('1');
  await page.getByTestId('toggle-json-pane').click();
  await expect(page.getByTestId('json-output')).toContainText('"clusteredColumnChart"');
  await expect(page.getByTestId('json-output')).toContainText('"show": false');
  // Undo reverts the change.
  await page.getByTestId('undo').click();
  await expect(page.getByTestId('change-count')).toHaveCount(0);
});

test('search filter, focus mode and language toggle', async ({ page }) => {
  await openApp(page);
  await page.getByTestId('canvas-search').fill('KPI');
  await expect(page.getByTestId('canvas-kpi')).toBeVisible();
  await expect(page.getByTestId('canvas-clusteredColumnChart')).toHaveCount(0);
  await page.getByTestId('canvas-kpi').dblclick();
  await expect(page.getByTestId('focus-mode')).toBeVisible();
  await page.getByTestId('focus-back').click();
  await expect(page.getByTestId('report-canvas')).toBeVisible();
  await page.getByRole('radio', { name: 'EN' }).click();
  await expect(page.getByTestId('pane-visualizations')).toContainText('Visualizations');
});

test('theme pane: preset changes data colours; export is schema valid', async ({ page }) => {
  await openApp(page);
  await page.getByTestId('toggle-theme-pane').click();
  await page.getByTestId('preset-picker').click();
  await page.getByTestId('preset-mm').click();
  await expect(page.getByTestId('data-colors').locator('li').first()).toContainText('#008E82');
  await page.getByTestId('toggle-json-pane').click();
  await expect(page.getByTestId('validation-badge')).toContainText(/Schema-gültig|Hinweise/);
});

test('has no serious accessibility violations', async ({ page }) => {
  await openApp(page);
  await page.getByTestId('canvas-clusteredColumnChart').click();
  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});
