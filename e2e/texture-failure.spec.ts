// Use case: the Sun texture can fail (offline CDN, 404, blocked request). The visitor must still
// get a glowing Sun and a working page; a missing texture must not blank or crash the scene.
import { expect, test } from '@playwright/test';
import { measureSunFill } from './helpers';

test('shows a warm solid Sun and keeps working when the texture request fails', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route('**/textures/*.webp', (route) => route.abort());

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(2500);

  const fill = measureSunFill(await page.locator('canvas').screenshot());
  expect(await fill).toBeGreaterThan(0.4);
  expect(await fill).toBeLessThan(0.7);

  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
