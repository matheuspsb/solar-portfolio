import { chromium } from '@playwright/test';

const [mode = 'first', throttle = '4', width = '390', height = '844'] = process.argv.slice(2);
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
if (mode === 'loader-only') {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...rest) {
      if (String(type).includes('webgl')) return null;
      return original.call(this, type, ...rest);
    };
  });
}
if (mode === 'seen') await page.addInitScript(() => sessionStorage.setItem('loaderSeen', '1'));
const client = await page.context().newCDPSession(page);
await client.send('Emulation.setCPUThrottlingRate', { rate: Number(throttle) });
await page.addInitScript(() => {
  window.__longTasks = [];
  window.__frames = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__longTasks.push(entry.duration);
  }).observe({ entryTypes: ['longtask'] });
  let previous = performance.now();
  const tick = (now) => {
    window.__frames.push(now - previous);
    previous = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await page.goto('http://localhost:3100');
await page.waitForTimeout(9000);
const stats = await page.evaluate(() => {
  const sorted = [...window.__frames].sort((first, second) => first - second);
  const blocking = window.__longTasks.reduce(
    (total, duration) => total + Math.max(0, duration - 50),
    0,
  );
  return {
    frames: sorted.length,
    p50FrameMs: Math.round(sorted[Math.floor(sorted.length * 0.5)]),
    p95FrameMs: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
    longTasks: window.__longTasks.length,
    blockingMs: Math.round(blocking),
  };
});
console.log(mode, `cpu x${throttle}`, `${width}x${height}`, JSON.stringify(stats));
await browser.close();
