// Use case: a visitor opens the site and sees the 3D scene fill the screen without errors.
// If the canvas failed to mount or the console had errors, the main experience would be broken.
import { expect, test } from '@playwright/test';

test('mounts a full-screen WebGL canvas with a clean console', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));

  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  const viewport = page.viewportSize()!;
  // R3F measures its container asynchronously; the canvas starts at 300x150.
  await expect
    .poll(async () => (await canvas.boundingBox())?.width)
    .toBeCloseTo(viewport.width, -1);
  await expect
    .poll(async () => (await canvas.boundingBox())?.height)
    .toBeCloseTo(viewport.height, -1);
  expect(problems).toEqual([]);
});

test('loads the full-size Sun texture on desktop and the small one on phones', async ({
  browser,
}) => {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const desktopTexture = desktop.waitForResponse('**/textures/sun.webp');
  await desktop.goto('/');
  expect((await desktopTexture).status()).toBe(200);
  await desktop.close();

  const phone = await browser.newPage({ viewport: { width: 375, height: 700 } });
  const phoneTexture = phone.waitForResponse('**/textures/sun-small.webp');
  await phone.goto('/');
  expect((await phoneTexture).status()).toBe(200);
  await phone.close();
});

test('serves a favicon so the browser does not log a 404', async ({ page }) => {
  await page.goto('/');
  const iconHref = await page.locator('link[rel~="icon"]').first().getAttribute('href');
  expect(iconHref).toBeTruthy();
  const response = await page.request.get(iconHref!);
  expect(response.status()).toBe(200);
});

test('gives the 3D scene a text alternative and the page proper metadata', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: /Cena 3D interativa.*Sol/ })).toBeVisible();
  await expect(page).toHaveTitle(/Matheus/);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#03040a');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Matheus/);
});

test('exposes a sensible accessibility tree: heading, body controls and menu', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).toMatchAriaSnapshot(`
    - heading "Matheus" [level=1]
    - group "Corpos celestes":
      - 'button "Sol: abrir seção Sobre"'
    - navigation "Acesso rápido":
      - button "Acesso rápido"
  `);
});
