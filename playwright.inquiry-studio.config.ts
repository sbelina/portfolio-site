import { defineConfig } from '@playwright/test'

// Synthetic state only: neither owner data nor the main studio suite is reset.
const state = '.wrangler/inquiry-studio-tests'
export default defineConfig({
  testDir: './inquiry-studio-tests', outputDir: 'studio-test-results/inquiry',
  workers: 1, fullyParallel: false, timeout: 90000,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/inquiry-studio', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4182', actionTimeout: 10000,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {},
  },
  webServer: {
    command: `npm run studio:build && npm run studio:setup -- --test && wrangler d1 execute DB --local --env test --config wrangler.studio.jsonc --persist-to ${state} --file migrations/0001_studio.sql && wrangler d1 execute DB --local --env test --config wrangler.studio.jsonc --persist-to ${state} --command "DELETE FROM workspace; DELETE FROM history; DELETE FROM sessions; DELETE FROM login_attempts;" && wrangler dev --local --env test --config wrangler.studio.jsonc --persist-to ${state} --ip 127.0.0.1 --port 4182`,
    url: 'http://127.0.0.1:4182', reuseExistingServer: false, timeout: 120000,
  },
})
