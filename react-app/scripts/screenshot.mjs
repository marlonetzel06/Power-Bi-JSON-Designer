// Dev helper: CHROMIUM_PATH=... node scripts/screenshot.mjs <outDir> [baseUrl]
// Walks through the main flows (German UI) and writes screenshots + console errors.
import { chromium } from '@playwright/test';
const out = process.argv[2] ?? '.';
const base = process.argv[3] ?? 'http://localhost:5173';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text().slice(0, 300)); });
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('pbi-designer.ui', JSON.stringify({ state: { locale: 'de', theme: 'light' }, version: 1 })); });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/01-start.png` });
await page.getByTestId('canvas-clusteredColumnChart').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/02-selected.png` });
// open legend card and change a value
await page.getByText('Legende', { exact: true }).first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/03-legend-card.png` });
await page.getByTestId('tab-general').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/04-general.png` });
await page.getByTestId('toggle-theme-pane').click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/05-theme-pane.png` });
await page.getByTestId('toggle-json-pane').click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/06-json-pane.png` });
await page.getByTestId('toggle-color-mode').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/07-dark.png` });
await page.getByTestId('focus-mode-button').click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/08-focus.png` });
await page.getByTestId('focus-back').click();
await page.getByTestId('toggle-color-mode').click();
// button states
await page.getByTestId('canvas-search').fill('Schaltfläche');
await page.waitForTimeout(400);
await page.getByTestId('canvas-actionButton').click();
await page.getByTestId('format-state').getByRole('combobox').click();
await page.getByRole('option', { name: 'Beim Daraufzeigen' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/09-button-hover-state.png` });
await page.getByTestId('canvas-search').fill('');
// line chart cards (lines, reference lines)
await page.getByTestId('canvas-lineChart').click();
await page.getByTestId('tab-visual').click();
await page.getByTestId('format-search').fill('Linien');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/10-line-cards.png` });
await page.getByTestId('format-search').fill('');
// theme pane filter cards
await page.getByTestId('toggle-theme-pane').click();
try {
  await page.getByRole('button', { name: 'Filterkarten' }).first().click({ timeout: 5000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/11-filter-cards.png` });
} catch (e) {
  errors.push('filter cards step skipped: ' + e.message.split('\n')[0]);
}
console.log(JSON.stringify(errors, null, 1));
await browser.close();
