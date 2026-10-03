// Use case: a visitor opens the site and sees the 3D scene fill the screen without errors.
// If the canvas failed to mount or the console had errors, the main experience would be broken.
import { expect, test } from '@playwright/test';

test('mounts a full-screen WebGL canvas with a clean console', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));

  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  const viewport = page.viewportSize()!;
  // R3F measures its container asynchronously; the canvas starts at 300x150.
  await expect
    .poll(async () => (await canvas.boundingBox())?.width)
    .toBeCloseTo(viewport.width, -1);
  await expect
    .poll(async () => (await canvas.boundingBox())?.height)
    .toBeCloseTo(viewport.height, -1);
  expect(problems).toEqual([]);
});

test('loads the full-size Sun texture on desktop and the small one on phones', async ({
  browser,
}) => {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const desktopTexture = desktop.waitForResponse('**/textures/sun.webp');
  await desktop.goto('/');
  expect((await desktopTexture).status()).toBe(200);
  await desktop.close();

  const phone = await browser.newPage({ viewport: { width: 375, height: 700 } });
  const phoneTexture = phone.waitForResponse('**/textures/sun-small.webp');
  await phone.goto('/');
  expect((await phoneTexture).status()).toBe(200);
  await phone.close();
});
