// Use case: a recruiter opens the About panel by keyboard or by clicking the Sun, reads it,
// and closes it. Accessibility violations (contrast, names, roles) would block
// assistive-tech users, so axe runs with the panel closed and open.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { clickSun, waitForFiniteAnimations } from './helpers';

test('opens the About panel with the keyboard and restores focus on Escape', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Sobre' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { level: 2 })).toBeVisible();
  await expect(dialog.getByRole('list', { name: 'Stack principal' })).toBeVisible();
  const externalLinks = dialog.getByRole('link');
  for (const link of await externalLinks.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Sol: abrir seção Sobre' })).toBeFocused();
});

test('opens by clicking the Sun and closes by clicking outside the panel', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await clickSun(page);
  const dialog = page.getByRole('dialog', { name: 'Sobre' });
  await expect(dialog).toBeVisible();
  await page.mouse.click(20, 20);
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Sol: abrir seção Sobre' })).toBeFocused();
});

test('keeps Tab inside the open panel', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Sobre' });
  await expect(dialog).toBeVisible();
  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press('Tab');
    const isInside = await page.evaluate(
      () => document.querySelector('[role="dialog"]')?.contains(document.activeElement) ?? false,
    );
    expect(isInside).toBe(true);
  }
});

test('has no detectable accessibility violations, closed and open', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  const closedResults = await new AxeBuilder({ page }).analyze();
  expect(closedResults.violations).toEqual([]);

  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
  // Contrast is measured on the final colors, so let the slide-in/fade-in finish first.
  // Contrast is measured on the final colors, so let the slide-in and fades finish first.
  await waitForFiniteAnimations(page);
  const openResults = await new AxeBuilder({ page }).analyze();
  expect(openResults.violations).toEqual([]);
});

test('the panel fills a phone viewport', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 375, height: 700 } });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  const box = (await page.getByRole('dialog', { name: 'Sobre' }).boundingBox())!;
  expect(box.width).toBeCloseTo(375, -1);
  await page.close();
});
