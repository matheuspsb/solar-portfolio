import { defineConfig } from '@playwright/test';

const port = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Software WebGL (SwiftShader) is CPU-bound; too many parallel pages starve each other.
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    launchOptions: {
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  webServer: {
    command: `pnpm build && pnpm start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
