import { expect, openPage, test } from './fixtures';
import type { Page } from '@playwright/test';
import sharp from 'sharp';

async function openPanelFromMenu(page: Page) {
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
}

async function measureSunCenterX(page: Page): Promise<number> {
  const { data, info } = await sharp(await page.screenshot())
    .raw()
    .toBuffer({ resolveWithObject: true });
  const searchWidth = Math.floor(info.width * 0.6);
  let sum = 0;
  let count = 0;
  for (let row = 0; row < info.height; row += 4) {
    for (let column = 0; column < searchWidth; column += 2) {
      const offset = (row * info.width + column) * info.channels;
      const [red, , blue] = [data[offset]!, data[offset + 1]!, data[offset + 2]!];
      if (red > 70 && red > blue * 2.5) {
        sum += column;
        count += 1;
      }
    }
  }
  return sum / count;
}

async function waitForScene(page: Page) {
  const textureLoaded = page.waitForResponse('**/textures/sun*.webp');
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await textureLoaded;
  await page.waitForTimeout(1200);
}

test('the Sun slides left to stay visible next to the open panel on desktop', async ({ page }) => {
  await waitForScene(page);
  const initialCenterX = await measureSunCenterX(page);
  await openPanelFromMenu(page);
  await page.waitForTimeout(1500);
  const centerX = await measureSunCenterX(page);
  expect(centerX).toBeLessThan(initialCenterX - 120);
  expect(centerX).toBeGreaterThan(initialCenterX - 330);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  const restoredCenterX = await measureSunCenterX(page);
  expect(Math.abs(restoredCenterX - initialCenterX)).toBeLessThan(15);
});

test('the Sun does not shift on phones, where the panel covers everything', async ({ browser }) => {
  const page = await openPage(browser, { viewport: { width: 375, height: 740 } });
  await waitForScene(page);
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
  await page.waitForTimeout(1200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  const { data, info } = await sharp(await page.screenshot())
    .raw()
    .toBuffer({ resolveWithObject: true });
  const middleRow = Math.floor(info.height / 2);
  const offset = (middleRow * info.width + Math.floor(info.width / 2)) * info.channels;
  expect(data[offset]!).toBeGreaterThan(150);
  await page.close();
});

test('the panel slides in with the motion tokens, and instantly with reduced motion', async ({
  browser,
}) => {
  const readAnimationDuration = async (reducedMotion: 'reduce' | 'no-preference') => {
    const page = await openPage(browser);
    await page.emulateMedia({ reducedMotion });
    await page.goto('/');
    await openPanelFromMenu(page);
    const duration = await page
      .getByRole('dialog', { name: 'Sobre' })
      .evaluate((element) => getComputedStyle(element).animationDuration);
    await page.close();
    return duration;
  };

  expect(await readAnimationDuration('no-preference')).not.toBe('0s');
  expect(await readAnimationDuration('reduce')).toBe('0s');
});

test('the Sun has a glowing halo beyond its surface', async ({ page }) => {
  await waitForScene(page);
  const { data, info } = await sharp(await page.screenshot())
    .raw()
    .toBuffer({ resolveWithObject: true });
  const centerRow = Math.floor(info.height / 2);
  const centerColumn = Math.floor(info.width / 2);
  let edge = centerColumn;
  while (edge < info.width - 1 && data[(centerRow * info.width + edge) * info.channels]! > 140) {
    edge += 1;
  }
  const haloOffset = (centerRow * info.width + edge + 25) * info.channels;
  const [red, , blue] = [data[haloOffset]!, data[haloOffset + 1]!, data[haloOffset + 2]!];
  expect(red).toBeGreaterThan(40);
  expect(red).toBeGreaterThan(blue);
});
