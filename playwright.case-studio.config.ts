import { defineConfig } from '@playwright/test'
import studio from './playwright.studio.config'

const server = studio.webServer
if (!server || Array.isArray(server)) throw new Error('Expected one isolated private test server')
export default defineConfig({
  ...studio,
  testDir: './studio-case-tests',
  outputDir: 'studio-case-test-results',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/studio-cases', open: 'never' }]],
  // Reuse the verified loopback setup with a distinct synthetic D1 directory.
  // Run after the existing private suite; neither directory is an owner's DB.
  webServer: { ...server, command: server.command.replaceAll('.wrangler/studio-tests', '.wrangler/studio-case-tests') },
})
