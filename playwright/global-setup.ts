import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { request, type FullConfig } from '@playwright/test'

// Signs the test account in once, through the app's next-auth credentials API,
// and saves the session as Playwright storage state. Every plan then starts
// authenticated, so plans carry no sign-in steps and no credentials.
//
// Credentials come from the environment: QA_PARAM_email / QA_PARAM_password
// (what /api/runs binds) or E2E_EMAIL / E2E_PASSWORD (.env). A saved session
// that still resolves to a user is reused as is.

function loadEnvFiles() {
  for (const file of ['.env', '.env.local']) {
    const filePath = path.resolve(file)

    if (existsSync(filePath)) {
      try {
        process.loadEnvFile(filePath)
      } catch {
        // Already loaded, or unreadable: the process environment wins anyway.
      }
    }
  }
}

function getCredentials() {
  const email = process.env.QA_PARAM_email ?? process.env.E2E_EMAIL
  const password = process.env.QA_PARAM_password ?? process.env.E2E_PASSWORD

  return email && password ? { email, password } : null
}

export function getStorageStatePath() {
  return path.resolve(process.env.PLAYWRIGHT_STORAGE_STATE_PATH ?? path.join('.auth', 'dev-user.json'))
}

async function sessionIsValid(baseURL: string, storageState: string) {
  const context = await request.newContext({ baseURL, storageState })

  try {
    const response = await context.get('/api/auth/session')

    if (!response.ok()) {
      return false
    }

    const session = (await response.json()) as { user?: unknown }
    return Boolean(session?.user)
  } catch {
    return false
  } finally {
    await context.dispose()
  }
}

async function signIn(baseURL: string, storageState: string, email: string, password: string) {
  const context = await request.newContext({ baseURL })

  try {
    const csrf = (await (await context.get('/api/auth/csrf')).json()) as { csrfToken: string }
    await context.post('/api/auth/callback/credentials', {
      form: { csrfToken: csrf.csrfToken, email, password, redirect: 'false', json: 'true' }
    })

    const session = (await (await context.get('/api/auth/session')).json()) as { user?: unknown }

    if (!session?.user) {
      throw new Error(
        'Sign-in through the credentials API did not produce a session. Check QA_PARAM_email / QA_PARAM_password (or E2E_EMAIL / E2E_PASSWORD).'
      )
    }

    await mkdir(path.dirname(storageState), { recursive: true })
    await context.storageState({ path: storageState })
  } finally {
    await context.dispose()
  }
}

export default async function globalSetup(config: FullConfig) {
  loadEnvFiles()

  const baseURL =
    config.projects[0]?.use?.baseURL ?? process.env.TARGET_BASE_URL ?? 'https://releasing.oboda.app'
  const storageState = getStorageStatePath()

  if (existsSync(storageState) && (await sessionIsValid(baseURL, storageState))) {
    return
  }

  const credentials = getCredentials()

  if (!credentials) {
    if (existsSync(storageState)) {
      throw new Error(
        `The saved session at ${storageState} has expired and no credentials are configured to renew it. Set QA_PARAM_email and QA_PARAM_password in .env, or run npm run auth:setup.`
      )
    }

    throw new Error(
      `No saved session at ${storageState} and no credentials configured. Set QA_PARAM_email and QA_PARAM_password in .env, or run npm run auth:setup.`
    )
  }

  await signIn(baseURL, storageState, credentials.email, credentials.password)
}
