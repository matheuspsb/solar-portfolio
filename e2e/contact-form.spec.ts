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

test('explains invalid fields, focuses the first one and has no accessibility violations', async ({
  page,
}) => {
  const dialog = await openContact(page);
  await dialog.getByRole('button', { name: 'Enviar mensagem' }).click();

  await expect(dialog.getByText('Informe seu nome.')).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Nome' })).toBeFocused();
  await expect(dialog.getByRole('textbox', { name: 'Nome' })).toHaveAttribute(
    'aria-invalid',
    'true',
  );

  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('sends a valid message through the server action and confirms it', async ({ page }) => {
  const dialog = await openContact(page);
  await dialog.getByRole('textbox', { name: 'Nome' }).fill('Ana Souza');
  await dialog.getByRole('textbox', { name: 'E-mail' }).fill('ana@empresa.com');
  await dialog
    .getByRole('textbox', { name: 'Mensagem' })
    .fill('Gostei do seu portfólio, vamos conversar?');
  await dialog.getByRole('button', { name: 'Enviar mensagem' }).click();

  await expect(dialog.getByRole('status')).toHaveText('Mensagem enviada. Obrigado pelo contato!');
  await expect(dialog.getByRole('textbox', { name: 'Nome' })).toHaveValue('');
});

test('keeps Tab inside the panel while moving through the form fields', async ({ page }) => {
  const dialog = await openContact(page);
  await dialog.getByRole('textbox', { name: 'Nome' }).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('textbox', { name: 'E-mail' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('textbox', { name: 'Mensagem' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Enviar mensagem' })).toBeFocused();
});

test('fits a 320px phone without horizontal scroll', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 320, height: 640 } });
  const dialog = await openContact(page);
  await dialog.getByRole('button', { name: 'Enviar mensagem' }).scrollIntoViewIfNeeded();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await page.close();
});
