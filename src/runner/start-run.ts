import { spawn } from 'node:child_process'
import { closeSync, openSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { planParamsSchema, testPlanSchema, type PlanParams, type TestPlan } from '@/contracts/test-plan'
import type { TestRun } from '@/contracts/test-run'
import { getRunDirectory } from './run-paths'
import { findMissingParams, pickNonSecretParams, toParamEnv } from './plan-params'
import { saveRun } from './run-store'

function getPlaywrightCommand() {
  const commandName = process.platform === 'win32' ? 'playwright.cmd' : 'playwright'
  return path.join(process.cwd(), 'node_modules', '.bin', commandName)
}

function getReportUrl(runId: string) {
  return `/api/runs/${runId}/report/index.html`
}

async function readMissingBrowserHint(logPath: string) {
  try {
    const log = await readFile(logPath, 'utf8')

    if (log.includes("Executable doesn't exist")) {
      return 'Playwright browsers are not installed. Run `npm run test:setup`, then start the run again.'
    }

    return null
  } catch {
    return null
  }
}

async function describeFailure(
  logPath: string,
  exitCode: number | null,
  signal: NodeJS.Signals | null
) {
  if (signal) {
    return `Playwright stopped with signal ${signal}`
  }

  const missingBrowserHint = await readMissingBrowserHint(logPath)

  if (missingBrowserHint) {
    return missingBrowserHint
  }

  return `Playwright exited with code ${exitCode ?? 'unknown'}. See run.log for details.`
}

export async function startRun(input: TestPlan, inputParams: PlanParams = {}) {
  const plan = testPlanSchema.parse(input)
  const params = planParamsSchema.parse(inputParams)
  const missingParams = findMissingParams(plan, params)

  if (missingParams.length > 0) {
    throw new Error(`Missing plan parameters: ${missingParams.join(', ')}`)
  }

  const runId = randomUUID()
  const runDirectory = getRunDirectory(runId)
  const planPath = path.join(runDirectory, 'plan.json')
  const paramsPath = path.join(runDirectory, 'params.json')
  const logPath = path.join(runDirectory, 'run.log')
  const now = new Date().toISOString()
  const queuedRun: TestRun = {
    runId,
    planName: plan.name,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    error: null,
    reportUrl: null
  }

  await mkdir(runDirectory, { recursive: true })
  await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8')
  await writeFile(
    paramsPath,
    `${JSON.stringify(pickNonSecretParams(plan, params), null, 2)}\n`,
    'utf8'
  )
  await saveRun(queuedRun)

  const logFile = openSync(logPath, 'a')
  const child = spawn(
    getPlaywrightCommand(),
    ['test', 'playwright/execute-plan.spec.ts', '--config=playwright.config.ts', '--workers=1'],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        TEST_PLAN_PATH: planPath,
        RUN_OUTPUT_DIR: runDirectory,
        ...toParamEnv(params)
      },
      stdio: ['ignore', logFile, logFile]
    }
  )
  closeSync(logFile)

  await saveRun({
    ...queuedRun,
    status: 'running',
    updatedAt: new Date().toISOString()
  })

  child.once('error', async (error) => {
    await saveRun({
      ...queuedRun,
      status: 'failed',
      updatedAt: new Date().toISOString(),
      error: error.message,
      reportUrl: null
    })
  })

  child.once('close', async (exitCode, signal) => {
    const passed = exitCode === 0
    await saveRun({
      ...queuedRun,
      status: passed ? 'passed' : 'failed',
      updatedAt: new Date().toISOString(),
      error: passed ? null : await describeFailure(logPath, exitCode, signal),
      reportUrl: getReportUrl(runId)
    })
  })

  return { runId }
}
