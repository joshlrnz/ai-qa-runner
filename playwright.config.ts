import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const localEnvironmentPath = path.resolve('.env.local')

if (existsSync(localEnvironmentPath)) {
  process.loadEnvFile(localEnvironmentPath)
}

const runOutputDirectory = path.resolve(process.env.RUN_OUTPUT_DIR ?? path.join('runs', 'local'))
const configuredStorageStatePath = process.env.PLAYWRIGHT_STORAGE_STATE_PATH ?? path.join('.auth', 'dev-user.json')
const storageStatePath = path.resolve(configuredStorageStatePath)

// Plans from the grounded planner sign in themselves (their first step is
// `navigate /sign-in`), so a saved session must not be injected for them —
// the app would redirect off /sign-in and the sign-in assertions would fail.
// Plans from /api/generate carry no sign-in and need the saved session.
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

const useSavedSession = existsSync(storageStatePath) && !planSignsInItself()

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
    storageState: useSavedSession ? storageStatePath : undefined
  }
})
