import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir:'./atlas-tests',outputDir:'atlas-test-results',fullyParallel:true,
  workers:2,retries:process.env.CI?1:0,reporter:[['list']],
  use:{baseURL:'http://127.0.0.1:4176',trace:'retain-on-failure'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome'],launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}}}],
  webServer:{command:'npm run build:atlas && npm run preview:atlas -- --ip 127.0.0.1 --port 4176',url:'http://127.0.0.1:4176/lab/atlas/',reuseExistingServer:false},
})
