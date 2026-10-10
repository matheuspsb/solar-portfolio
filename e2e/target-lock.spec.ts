import { expect, openPage, test } from './fixtures';
import type { Locator, Page } from '@playwright/test';
import { clickSun, hoverSun } from './helpers';

async function focusMercury(page: Page) {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Mercúrio: abrir seção Contato' })).toBeFocused();
}

async function expectInsideViewport(page: Page, locator: Locator) {
  const box = (await locator.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
}

test('the card stays inside the screen on a small phone', async ({ browser }) => {
  const page = await openPage(browser, { viewport: { width: 360, height: 640 } });
  await focusMercury(page);
  const cta = page.getByText('Clique para abrir Contato →');
  await expect(cta).toBeVisible();
  await expectInsideViewport(page, cta);
  await expectInsideViewport(page, page.getByText('ALVO TRAVADO · 002'));
  await page.close();
});

test('opening the section lets go of the lock', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await hoverSun(page);
  await clickSun(page);
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
  await expect(page.getByText('ALVO TRAVADO · 001')).toBeHidden();
});

test('with reduced motion the name is shown at once, with no decoding', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await focusMercury(page);
  await expect(page.getByText('ALVO TRAVADO · 002')).toBeVisible();
  await expect(page.getByText('MERCÚRIO', { exact: true })).toBeVisible();
  const runningAnimations = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState === 'running' &&
            animation.effect?.getComputedTiming().iterations !== Infinity &&
            animation.effect?.getComputedTiming().duration !== 200,
        ).length,
  );
  expect(runningAnimations).toBe(0);
});
