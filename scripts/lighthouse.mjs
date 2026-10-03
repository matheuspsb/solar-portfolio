// Usage: node scripts/lighthouse.mjs [mobile|desktop] [url]
// Runs Lighthouse against a running production server using Playwright's Chromium and prints the key numbers.
import { chromium } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

const [preset = 'mobile', url = 'http://localhost:3100'] = process.argv.slice(2);
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: [
    '--headless=new',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
});

const config =
  preset === 'desktop'
    ? (await import('lighthouse/core/config/desktop-config.js')).default
    : undefined;
const result = await lighthouse(
  url,
  { port: chrome.port, output: 'json', logLevel: 'error' },
  config,
);
await chrome.kill();

const { categories, audits } = result.lhr;
const score = (key) => Math.round(categories[key].score * 100);
console.log(
  `[${preset}] performance=${score('performance')} accessibility=${score('accessibility')} best-practices=${score('best-practices')} seo=${score('seo')}`,
);
for (const key of [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interactive',
]) {
  console.log(`  ${key}: ${audits[key].displayValue}`);
}

const failing = Object.values(audits).filter(
  (audit) =>
    (audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode === 'numeric') ||
    (audit.score === 0 && audit.scoreDisplayMode === 'binary'),
);
for (const audit of failing)
  console.log(`  FAIL ${audit.id} (${audit.score}) ${audit.displayValue ?? ''}`);
