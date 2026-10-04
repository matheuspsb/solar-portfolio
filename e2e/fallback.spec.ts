import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('without WebGL', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        contextId: string,
        ...rest: unknown[]
      ) {
        if (contextId.startsWith('webgl') || contextId === 'experimental-webgl') return null;
        return (originalGetContext as (...args: unknown[]) => unknown).call(
          this,
          contextId,
          ...rest,
        );
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
  });

  test('shows the fallback message and no canvas, with a clean console', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) problems.push(message.text());
    });
    page.on('pageerror', (error) => problems.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('status')).toContainText('cena 3D');
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(problems).toEqual([]);
  });

  test('opens the About content from the fallback and from the menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir Sobre' }).click();
    const dialog = page.getByRole('dialog', { name: 'Sobre' });
    await expect(dialog.getByRole('heading', { name: 'Matheus' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Abrir Sobre' })).toBeFocused();

    await page.getByRole('button', { name: 'Acesso rápido' }).click();
    await page.getByRole('button', { name: 'Sobre', exact: true }).click();
    await expect(dialog).toBeVisible();
  });

  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('status')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test('shows a recovery notice when the WebGL context is lost and hides it when restored', async ({
  page,
}) => {
  const textureLoaded = page.waitForResponse('**/textures/sun.webp');
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await textureLoaded;
  await page.waitForTimeout(1500);
  await expect(page.getByRole('status')).toHaveCount(0);

  await page.evaluate(() => {
    const canvas = document.querySelector('canvas')!;
    const gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGL2RenderingContext;
    const extension = gl.getExtension('WEBGL_lose_context')!;
    (window as unknown as { __loseContext: typeof extension }).__loseContext = extension;
    extension.loseContext();
  });
  await expect(page.getByRole('status')).toContainText('perdeu o contexto');

  await page.evaluate(() =>
    (
      window as unknown as { __loseContext: { restoreContext: () => void } }
    ).__loseContext.restoreContext(),
  );
  await expect(page.getByRole('status')).toHaveCount(0);
});
