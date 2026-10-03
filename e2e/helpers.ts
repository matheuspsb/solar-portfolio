import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Moves the pointer over the Sun and waits for the hover hint (software WebGL can be slow). */
export async function hoverSun(page: Page) {
  const viewport = page.viewportSize()!;
  const canvas = page.locator('canvas');
  // R3F starts at 300x150 and resizes asynchronously: wait for the real size before aiming.
  await expect
    .poll(async () => (await canvas.boundingBox())?.width)
    .toBeCloseTo(viewport.width, -1);
  const box = (await canvas.boundingBox())!;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  await expect(async () => {
    await page.mouse.move(centerX + 4, centerY + 4, { steps: 3 });
    await page.mouse.move(centerX, centerY, { steps: 3 });
    await expect(page.getByText('Sol · Sobre')).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 20_000 });
  return { centerX, centerY };
}

export async function clickSun(page: Page) {
  const { centerX, centerY } = await hoverSun(page);
  await page.mouse.click(centerX, centerY);
}
