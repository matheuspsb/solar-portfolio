import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { loaderContent } from '../src/content/loader';

const loaderDialog = (page: Page) =>
  page.getByRole('dialog', { name: loaderContent.progressLabel });

const skipButton = (page: Page) => page.getByRole('button', { name: loaderContent.skipLabel });

async function waitForLoaderReady(page: Page) {
  await expect(loaderDialog(page)).toBeVisible();
  await expect(skipButton(page)).toBeFocused();
}

test('the first visit plays the loader and the page is usable once it ends', async ({ page }) => {
  await page.goto('/');
  await waitForLoaderReady(page);
  await page.keyboard.press('Tab');
  await expect(skipButton(page)).toBeFocused();
  await expect(loaderDialog(page)).toBeHidden({ timeout: 30_000 });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Sol: abrir seção Sobre' })).toBeFocused();
});

test('Escape ends the loader early', async ({ page }) => {
  await page.goto('/');
  await waitForLoaderReady(page);
  await page.keyboard.press('Escape');
  await expect(loaderDialog(page)).toBeHidden({ timeout: 8000 });
});

test('the skip button ends the loader early', async ({ page }) => {
  await page.goto('/');
  await waitForLoaderReady(page);
  await skipButton(page).click();
  await expect(loaderDialog(page)).toBeHidden({ timeout: 8000 });
});

test('a reload in the same session goes straight to the page', async ({ page }) => {
  await page.goto('/');
  await waitForLoaderReady(page);
  await page.keyboard.press('Escape');
  await expect(loaderDialog(page)).toBeHidden({ timeout: 8000 });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeAttached();
  await expect(loaderDialog(page)).toHaveCount(0);
});

test('the loader has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await waitForLoaderReady(page);
  const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(results.violations).toEqual([]);
});

test('with reduced motion the loader is static and ends as soon as the scene is ready', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(loaderDialog(page)).toBeHidden({ timeout: 15_000 });
});
