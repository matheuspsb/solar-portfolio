import { expect, test } from './fixtures';
import { hoverSun } from './helpers';

test('keyboard focus on the Sun shows the target lock and moving on hides it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Sol: abrir seção Sobre' })).toBeFocused();
  await expect(page.getByText('ALVO TRAVADO · 001')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByText('ALVO TRAVADO · 001')).toBeHidden();
});

test('hovering the Sun with the mouse shows the target lock and a pointer cursor', async ({
  page,
}) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const { centerX, centerY } = await hoverSun(page);
  expect(await page.evaluate(() => document.body.style.cursor)).toBe('pointer');
  await page.mouse.move(centerX - 400, centerY - 300, { steps: 3 });
  await expect(page.getByText('ALVO TRAVADO · 001')).toBeHidden();
});
