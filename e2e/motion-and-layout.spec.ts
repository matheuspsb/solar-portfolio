import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { expectComfortableFill, measureSunFill } from './helpers';

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

const phoneViewports = [
  { width: 320, height: 640 },
  { width: 375, height: 700 },
  { width: 812, height: 375 },
  { width: 768, height: 1024 },
];

for (const viewport of phoneViewports) {
  test(`the whole Sun fits a ${viewport.width}x${viewport.height} screen`, async ({ browser }) => {
    const page = await browser.newPage({ viewport });
    await waitForScene(page);
    expectComfortableFill(await measureSunFill(await captureCanvas(page)));
    await page.close();
  });
}

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

test('keeps the planets orbiting while the content panel is open', async ({ page }) => {
  await waitForScene(page);
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
  await page.waitForTimeout(1500);
  const sceneSide = { x: 0, y: 0, width: 700, height: 800 };
  const first = await page.screenshot({ clip: sceneSide });
  await page.waitForTimeout(2000);
  const second = await page.screenshot({ clip: sceneSide });
  expect(first.equals(second)).toBe(false);
});
