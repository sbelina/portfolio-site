import { defineConfig } from '@playwright/test'
// Unit and integration tests for the private thought archive. No browser or server needed:
// the Worker runs in-process against an in-memory SQLite stand-in for D1.
export default defineConfig({ testDir: './thoughts-tests', outputDir: 'thoughts-test-results', workers: 1, reporter: [['list']] })
