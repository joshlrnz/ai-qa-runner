import { existsSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const localEnvironmentPath = path.resolve('.env.local')

if (existsSync(localEnvironmentPath)) {
  process.loadEnvFile(localEnvironmentPath)
}

const runOutputDirectory = path.resolve(process.env.RUN_OUTPUT_DIR ?? path.join('runs', 'local'))
const configuredStorageStatePath = process.env.PLAYWRIGHT_STORAGE_STATE_PATH ?? path.join('.auth', 'dev-user.json')
const storageStatePath = path.resolve(configuredStorageStatePath)

export default defineConfig({
  testDir: './playwright',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  outputDir: path.join(runOutputDirectory, 'test-results'),
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: path.join(runOutputDirectory, 'playwright-report'),
        open: 'never'
      }
    ]
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.TARGET_BASE_URL ?? 'https://releasing.oboda.app',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on',
    screenshot: 'only-on-failure',
    storageState: existsSync(storageStatePath) ? storageStatePath : undefined
  }
})
