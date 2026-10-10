import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import sharp from 'sharp';

const SCENE_REVEAL_TIMEOUT_MS = 20_000;
const FULLY_VISIBLE_OPACITY = 0.99;

async function waitForSceneReveal(page: Page) {
  await page.waitForFunction(
    (threshold) => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      let opacity = 1;
      for (let node: Element | null = canvas; node; node = node.parentElement) {
        opacity *= Number(getComputedStyle(node).opacity);
      }
      return opacity >= threshold;
    },
    FULLY_VISIBLE_OPACITY,
    { timeout: SCENE_REVEAL_TIMEOUT_MS },
  );
}

export async function hoverSun(page: Page) {
  await waitForSceneReveal(page);
  const viewport = page.viewportSize()!;
  const canvas = page.locator('canvas');
  await expect
    .poll(async () => (await canvas.boundingBox())?.width)
    .toBeCloseTo(viewport.width, -1);
  const box = (await canvas.boundingBox())!;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  await expect(async () => {
    await page.mouse.move(centerX + 4, centerY + 4, { steps: 3 });
    await page.mouse.move(centerX, centerY, { steps: 3 });
    await expect(page.getByText('ALVO TRAVADO · 001')).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 20_000 });
  return { centerX, centerY };
}

export async function clickSun(page: Page) {
  const { centerX, centerY } = await hoverSun(page);
  await page.mouse.click(centerX, centerY);
}

export async function measureSunFill(image: Buffer): Promise<number> {
  const { data, info } = await sharp(image).raw().toBuffer({ resolveWithObject: true });
  const isWarm = (column: number, row: number): boolean => {
    const offset = (row * info.width + column) * info.channels;
    return data[offset]! > 140 && data[offset]! > data[offset + 2]! * 1.5;
  };
  const centerColumn = Math.floor(info.width / 2);
  const centerRow = Math.floor(info.height / 2);

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

export async function waitForFiniteAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}

export async function hoverMercury(page: Page) {
  await waitForSceneReveal(page);
  const box = (await page.locator('canvas').boundingBox())!;
  await expect(async () => {
    for (let offsetY = 0.5; offsetY <= 0.85; offsetY += 0.05) {
      for (let offsetX = 0.45; offsetX <= 0.9; offsetX += 0.05) {
        await page.mouse.move(box.x + box.width * offsetX, box.y + box.height * offsetY);
        const cursor = await page.evaluate(() => document.body.style.cursor);
        if (cursor !== 'pointer') continue;
        const isMercury = await page
          .getByText('ALVO TRAVADO · 002')
          .waitFor({ state: 'visible', timeout: 400 })
          .then(() => true)
          .catch(() => false);
        if (isMercury) return;
      }
    }
    throw new Error('Mercury was not found under the pointer');
  }).toPass({ timeout: 30_000 });
}

export function expectComfortableFill(fill: number) {
  expect(fill).toBeGreaterThan(0.25);
  expect(fill).toBeLessThan(0.5);
}
