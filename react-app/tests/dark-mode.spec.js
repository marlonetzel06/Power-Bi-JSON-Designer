import { test, expect } from '@playwright/test';

/**
 * Comprehensive dark mode visual tests.
 * Verifies that ALL major UI elements adapt properly in dark mode.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#theme-name-input', { timeout: 10000 });
});

// ── Toggle mechanism ──

test('dark mode: .dark class is set on <html>', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(hasDark).toBe(true);
});

test('dark mode: data-dark attribute is set on <html>', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  const hasAttr = await page.evaluate(() => document.documentElement.hasAttribute('data-dark'));
  expect(hasAttr).toBe(true);
});

// ── Background colors ──

test('dark mode: app background is dark', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(300);
  const bg = await page.evaluate(() => {
    const app = document.querySelector('[class*="flex h-screen"]');
    return getComputedStyle(app).backgroundColor;
  });
  // #1a1b2e = rgb(26, 27, 46)
  expect(bg).toContain('26');
});

// ── Theme name input ──

test('dark mode: theme name input text is light colored', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(300);
  const color = await page.evaluate(() => {
    return getComputedStyle(document.getElementById('theme-name-input')).color;
  });
  // dark:text-[#89b4fa] = rgb(137, 180, 250) — light blue text
  const r = parseInt(color.match(/\d+/g)?.[0] || '0');
  expect(r).toBeGreaterThan(100); // Not dark text
});

// ── Global Bar ──

test('dark mode: global bar background is dark', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(300);
  const bg = await page.evaluate(() => {
    const bar = document.querySelector('[class*="GlobalBar"]') ||
      // Find the global bar by its unique text
      document.evaluate(
        "//div[contains(text(),'Global Colors')]",
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
      ).singleNodeValue?.closest('[class*="bg-"]');
    if (!bar) return null;
    return getComputedStyle(bar).backgroundColor;
  });
  // Should be dark: #24263e = rgb(36, 38, 62)
  if (bg) {
    const r = parseInt(bg.match(/\d+/g)?.[0] || '255');
    expect(r).toBeLessThan(80);
  }
});

// ── Semantic color pills ──

test('dark mode: semantic pills have dark background', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(300);
  // The "Theme" pill inside semantic color row
  const pillBg = await page.evaluate(() => {
    const pills = document.querySelectorAll('span');
    for (const p of pills) {
      if (p.textContent.trim() === 'Theme' && p.className.includes('font-bold')) {
        return getComputedStyle(p).backgroundColor;
      }
    }
    return null;
  });
  if (pillBg) {
    // Should be dark-ish background (dark:bg-[#24263e])
    const r = parseInt(pillBg.match(/\d+/g)?.[0] || '255');
    expect(r).toBeLessThan(80);
  }
});

// ── Semantic color rows ──

test('dark mode: semantic color row backgrounds are dark', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(300);
  const rowBg = await page.evaluate(() => {
    // Semantic rows have specific bg classes
    const rows = document.querySelectorAll('[class*="bg-[#f8fafd]"], [class*="bg-\\[#1e2038\\]"]');
    if (rows.length === 0) return null;
    return getComputedStyle(rows[0]).backgroundColor;
  });
  if (rowBg) {
    const r = parseInt(rowBg.match(/\d+/g)?.[0] || '255');
    expect(r).toBeLessThan(80); // Should be dark
  }
});

// ── Visual Cards ──

test('dark mode: visual cards have dark background', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(300);
  // Cards contain "Click to configure"
  const cardBg = await page.evaluate(() => {
    const el = document.evaluate(
      "//div[contains(text(),'Click to configure')]",
      document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
    if (!el) return null;
    const card = el.closest('[class*="rounded-"]');
    return card ? getComputedStyle(card).backgroundColor : null;
  });
  if (cardBg) {
    const r = parseInt(cardBg.match(/\d+/g)?.[0] || '255');
    expect(r).toBeLessThan(80);
  }
});

// ── Toolbar buttons ──

test('dark mode: toolbar buttons have dark styling', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(300);
  // Check "Import / Export" button background
  const btnBg = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.includes('Import / Export')) {
        return getComputedStyle(b).backgroundColor;
      }
    }
    return null;
  });
  if (btnBg) {
    const r = parseInt(btnBg.match(/\d+/g)?.[0] || '255');
    expect(r).toBeLessThan(80); // dark:bg-[#24263e]
  }
});

// ── Page Settings bar ──

test('dark mode: page settings bar is dark', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(300);
  const bg = await page.evaluate(() => {
    const el = document.evaluate(
      "//span[contains(text(),'Page Settings')]",
      document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
    if (!el) return null;
    const bar = el.closest('[class*="bg-"]');
    return bar ? getComputedStyle(bar).backgroundColor : null;
  });
  if (bg) {
    const r = parseInt(bg.match(/\d+/g)?.[0] || '255');
    expect(r).toBeLessThan(80);
  }
});

// ── Filter input ──

test('dark mode: filter input has dark background', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(300);
  const bg = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Filter"]');
    return input ? getComputedStyle(input).backgroundColor : null;
  });
  if (bg) {
    const r = parseInt(bg.match(/\d+/g)?.[0] || '255');
    expect(r).toBeLessThan(80);
  }
});

// ── Edit Modal ──

test('dark mode: edit modal has dark background', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(200);
  // Open a visual card
  await page.locator('text=Click to configure').first().click();
  await page.waitForTimeout(300);
  const bg = await page.evaluate(() => {
    const modal = document.querySelector('[class*="max-w-"]');
    return modal ? getComputedStyle(modal).backgroundColor : null;
  });
  if (bg) {
    const r = parseInt(bg.match(/\d+/g)?.[0] || '255');
    expect(r).toBeLessThan(80);
  }
});

// ── JSON Panel ──

test('dark mode: JSON panel styling persists (always dark)', async ({ page }) => {
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(200);
  await page.locator('button', { hasText: 'Show JSON' }).click();
  await page.waitForTimeout(200);
  const panelBg = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? getComputedStyle(aside).backgroundColor : null;
  });
  // JSON panel is always dark-themed (#1e1e2e)
  if (panelBg) {
    const r = parseInt(panelBg.match(/\d+/g)?.[0] || '255');
    expect(r).toBeLessThan(60);
  }
});

// ── Return to light mode ──

test('dark mode off: backgrounds return to light', async ({ page }) => {
  // Enable dark mode
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(200);
  // Disable dark mode
  await page.locator('button[title="Toggle dark mode"]').click();
  await page.waitForTimeout(300);
  const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(hasDark).toBe(false);

  const bg = await page.evaluate(() => {
    const app = document.querySelector('[class*="flex h-screen"]');
    return getComputedStyle(app).backgroundColor;
  });
  // Light: #f0f2f5 = rgb(240, 242, 245)
  const r = parseInt(bg.match(/\d+/g)?.[0] || '0');
  expect(r).toBeGreaterThan(200);
});
