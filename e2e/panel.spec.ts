// Use case: a recruiter opens the About panel by keyboard or by clicking the Sun, reads the
// approved facts, and closes it. Accessibility violations (contrast, names, roles) would block
// assistive-tech users, so axe runs with the panel closed and open.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { clickSun } from './helpers';

test('opens the About panel with the keyboard and restores focus on Escape', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Sobre' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Matheus' })).toBeVisible();
  await expect(dialog.getByText('Campina Grande, Paraíba, Brasil')).toBeVisible();
  await expect(dialog.getByRole('list', { name: 'Stack principal' })).toContainText(
    'TanStack Query',
  );
  await expect(dialog.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/matheuspaulosouza',
  );
  await expect(dialog.getByRole('link', { name: /Solar System Scope/ })).toBeVisible();

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
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((animation) => animation.finished)),
  );
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
