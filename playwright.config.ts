import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

for (const environmentFile of ['.env', '.env.local']) {
  const environmentPath = path.resolve(environmentFile)

  if (existsSync(environmentPath)) {
    process.loadEnvFile(environmentPath)
  }
}

const runOutputDirectory = path.resolve(process.env.RUN_OUTPUT_DIR ?? path.join('runs', 'local'))
const configuredStorageStatePath = process.env.PLAYWRIGHT_STORAGE_STATE_PATH ?? path.join('.auth', 'dev-user.json')
const storageStatePath = path.resolve(configuredStorageStatePath)

// The runner starts every plan signed in: playwright/global-setup.ts signs the
// test account in through the credentials API and saves the session here.
// Older plans that still begin with `navigate /sign-in` must not receive it,
// or the app redirects off /sign-in and their sign-in assertions fail.
function planSignsInItself() {
  const planPath = path.resolve(process.env.TEST_PLAN_PATH ?? path.join('plans', 'smoke.json'))

  try {
    const plan = JSON.parse(readFileSync(planPath, 'utf8')) as { steps?: { action?: string; path?: string }[] }
    const first = plan.steps?.[0]
    return first?.action === 'navigate' && first.path === '/sign-in'
  } catch {
    return false
  }
}

// The file may not exist yet when this config is evaluated; global setup
// creates it before the first test runs.
const useSavedSession = !planSignsInItself()

export default defineConfig({
  testDir: './playwright',
  testMatch: /.*\.spec\.ts$/,
  globalSetup: './playwright/global-setup.ts',
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
    storageState: useSavedSession ? storageStatePath : undefined
  }
})
