// Usage: node scripts/screenshot-focus.mjs <name>  — focuses the Sun via keyboard and captures it.
import { chromium } from '@playwright/test';

const [name = 'focus'] = process.argv.slice(2);
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:3100');
await page.waitForTimeout(2500);
await page.keyboard.press('Tab');
await page.waitForTimeout(800);
await page.screenshot({ path: `screenshots/${name}.png` });
await browser.close();
