// Dev helper: node scripts/screenshot.mjs <outDir> [baseUrl]
import { chromium } from '@playwright/test';
const out = process.argv[2] ?? '.';
const base = process.argv[3] ?? 'http://localhost:5173';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(`${base}/?dev=gallery`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
for (let i = 0; i < 3; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * 1100);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/gallery${i + 1}.png` });
}
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/app.png` });
console.log(JSON.stringify(errors, null, 1));
await browser.close();
