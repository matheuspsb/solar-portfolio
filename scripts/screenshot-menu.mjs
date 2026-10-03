// Usage: node scripts/screenshot-menu.mjs <name> [width] [height] — expands the quick-access menu and captures it.
import { chromium } from '@playwright/test';

const [name = 'menu', width = '1280', height = '800'] = process.argv.slice(2);
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
await page.goto('http://localhost:3100');
await page.waitForTimeout(2500);
await page.getByRole('button', { name: 'Acesso rápido' }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `screenshots/${name}.png` });
await browser.close();
