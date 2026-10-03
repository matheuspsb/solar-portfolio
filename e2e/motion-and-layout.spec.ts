// Use case: visitors who prefer reduced motion must see a still Sun (also if they switch the
// setting while the site is open), and phone/tablet visitors in any orientation must see the whole
// Sun and no sideways scrolling. Failing these would hurt accessibility and first impressions.
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import sharp from 'sharp';

async function waitForScene(page: Page) {
  const textureLoaded = page.waitForResponse('**/textures/sun*.webp');
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await textureLoaded;
  await page.waitForTimeout(1200);
}

async function captureCanvas(page: Page): Promise<Buffer> {
  return page.locator('canvas').screenshot();
}

/** Diameter of the orange disc (the Sun) along the central row/column, relative to the smaller screen side. */
async function measureSunFill(image: Buffer): Promise<number> {
  const { data, info } = await sharp(image).raw().toBuffer({ resolveWithObject: true });
  const isWarm = (column: number, row: number): boolean => {
    const offset = (row * info.width + column) * info.channels;
    return data[offset]! > 140 && data[offset + 1]! > 40 && data[offset + 2]! < 90;
  };
  const centerColumn = Math.floor(info.width / 2);
  const centerRow = Math.floor(info.height / 2);

  // Walk outward from the center so unrelated warm UI (the menu border) is never counted.
  const measureRun = (
    isWarmAt: (position: number) => boolean,
    start: number,
    length: number,
  ): number => {
    let first = start;
    while (first > 0 && isWarmAt(first - 1)) first -= 1;
    let last = start;
    while (last < length - 1 && isWarmAt(last + 1)) last += 1;
    return last - first;
  };

  const horizontalSpan = measureRun(
    (column) => isWarm(column, centerRow),
    centerColumn,
    info.width,
  );
  const verticalSpan = measureRun((row) => isWarm(centerColumn, row), centerRow, info.height);
  return Math.max(horizontalSpan, verticalSpan) / Math.min(info.width, info.height);
}

function expectComfortableFill(fill: number) {
  // Framing targets ~55% of the limiting dimension; allow for bloom and highlight scale.
  expect(fill).toBeGreaterThan(0.4);
  expect(fill).toBeLessThan(0.7);
}

test('the Sun rotates by default', async ({ page }) => {
  await waitForScene(page);
  const first = await captureCanvas(page);
  await page.waitForTimeout(2000);
  const second = await captureCanvas(page);
  expect(first.equals(second)).toBe(false);
});

test('the Sun stays still when reduced motion is preferred', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await waitForScene(page);
  const first = await captureCanvas(page);
  await page.waitForTimeout(2000);
  const second = await captureCanvas(page);
  expect(first.equals(second)).toBe(true);
});

test('stops rotating when reduced motion is switched on while the site is open', async ({
  page,
}) => {
  await waitForScene(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(500);
  const first = await captureCanvas(page);
  await page.waitForTimeout(2000);
  const second = await captureCanvas(page);
  expect(first.equals(second)).toBe(true);
});

test('the whole Sun fits narrow portrait and rotated phone screens', async ({ browser }) => {
  for (const viewport of [
    { width: 320, height: 640 },
    { width: 375, height: 700 },
    { width: 812, height: 375 },
    { width: 768, height: 1024 },
  ]) {
    const page = await browser.newPage({ viewport });
    await waitForScene(page);
    expectComfortableFill(await measureSunFill(await captureCanvas(page)));
    await page.close();
  }
});

test('reframes the Sun when the viewport is rotated while open', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await waitForScene(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1200);
  expectComfortableFill(await measureSunFill(await captureCanvas(page)));
});

test('has no horizontal scrolling on very narrow screens', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
  await page.goto('/');
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  const menuBox = (await page.getByRole('button', { name: 'Sobre', exact: true }).boundingBox())!;
  expect(menuBox.x).toBeGreaterThanOrEqual(0);
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(320);
  await page.close();
});
