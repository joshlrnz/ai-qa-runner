import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { chromium } from '@playwright/test'

const localEnvironmentPath = path.resolve('.env.local')

try {
  process.loadEnvFile(localEnvironmentPath)
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
    throw error
  }
}

const targetBaseUrl = process.env.TARGET_BASE_URL ?? 'https://releasing.oboda.app'
const statePath = path.resolve(process.env.PLAYWRIGHT_STORAGE_STATE_PATH ?? path.join('.auth', 'dev-user.json'))

await mkdir(path.dirname(statePath), { recursive: true })

const browser = await chromium.launch({ headless: false })
const context = await browser.newContext()
const page = await context.newPage()
const prompt = createInterface({ input: stdin, output: stdout })

try {
  await page.goto(targetBaseUrl)
  await prompt.question('Sign in in the browser, then press Enter here to save the authenticated session. ')
  await context.storageState({ path: statePath })
  stdout.write(`\nSaved browser state to ${statePath}\n`)
} finally {
  prompt.close()
  await browser.close()
}
