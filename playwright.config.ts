import { defineConfig, devices } from '@playwright/test';

/** Puerto dedicado para E2E (evita colisión con otro `vite preview` en 4173). */
const PORT = 4287;
const HOST = '127.0.0.1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    ...devices['Pixel 7'],
    locale: 'es-ES',
  },
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort --host ${HOST}`,
    url: `http://${HOST}:${PORT}`,
    // Nunca reutilizar otro proceso en el mismo puerto (puede ser otra app).
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
