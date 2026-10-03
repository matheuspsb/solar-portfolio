// Use case: a recruiter uses the top-right quick-access menu to reach the About panel without
// touching the 3D scene, by mouse or keyboard, and ends up back at the menu button.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('opens the About panel from the menu with the mouse and returns focus to the button', async ({
  page,
}) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Acesso rápido' });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Sobre' });
  await expect(dialog).toBeVisible();
  await page.getByRole('button', { name: 'Fechar painel' }).click();
  await expect(dialog).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('opens the panel from the menu using only the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Acesso rápido' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Sobre', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Acesso rápido' })).toBeFocused();
});

test('is positioned in the top-right corner on desktop and phone', async ({ browser }) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 375, height: 700 },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto('/');
    const box = (await page.getByRole('button', { name: 'Acesso rápido' }).boundingBox())!;
    expect(box.y).toBeLessThan(40);
    expect(box.x + box.width).toBeGreaterThan(viewport.width - 40);
    expect(box.x).toBeGreaterThanOrEqual(0);
    await page.close();
  }
});

test('has no accessibility violations with the menu expanded', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await expect(page.getByRole('button', { name: 'Sobre', exact: true })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
