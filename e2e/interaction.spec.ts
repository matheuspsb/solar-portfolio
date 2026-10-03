// Use case: visitors hover the Sun with the mouse, or reach it with Tab. Both must show a visible
// label naming it. If the scene's raycast or the keyboard buttons broke, the Sun would be inert.
import { expect, test } from '@playwright/test';

test('keyboard focus on the Sun shows the hint and Escape-free blur hides it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Sol: abrir seção Sobre' })).toBeFocused();
  await expect(page.getByText('Sol · Sobre')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByText('Sol · Sobre')).toBeHidden();
});

test('hovering the Sun with the mouse shows the hint and a pointer cursor', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = (await canvas.boundingBox())!;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  // The raycaster may not be ready on the first move, so keep nudging until the hint appears.
  await expect(async () => {
    await page.mouse.move(centerX + 4, centerY + 4, { steps: 3 });
    await page.mouse.move(centerX, centerY, { steps: 3 });
    await expect(page.getByText('Sol · Sobre')).toBeVisible({ timeout: 500 });
  }).toPass();
  expect(await page.evaluate(() => document.body.style.cursor)).toBe('pointer');
  await page.mouse.move(box.x + 5, box.y + 5, { steps: 3 });
  await expect(page.getByText('Sol · Sobre')).toBeHidden();
});
