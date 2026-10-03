import { chromium } from '@playwright/test';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('console', (message) => console.log('console', message.type(), message.text().slice(0, 400)));
page.on('pageerror', (error) => console.log('pageerror', error.message));
await page.goto('http://localhost:3100');
await page.locator('canvas').waitFor();
await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
  gl.getExtension('WEBGL_lose_context').loseContext();
});
await page.waitForTimeout(2500);
console.log(await page.evaluate(() => document.body.innerText.slice(0, 300)));
await browser.close();
