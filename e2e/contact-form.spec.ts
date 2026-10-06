import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { waitForFiniteAnimations } from './helpers';

async function openContact(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Contato', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Contato' });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function answerAll(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Contato' });
  await dialog.getByRole('textbox', { name: /Como posso te chamar/ }).fill('Ana Souza');
  await page.keyboard.press('Enter');
  await dialog.getByRole('textbox', { name: /Para onde envio/ }).fill('ana@estudio.com');
  await page.keyboard.press('Enter');
  await dialog
    .getByRole('textbox', { name: /Sobre o que você quer conversar/ })
    .fill('Oi, Matheus! Vi seu portfólio e queria conversar.');
  await page.keyboard.press('Control+Enter');
}

test('walks the three questions by keyboard and ends with the delivery confirmation', async ({
  page,
}) => {
  const dialog = await openContact(page);
  await expect(
    dialog.getByRole('heading', { level: 2, name: 'Oi! Como posso te chamar?' }),
  ).toBeVisible();
  await answerAll(page);

  const confirmation = dialog.getByRole('heading', {
    level: 2,
    name: 'Hermes levou sua mensagem, Ana.',
  });
  await expect(confirmation).toBeVisible({ timeout: 15_000 });
  await expect(confirmation).toBeFocused();
  await expect(dialog.getByText('Vou responder em ana@estudio.com.')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Enviar outra mensagem' })).toBeVisible();
});

test('the delivery screen has no accessibility violations', async ({ page }) => {
  await openContact(page);
  await answerAll(page);
  await page
    .getByRole('heading', { level: 2, name: /Hermes levou sua mensagem/ })
    .waitFor({ timeout: 15_000 });
  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('explains an empty answer, shakes the field and has no accessibility violations', async ({
  page,
}) => {
  const dialog = await openContact(page);
  await dialog.getByRole('button', { name: 'Continuar' }).click();

  const field = dialog.getByRole('textbox', { name: /Como posso te chamar/ });
  await expect(dialog.getByText('Digite seu nome para continuar.')).toBeVisible();
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(field).toBeFocused();

  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('goes back to an answered step through its planet', async ({ page }) => {
  const dialog = await openContact(page);
  await dialog.getByRole('textbox', { name: /Como posso te chamar/ }).fill('Ana');
  await page.keyboard.press('Enter');
  await expect(dialog.getByText('02 / 03')).toBeVisible();
  await dialog.getByRole('button', { name: 'Voltar para NOME' }).click();
  await expect(dialog.getByText('01 / 03')).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: /Como posso te chamar/ })).toHaveValue('Ana');
});

test('with reduced motion the flow still completes, without the flying envelope', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const dialog = await openContact(page);
  await answerAll(page);
  await expect(
    dialog.getByRole('heading', { level: 2, name: /Hermes levou sua mensagem/ }),
  ).toBeVisible({ timeout: 5_000 });
  const runningAnimations = await page.evaluate(
    () => document.getAnimations().filter((animation) => animation.playState === 'running').length,
  );
  expect(runningAnimations).toBe(0);
});

for (const viewport of [
  { width: 320, height: 640 },
  { width: 375, height: 700 },
]) {
  test(`fits a ${viewport.width}px phone through the whole flow without horizontal scroll`, async ({
    browser,
  }) => {
    const page = await browser.newPage({ viewport });
    const dialog = await openContact(page);
    const measureOverflow = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
    expect(await measureOverflow()).toBeLessThanOrEqual(0);

    await answerAll(page);
    await dialog
      .getByRole('heading', { level: 2, name: /Hermes levou sua mensagem/ })
      .waitFor({ timeout: 15_000 });
    expect(await measureOverflow()).toBeLessThanOrEqual(0);
    const panelWidth = await dialog.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    );
    expect(panelWidth).toBeLessThanOrEqual(0);
    await page.close();
  });
}
