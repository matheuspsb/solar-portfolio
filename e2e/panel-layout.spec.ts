import { expect, test } from './fixtures';
import { contactContent } from '../src/content/contact';

const VISIBLE_SCROLLBARS = {
  ignoreDefaultArgs: ['--hide-scrollbars'],
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
};
const DESKTOP_WITH_TASKBAR = { width: 1366, height: 949 };
const SAMPLE_MS = 2000;
const MESSAGE = 'Oi! Vi o portfólio e queria conversar sobre uma vaga de frontend.';

test.use({ launchOptions: VISIBLE_SCROLLBARS, viewport: DESKTOP_WITH_TASKBAR });

test('the contact panel keeps a steady width when its content is about as tall as the window', async ({
  page,
}) => {
  const openContact = async () => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Acesso rápido' }).click();
    await page.getByRole('button', { name: 'Contato', exact: true }).click();
    return page.getByRole('dialog', { name: 'Contato' });
  };
  let dialog = await openContact();
  await dialog.getByRole('textbox').fill('Matheus Souza');
  await page.keyboard.press('Enter');
  await dialog.getByRole('textbox').fill('matheus@email.com');
  await page.keyboard.press('Enter');
  await dialog
    .getByRole('textbox', { name: new RegExp(contactContent.steps[2]!.question.slice(0, 12)) })
    .fill(MESSAGE);

  dialog = await openContact();
  await expect(dialog.getByRole('textbox')).toHaveValue(MESSAGE);
  await page.waitForTimeout(1000);

  const widths = await dialog.evaluate(
    (panel, sampleMs) =>
      new Promise<number[]>((resolve) => {
        const scroller = [...panel.querySelectorAll<HTMLElement>('*')].find(
          (element) => getComputedStyle(element).overflowY === 'auto',
        )!;
        const samples: number[] = [];
        const startedAt = performance.now();
        const sample = () => {
          samples.push(scroller.clientWidth);
          if (performance.now() - startedAt < sampleMs) requestAnimationFrame(sample);
          else resolve(samples);
        };
        requestAnimationFrame(sample);
      }),
    SAMPLE_MS,
  );
  expect(new Set(widths).size).toBe(1);
});
