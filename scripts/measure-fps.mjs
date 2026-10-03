// Usage: node scripts/measure-fps.mjs [width] [height] — average and worst-frame timings over 5 s.
// Note: headless Chromium uses software WebGL (SwiftShader), so absolute numbers are pessimistic.
import { chromium } from '@playwright/test';

const [width = '1280', height = '800'] = process.argv.slice(2);
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
await page.goto('http://localhost:3100');
await page.waitForTimeout(3000);
const stats = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const durations = [];
      let previous = performance.now();
      const start = previous;
      const tick = (now) => {
        durations.push(now - previous);
        previous = now;
        if (now - start < 5000) requestAnimationFrame(tick);
        else {
          const sorted = [...durations].sort((first, second) => first - second);
          resolve({
            frames: durations.length,
            averageFps: Math.round((durations.length / (now - start)) * 1000),
            p95FrameMs: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
            worstFrameMs: Math.round(sorted[sorted.length - 1]),
          });
        }
      };
      requestAnimationFrame(tick);
    }),
);
console.log(`${width}x${height}`, JSON.stringify(stats));
await browser.close();
