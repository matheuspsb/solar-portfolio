import AxeBuilder from '@axe-core/playwright';
import { expect, openPage, test } from './fixtures';
import { hoverMercury, waitForFiniteAnimations } from './helpers';

test('opens Contact from the Mercury keyboard control and returns focus to it', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowRight');
  const mercuryControl = page.getByRole('button', { name: 'Mercúrio: abrir seção Contato' });
  await expect(mercuryControl).toBeFocused();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Contato' });
  await expect(dialog).toBeVisible();
  const link = dialog.getByRole('link', { name: /LinkedIn/ });
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(mercuryControl).toBeFocused();
});

test('opens Contact from the quick-access menu and the panel has no accessibility violations', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Contato', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Contato' })).toBeVisible();
  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('hovering and clicking Mercury in the scene opens Contact (reduced motion)', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(2500);
  await hoverMercury(page);
  await expect(page.getByText('ALVO TRAVADO · 002')).toBeVisible();
  await page.mouse.down();
  await page.mouse.up();
  await expect(page.getByRole('dialog', { name: 'Contato' })).toBeVisible();
});

test('lists both destinations in the menu without leaving the screen on a narrow phone', async ({
  browser,
}) => {
  const page = await openPage(browser, { viewport: { width: 320, height: 640 } });
  await page.goto('/');
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.waitForTimeout(1300);
  for (const name of ['Sobre', 'Contato']) {
    const box = (await page.getByRole('button', { name, exact: true }).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
  }
  await page.close();
});
