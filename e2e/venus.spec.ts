import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
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
  await expect(arcade.getByRole('group', { name: 'Cartuchos do fliperama' })).toBeVisible();
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
  await page.keyboard.press('x');
  await expect(arcade.getByRole('group', { name: 'Cartuchos do fliperama' })).toBeVisible();
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

async function openArcadeHome(page: Page) {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Venus Arcade', exact: true }).click();
  const arcade = page.getByRole('dialog', { name: 'Venus Arcade' });
  await expect(arcade).toBeVisible();
  await page.keyboard.press('Space');
  await expect(arcade.getByRole('group', { name: 'Cartuchos do fliperama' })).toBeVisible();
  return arcade;
}

test('the boot finishes on its own and shows the three cartridges', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Venus Arcade', exact: true }).click();
  const shelf = page.getByRole('group', { name: 'Cartuchos do fliperama' });
  await expect(shelf).toBeVisible({ timeout: 10_000 });
  await expect(shelf.getByRole('button')).toHaveCount(3);
});

test('walks the cartridges with the arrow keys and rejects the broken and the sealed ones', async ({
  page,
}) => {
  const arcade = await openArcadeHome(page);
  const shelf = arcade.getByRole('group', { name: 'Cartuchos do fliperama' });
  const bugHunter = shelf.getByRole('button').nth(0);
  const sulfurDrift = shelf.getByRole('button').nth(1);
  const sealed = shelf.getByRole('button').nth(2);
  await page.keyboard.press('ArrowRight');
  await expect(sulfurDrift).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(arcade.getByRole('status').filter({ hasText: /./ })).toBeVisible();
  await expect(sulfurDrift).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(sealed).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(arcade.getByRole('status').filter({ hasText: /./ })).toBeVisible();
  await expect(shelf).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(bugHunter).toBeFocused();
});

test('inserts the first cartridge and comes back to the shelf with Escape', async ({ page }) => {
  const arcade = await openArcadeHome(page);
  const shelf = arcade.getByRole('group', { name: 'Cartuchos do fliperama' });
  await shelf.getByRole('button').first().click();
  await expect(shelf).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(shelf).toBeVisible();
  await expect(shelf.getByRole('button').first()).toBeFocused();
  await expect(arcade).toBeVisible();
});

test('has no accessibility violations on the shelf, with a cartridge selected', async ({
  page,
}) => {
  const arcade = await openArcadeHome(page);
  await page.keyboard.press('ArrowRight');
  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await expect(arcade).toBeVisible();
});
