import { test as base } from '@playwright/test';
import type { Browser, BrowserContextOptions, Page } from '@playwright/test';
import { LOADER_SEEN_KEY } from '../src/lib/loader-seen';

export { expect } from '@playwright/test';

async function markLoaderSeen(page: Page): Promise<void> {
  await page.addInitScript((key) => sessionStorage.setItem(key, '1'), LOADER_SEEN_KEY);
}

export async function openPage(browser: Browser, options?: BrowserContextOptions): Promise<Page> {
  const page = await browser.newPage(options);
  await markLoaderSeen(page);
  return page;
}

export const test = base.extend<{ skipLoader: void }>({
  skipLoader: [
    async ({ page }, use) => {
      await markLoaderSeen(page);
      await use();
    },
    { auto: true },
  ],
});
