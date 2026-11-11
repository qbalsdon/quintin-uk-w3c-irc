import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.TEST_APP_PORT || 8790);

export default defineConfig({
  testDir: './tests',
  // One app + fake IRC server is shared by all tests, so run them in order.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}/w3c-irc/`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } } }],
  webServer: {
    command: 'node tests/support/start.js',
    url: `http://127.0.0.1:${PORT}/w3c-irc/api/health`,
    env: { PORT: String(PORT) },
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
