import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

const TEXTURE_DELAY_MS = 3500;
const SETTLE_AFTER_TEXTURES_MS = 1500;
const LOCK_WAIT_MS = 700;
const MERCURY_LOCK = 'ALVO TRAVADO · 002';

async function restPointerOnMercury(page: Page): Promise<boolean> {
  const box = (await page.locator('canvas').boundingBox())!;
  const lock = page.getByText(MERCURY_LOCK);
  for (let offsetY = 0.5; offsetY <= 0.85; offsetY += 0.05) {
    for (let offsetX = 0.55; offsetX <= 0.9; offsetX += 0.05) {
      await page.mouse.move(box.x + box.width * offsetX, box.y + box.height * offsetY);
      const cursor = await page.evaluate(() => document.body.style.cursor);
      if (cursor !== 'pointer') continue;
      const isLocked = await lock
        .waitFor({ state: 'visible', timeout: LOCK_WAIT_MS })
        .then(() => true)
        .catch(() => false);
      if (isLocked) return true;
    }
  }
  return false;
}

test('keeps the hover on a planet when its texture arrives with the pointer resting on it', async ({
  page,
}) => {
  let arrivedTextures = 0;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/textures/*.webp', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, TEXTURE_DELAY_MS));
    await route.continue();
    arrivedTextures += 1;
  });

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect.poll(() => restPointerOnMercury(page), { timeout: TEXTURE_DELAY_MS }).toBe(true);
  expect(arrivedTextures).toBe(0);

  await expect.poll(() => arrivedTextures, { timeout: TEXTURE_DELAY_MS * 2 }).toBeGreaterThan(0);
  await page.waitForTimeout(SETTLE_AFTER_TEXTURES_MS);

  await expect(page.getByText(MERCURY_LOCK)).toBeVisible();
  expect(await page.evaluate(() => document.body.style.cursor)).toBe('pointer');
});
