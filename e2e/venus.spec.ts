import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, openPage, test } from './fixtures';
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

async function openArcadeFromMenu(page: Page) {
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Venus Arcade', exact: true }).click();
  const arcade = page.getByRole('dialog', { name: 'Venus Arcade' });
  await expect(arcade).toBeVisible();
  return arcade;
}

test('inside the arcade, Escape closes the open menu first and then leaves', async ({ page }) => {
  await page.goto('/');
  const arcade = await openArcadeFromMenu(page);
  const toggle = arcade.getByRole('button', { name: 'Acesso rápido' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(arcade).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(arcade).toBeHidden();
});

test('choosing Contact in the arcade menu leaves the arcade and opens the panel', async ({
  page,
}) => {
  await page.goto('/');
  const arcade = await openArcadeFromMenu(page);
  await arcade.getByRole('button', { name: 'Acesso rápido' }).click();
  await arcade.getByRole('button', { name: 'Contato', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Contato' })).toBeVisible();
  await expect(arcade).toBeHidden();
});

for (const width of [320, 360, 375, 768]) {
  test(`the way back fits next to the menu at ${width}px`, async ({ browser }) => {
    const page = await openPage(browser, { viewport: { width, height: 700 } });
    await page.goto('/');
    const arcade = await openArcadeFromMenu(page);
    const backBox = (await arcade.getByRole('button', { name: 'Sistema solar' }).boundingBox())!;
    const toggleBox = (await arcade.getByRole('button', { name: 'Acesso rápido' }).boundingBox())!;
    expect(backBox.x).toBeGreaterThanOrEqual(0);
    expect(backBox.x + backBox.width).toBeLessThan(toggleBox.x);
    await page.close();
  });
}

test('loads the Venus texture', async ({ page }) => {
  const textureResponse = page.waitForResponse(
    (response) => /\/textures\/venus(-small)?\.webp/.test(response.url()) && response.ok(),
  );
  await page.goto('/');
  await textureResponse;
});
