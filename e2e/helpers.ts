import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import sharp from 'sharp';

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

/** Diameter of the orange disc (the Sun) along the central row/column, relative to the smaller screen side. */
export async function measureSunFill(image: Buffer): Promise<number> {
  const { data, info } = await sharp(image).raw().toBuffer({ resolveWithObject: true });
  const isWarm = (column: number, row: number): boolean => {
    const offset = (row * info.width + column) * info.channels;
    // Bright yellow patches have high blue, so compare against blue instead of a fixed ceiling.
    // The corona's glow stays below red 125, the disc is above 140 even in dark spots.
    return data[offset]! > 140 && data[offset]! > data[offset + 2]! * 1.5;
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

/**
 * Waits for CSS transitions and finite animations to finish (axe measures colors mid-fade otherwise).
 * Infinite animations, such as the decorative orbits, are skipped because they never finish.
 */
export async function waitForFiniteAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished),
    ),
  );
}

/** Sweeps the pointer over the area where Mercury sits at rest (reduced motion) until its hint shows. */
export async function hoverMercury(page: Page) {
  const box = (await page.locator('canvas').boundingBox())!;
  await expect(async () => {
    for (let offsetY = 0.5; offsetY <= 0.85; offsetY += 0.05) {
      for (let offsetX = 0.45; offsetX <= 0.8; offsetX += 0.05) {
        await page.mouse.move(box.x + box.width * offsetX, box.y + box.height * offsetY);
        if (await page.getByText('Mercúrio · Contato').isVisible()) return;
      }
    }
    throw new Error('Mercury was not found under the pointer');
  }).toPass({ timeout: 30_000 });
}

export function expectComfortableFill(fill: number) {
  // The system (Sun plus Mercury's orbit) fills ~80% of the limiting dimension and the Sun is
  // about 45% of that; allow for bloom and highlight scale.
  expect(fill).toBeGreaterThan(0.25);
  expect(fill).toBeLessThan(0.5);
}
