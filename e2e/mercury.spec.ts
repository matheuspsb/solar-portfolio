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

type Box = { x: number; y: number; width: number; height: number };

const overlaps = (first: Box, second: Box): boolean =>
  first.x < second.x + second.width &&
  second.x < first.x + first.width &&
  first.y < second.y + second.height &&
  second.y < first.y + first.height;

for (const width of [320, 375, 1280]) {
  test(`lists every destination on screen, apart from each other and the toggle at ${width}px`, async ({
    browser,
  }) => {
    const page = await openPage(browser, { viewport: { width, height: 740 } });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Acesso rápido' });
    await toggle.click();
    await page.waitForTimeout(1300);
    const boxes: Box[] = [(await toggle.boundingBox())!];
    for (const name of ['Sobre', 'Contato', 'Venus Arcade']) {
      const box = (await page.getByRole('button', { name, exact: true }).boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      for (const placed of boxes) expect(overlaps(box, placed)).toBe(false);
      boxes.push(box);
    }
    await page.close();
  });
}
