// Use case: keyboard-only visitors can zoom the scene with + and -, but not while reading the panel,
// and Ctrl+ must stay with the browser's own page zoom.
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { measureSunFill } from './helpers';

async function waitForScene(page: Page) {
  const textureLoaded = page.waitForResponse('**/textures/sun*.webp');
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await textureLoaded;
  await page.waitForTimeout(1200);
}

const sunFill = async (page: Page) => measureSunFill(await page.locator('canvas').screenshot());

test('+ zooms in and - zooms out within limits', async ({ page }) => {
  await waitForScene(page);
  const initial = await sunFill(page);
  for (let press = 0; press < 3; press += 1) await page.keyboard.press('+');
  await page.waitForTimeout(600);
  const zoomedIn = await sunFill(page);
  expect(zoomedIn).toBeGreaterThan(initial * 1.2);

  for (let press = 0; press < 30; press += 1) await page.keyboard.press('-');
  await page.waitForTimeout(600);
  const zoomedOut = await sunFill(page);
  expect(zoomedOut).toBeLessThan(initial);
  expect(zoomedOut).toBeGreaterThan(0.1);
});

test('does not zoom while the content panel is open', async ({ page }) => {
  await waitForScene(page);
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
  await page.waitForTimeout(1500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  const before = await sunFill(page);
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
  for (let press = 0; press < 5; press += 1) await page.keyboard.press('+');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  const after = await sunFill(page);
  expect(Math.abs(after - before)).toBeLessThan(0.02);
});
