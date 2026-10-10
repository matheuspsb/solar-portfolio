import { expect, test } from './fixtures';
import { hoverMercury } from './helpers';

test('swings the camera so Mercury is in view and clickable after focusing it with the keyboard', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(2000);

  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Mercúrio: abrir seção Contato' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByText('ALVO TRAVADO · 002')).toBeHidden();

  await page.waitForTimeout(3000);
  await hoverMercury(page);
  await page.mouse.down();
  await page.mouse.up();
  await expect(page.getByRole('dialog', { name: 'Contato' })).toBeVisible();
});

test('keeps Mercury in the same place on screen while it orbits (the camera follows it)', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForTimeout(2000);
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(3000);
  await hoverMercury(page);
  await page.mouse.move(5, 5);
  await expect(page.getByText('ALVO TRAVADO · 002')).toBeHidden();
  await page.waitForTimeout(8000);
  await hoverMercury(page);
  await expect(page.getByText('ALVO TRAVADO · 002')).toBeVisible();
});

test('with reduced motion the camera jumps to Mercury at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(2000);
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
  await hoverMercury(page);
});
