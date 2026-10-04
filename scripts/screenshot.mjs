import { chromium } from '@playwright/test';

const [name = 'shot', width = '1280', height = '800', url = 'http://localhost:3100'] =
  process.argv.slice(2);

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
const messages = [];
page.on('console', (message) => messages.push(`${message.type()}: ${message.text()}`));
page.on('pageerror', (error) => messages.push(`pageerror: ${error.message}`));
await page.goto(url);
await page.waitForTimeout(2500);
await page.screenshot({ path: `screenshots/${name}.png` });
console.log(messages.length ? messages.join('\n') : 'console clean');
await browser.close();
