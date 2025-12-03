import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000, // Increased to 60s for dev server
  expect: { timeout: 15 * 1000 }, // Increased expect timeout
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // 1 retry in dev
  workers: process.env.CI ? 2 : 4, // 4 workers for parallel execution
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    navigationTimeout: 30 * 1000, // 30s for page navigation
    actionTimeout: 15 * 1000, // 15s for actions like click
  },

  webServer: {
    command: process.env.PLAYWRIGHT_WEB_SERVER_CMD || 'npm run dev',
    url: process.env.BASE_URL || 'http://localhost:5000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
