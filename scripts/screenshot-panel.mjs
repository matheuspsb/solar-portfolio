// Usage: node scripts/screenshot-panel.mjs <name> [width] [height] — opens the About panel and captures it.
import { chromium } from '@playwright/test';

const [name = 'panel', width = '1280', height = '800'] = process.argv.slice(2);
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
await page.goto('http://localhost:3100');
await page.waitForTimeout(2500);
await page.keyboard.press('Tab');
await page.keyboard.press('Enter');
await page.waitForTimeout(800);
await page.screenshot({ path: `screenshots/${name}.png` });
await browser.close();
