import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { waitForFiniteAnimations } from './helpers';

test('opens the Venus Arcade from the Venus keyboard control and returns focus to it', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowLeft');
  const venusControl = page.getByRole('button', { name: /^Vênus/ });
  await expect(venusControl).toBeFocused();
  await page.keyboard.press('Enter');

  const arcade = page.getByRole('dialog', { name: 'Venus Arcade' });
  await expect(arcade).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(arcade.getByRole('group', { name: 'Cartuchos do fliperama' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(arcade).toBeHidden();
  await expect(venusControl).toBeFocused();
});

test('opens the Venus Arcade from the quick-access menu with no accessibility violations', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Venus Arcade', exact: true }).click();
  const arcade = page.getByRole('dialog', { name: 'Venus Arcade' });
  await expect(arcade).toBeVisible();
  await page.keyboard.press('x');
  await expect(arcade.getByRole('group', { name: 'Cartuchos do fliperama' })).toBeVisible();
  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await arcade.getByRole('button', { name: /Sistema solar/ }).click();
  await expect(arcade).toBeHidden();
});

test('loads the Venus texture', async ({ page }) => {
  const textureResponse = page.waitForResponse(
    (response) => /\/textures\/venus(-small)?\.webp/.test(response.url()) && response.ok(),
  );
  await page.goto('/');
  await textureResponse;
});

async function openArcadeHome(page: Page) {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Venus Arcade', exact: true }).click();
  const arcade = page.getByRole('dialog', { name: 'Venus Arcade' });
  await expect(arcade).toBeVisible();
  await page.keyboard.press('Space');
  await expect(arcade.getByRole('group', { name: 'Cartuchos do fliperama' })).toBeVisible();
  return arcade;
}

test('the boot finishes on its own and shows the three cartridges', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Acesso rápido' }).click();
  await page.getByRole('button', { name: 'Venus Arcade', exact: true }).click();
  const shelf = page.getByRole('group', { name: 'Cartuchos do fliperama' });
  await expect(shelf).toBeVisible({ timeout: 10_000 });
  await expect(shelf.getByRole('button')).toHaveCount(3);
});

test('walks the cartridges with the arrow keys and rejects the broken and the sealed ones', async ({
  page,
}) => {
  const arcade = await openArcadeHome(page);
  const shelf = arcade.getByRole('group', { name: 'Cartuchos do fliperama' });
  const bugHunter = shelf.getByRole('button').nth(0);
  const sulfurDrift = shelf.getByRole('button').nth(1);
  const sealed = shelf.getByRole('button').nth(2);
  await page.keyboard.press('ArrowRight');
  await expect(sulfurDrift).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(arcade.getByRole('status').filter({ hasText: /./ })).toBeVisible();
  await expect(sulfurDrift).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(sealed).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(arcade.getByRole('status').filter({ hasText: /./ })).toBeVisible();
  await expect(shelf).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(bugHunter).toBeFocused();
});

test('inserts the first cartridge and comes back to the shelf with Escape', async ({ page }) => {
  const arcade = await openArcadeHome(page);
  const shelf = arcade.getByRole('group', { name: 'Cartuchos do fliperama' });
  await shelf.getByRole('button').first().click();
  await expect(shelf).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(shelf).toBeVisible();
  await expect(shelf.getByRole('button').first()).toBeFocused();
  await expect(arcade).toBeVisible();
});

test('has no accessibility violations on the shelf, with a cartridge selected', async ({
  page,
}) => {
  const arcade = await openArcadeHome(page);
  await page.keyboard.press('ArrowRight');
  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await expect(arcade).toBeVisible();
});

async function openBugHunter(page: Page) {
  const arcade = await openArcadeHome(page);
  await arcade
    .getByRole('group', { name: 'Cartuchos do fliperama' })
    .getByRole('button')
    .first()
    .click();
  await expect(arcade.getByRole('img', { name: /BUG HUNTER/ })).toBeVisible();
  return arcade;
}

test('starts a run from the title, shows the scoreboard and pauses and resumes with Escape', async ({
  page,
}) => {
  const arcade = await openBugHunter(page);
  const scoreboard = arcade.getByRole('group', { name: 'Placar da partida' });
  await expect(scoreboard).toBeVisible();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  await expect(scoreboard).toBeVisible();

  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.press('Escape');
  const resume = arcade.getByRole('button').filter({ hasText: /RESUME/ });
  await expect(resume).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(resume).toBeHidden();
});

test('has no accessibility violations on the title card and while the game runs', async ({
  page,
}) => {
  const arcade = await openBugHunter(page);
  await waitForFiniteAnimations(page);
  const onTitle = await new AxeBuilder({ page }).analyze();
  expect(onTitle.violations).toEqual([]);

  await page.keyboard.press('Enter');
  await page.waitForTimeout(3200);
  const whileRunning = await new AxeBuilder({ page }).analyze();
  expect(whileRunning.violations).toEqual([]);
  await expect(arcade).toBeVisible();
});

test('the game leaves the arcade shelf back with Escape from the title card', async ({ page }) => {
  const arcade = await openBugHunter(page);
  await page.keyboard.press('Escape');
  await expect(arcade.getByRole('group', { name: 'Cartuchos do fliperama' })).toBeVisible();
});

test('pauses with the scoreboard button, restarts from the pause screen and has no axe violations', async ({
  page,
}) => {
  const arcade = await openBugHunter(page);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  await arcade.getByRole('button', { name: 'Pausar' }).click();
  const resume = arcade.getByRole('button').filter({ hasText: /RESUME/ });
  await expect(resume).toBeFocused();
  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await arcade
    .getByRole('button')
    .filter({ hasText: /RESTART/ })
    .click();
  await expect(resume).toBeHidden();
  await expect(arcade.getByRole('button', { name: 'Pausar' })).toBeDisabled();
  await expect(arcade.getByRole('button', { name: 'Pausar' })).toBeEnabled({ timeout: 6000 });
});

test('shows the results after a run, focuses play again and has no axe violations', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const arcade = await openBugHunter(page);
  await page.keyboard.press('Enter');
  const playAgain = arcade.getByRole('button').filter({ hasText: /PLAY AGAIN/ });
  await expect(playAgain).toBeVisible({ timeout: 80_000 });
  await expect(playAgain).toBeFocused();
  await waitForFiniteAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.keyboard.press('r');
  await expect(playAgain).toBeHidden();
  await expect(arcade.getByRole('button', { name: 'Pausar' })).toBeVisible();
});

test('stays muted until the sound is turned on, then toggles with the button and with M', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeAudioContext = window.AudioContext;
    const created: number[] = [];
    Object.assign(window, { __audioContextsCreated: created });
    window.AudioContext = class extends NativeAudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        created.push(Date.now());
      }
    };
  });
  const arcade = await openArcadeHome(page);
  const countCreated = () =>
    page.evaluate(
      () =>
        (window as unknown as { __audioContextsCreated: number[] }).__audioContextsCreated.length,
    );
  const toggle = arcade.getByRole('button', { name: 'Som do fliperama' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('ArrowRight');
  expect(await countCreated()).toBe(0);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(await countCreated()).toBe(1);
  await page.keyboard.press('m');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('m');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(await countCreated()).toBe(1);
});
