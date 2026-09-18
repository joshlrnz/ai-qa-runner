import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { TestPlan } from '@/contracts/test-plan'
import type { StepResult } from '@/contracts/test-run'
import { describeTestStep } from '@/lib/describe-test-step'
import { getRunDirectory } from './run-paths'

// Shape of Playwright's JSON reporter, reduced to what the run API needs.
type ReportedStep = {
  title: string
  category?: string
  duration?: number
  error?: { message?: string }
}

type ReportedResult = {
  status?: string
  error?: { message?: string }
  steps?: ReportedStep[]
}

type ReportedSuite = {
  suites?: ReportedSuite[]
  specs?: { tests?: { results?: ReportedResult[] }[] }[]
}

function collectResults(suite: ReportedSuite, into: ReportedResult[]) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      into.push(...(test.results ?? []))
    }
  }

  for (const child of suite.suites ?? []) {
    collectResults(child, into)
  }
}

function stripAnsi(text: string) {
  return text.replace(/\u001b\[[0-9;]*m/g, '')
}

function firstLine(message: string | undefined) {
  if (!message) {
    return null
  }

  const lines = stripAnsi(message)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  // Playwright's expect messages start with the assertion, then the locator,
  // then a call log; the first three lines carry what a retry needs.
  return lines.slice(0, 3).join(' ')
}

/**
 * Reads the JSON reporter output for a finished run and maps each recorded
 * test.step back onto the plan's step index. Steps after a failure were never
 * executed and are reported as skipped.
 */
export async function readStepResults(runId: string, plan: TestPlan): Promise<StepResult[] | null> {
  let report: ReportedSuite & { suites?: ReportedSuite[] }

  try {
    report = JSON.parse(await readFile(path.join(getRunDirectory(runId), 'results.json'), 'utf8'))
  } catch {
    return null
  }

  const results: ReportedResult[] = []
  collectResults(report, results)
  const last = results[results.length - 1]

  if (!last) {
    return null
  }

  const recorded = (last.steps ?? []).filter((step) => step.category === 'test.step')
  const steps: StepResult[] = []

  for (const [index, planStep] of plan.steps.entries()) {
    const reported = recorded[index]

    if (!reported) {
      steps.push({ index, title: describeTestStep(planStep), status: 'skipped', durationMs: null, error: null })
      continue
    }

    const failed = Boolean(reported.error)
    steps.push({
      index,
      title: describeTestStep(planStep),
      status: failed ? 'failed' : 'passed',
      durationMs: typeof reported.duration === 'number' ? Math.max(0, Math.round(reported.duration)) : null,
      error: failed ? firstLine(reported.error?.message) ?? firstLine(last.error?.message) : null
    })
  }

  return steps
}

export async function readRunPlan(runId: string): Promise<TestPlan | null> {
  try {
    return JSON.parse(await readFile(path.join(getRunDirectory(runId), 'plan.json'), 'utf8')) as TestPlan
  } catch {
    return null
  }
}
