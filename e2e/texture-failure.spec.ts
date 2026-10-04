import { expect, test } from '@playwright/test';
import { expectComfortableFill, measureSunFill } from './helpers';

test('shows a warm solid Sun and keeps working when the texture request fails', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route('**/textures/*.webp', (route) => route.abort());

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(2500);

  expectComfortableFill(await measureSunFill(await page.locator('canvas').screenshot()));

  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
