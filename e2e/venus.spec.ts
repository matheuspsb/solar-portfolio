import { expect, test } from './fixtures';

test('keeps Venus out of the keyboard controls and the menu until it has a section', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: /Vênus/ })).toHaveCount(0);
  await page.keyboard.press('Tab');
  const sunControl = page.getByRole('button', { name: 'Sol: abrir seção Sobre' });
  await expect(sunControl).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(sunControl).toBeFocused();
});
