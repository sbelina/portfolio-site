import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4174', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {} } },
    // Every iPhone browser uses WebKit. Engine specs are browser-independent, so run once.
    { name: 'webkit', testIgnore: /edge-case-engine/, use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-webkit', testMatch: /edge-case\.spec/, use: { ...devices['iPhone 13'] } },
  ],
  webServer: [{
    command: 'npm run build:fixtures && npm run preview:fixtures -- --ip 127.0.0.1 --port 4174',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
  }, {
    command: 'wrangler dev --local --ip 127.0.0.1 --port 4175',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: false,
  }],
})
