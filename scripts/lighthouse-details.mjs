// Usage: node scripts/lighthouse-details.mjs [mobile|desktop] — prints details of the audits we are tuning.
import { chromium } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

const [preset = 'mobile', url = 'http://localhost:3100'] = process.argv.slice(2);
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const config = preset === 'desktop' ? (await import('lighthouse/core/config/desktop-config.js')).default : undefined;
const { lhr } = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error' }, config);
await chrome.kill();

for (const id of ['errors-in-console', 'largest-contentful-paint-element', 'long-tasks', 'bootup-time', 'unused-javascript', 'valid-source-maps']) {
  const audit = lhr.audits[id];
  console.log(`\n== ${id} (${audit?.score}) ${audit?.displayValue ?? ''}`);
  for (const item of audit?.details?.items?.slice(0, 6) ?? []) console.log(JSON.stringify(item).slice(0, 300));
}
