// Use case: visitors hover the Sun with the mouse, or reach it with Tab. Both must show a visible
// label naming it. If the scene's raycast or the keyboard buttons broke, the Sun would be inert.
import { expect, test } from '@playwright/test';
import { hoverSun } from './helpers';

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
  const { centerX, centerY } = await hoverSun(page);
  expect(await page.evaluate(() => document.body.style.cursor)).toBe('pointer');
  await page.mouse.move(centerX - 400, centerY - 300, { steps: 3 });
  await expect(page.getByText('Sol · Sobre')).toBeHidden();
});
