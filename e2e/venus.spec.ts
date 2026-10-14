import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';
import { waitForFiniteAnimations } from './helpers';

test('opens the Venus Arcade from the Venus keyboard control and returns focus to it', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowLeft');
  const venusControl = page.getByRole('button', { name: /^Vênus/ });
  await expect(venusControl).toBeFocused();
  await page.keyboard.press('Enter');

  const arcade = page.getByRole('dialog', { name: 'Venus Arcade' });
  await expect(arcade).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(arcade).toBeHidden();
  await expect(venusControl).toBeFocused();
});

test('opens the Venus Arcade from the quick-access menu with no accessibility violations', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Venus Arcade', exact: true }).click();
  const arcade = page.getByRole('dialog', { name: 'Venus Arcade' });
  await expect(arcade).toBeVisible();
  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await arcade.getByRole('button', { name: /Sistema solar/ }).click();
  await expect(arcade).toBeHidden();
});

test('loads the Venus texture', async ({ page }) => {
  const textureResponse = page.waitForResponse(
    (response) => /\/textures\/venus(-small)?\.webp/.test(response.url()) && response.ok(),
  );
  await page.goto('/');
  await textureResponse;
});
