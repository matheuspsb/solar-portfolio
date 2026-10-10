import AxeBuilder from '@axe-core/playwright';
import { expect, openPage, test } from './fixtures';
import { waitForFiniteAnimations } from './helpers';

test('opens the About panel from the menu with the mouse and returns focus to the button', async ({
  page,
}) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Acesso rápido' });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await page.getByRole('button', { name: 'Sobre', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Sobre' });
  await expect(dialog).toBeVisible();
  await page.getByRole('button', { name: 'Fechar painel' }).click();
  await expect(dialog).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('opens the panel from the menu using only the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Acesso rápido' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Sobre', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Sobre' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Acesso rápido' })).toBeFocused();
});

test('is positioned in the top-right corner on desktop and phone', async ({ browser }) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 375, height: 700 },
  ]) {
    const page = await openPage(browser, { viewport });
    await page.goto('/');
    const box = (await page.getByRole('button', { name: 'Acesso rápido' }).boundingBox())!;
    expect(box.y).toBeLessThan(40);
    expect(box.x + box.width).toBeGreaterThan(viewport.width - 40);
    expect(box.x).toBeGreaterThanOrEqual(0);
    await page.close();
  }
});

test('has no accessibility violations with the menu expanded', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await expect(page.getByRole('button', { name: 'Sobre', exact: true })).toBeVisible();
  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('keeps destinations unreachable while collapsed and on screen once expanded', async ({
  browser,
}) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 375, height: 740 },
  ]) {
    const page = await openPage(browser, { viewport });
    await page.goto('/');
    const destination = page.getByRole('button', { name: 'Sobre', exact: true });
    await expect(destination).toHaveCount(0);

    const toggle = page.getByRole('button', { name: 'Acesso rápido' });
    await toggle.click();
    await expect(destination).toBeVisible();
    await page.waitForTimeout(1200);
    const box = (await destination.boundingBox())!;
    const toggleBox = (await toggle.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y).toBeGreaterThan(toggleBox.y + toggleBox.height);
    expect(box.x + box.width).toBeLessThan(toggleBox.x + toggleBox.width);

    await page.keyboard.press('Escape');
    await expect(destination).toHaveCount(0);
    await page.close();
  }
});

test('with reduced motion the destinations only fade (no flight along the arc)', async ({
  browser,
}) => {
  const readTransitionProperty = async (reducedMotion: 'reduce' | 'no-preference') => {
    const page = await openPage(browser);
    await page.emulateMedia({ reducedMotion });
    await page.goto('/');
    await page.getByRole('button', { name: 'Acesso rápido' }).click();
    const property = await page
      .getByRole('button', { name: 'Sobre', exact: true })
      .evaluate((element) => getComputedStyle(element.closest('li')!).transitionProperty);
    await page.close();
    return property;
  };

  expect(await readTransitionProperty('no-preference')).toContain('translate');
  expect(await readTransitionProperty('reduce')).toBe('opacity');
});
