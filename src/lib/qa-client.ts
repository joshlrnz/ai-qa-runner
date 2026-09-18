import { z } from 'zod'
import { planResultSchema, type ClarificationAnswers, type PlanResult } from '@/contracts/plan-request'
import { startRunResponseSchema, testRunSchema, type TestRun } from '@/contracts/test-run'
import type { PlanParams, TestPlan } from '@/contracts/test-plan'

export class QaRequestError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'QaRequestError'
    this.status = status
  }
}

const errorBodySchema = z.object({ error: z.string().min(1) })

async function readErrorMessage(response: Response) {
  const text = await response.text()

  if (!text) {
    return `Request failed with status ${response.status}`
  }

  try {
    const parsed = errorBodySchema.safeParse(JSON.parse(text))

    if (parsed.success) {
      return parsed.data.error
    }
  } catch {
    return text.slice(0, 300)
  }

  return text.slice(0, 300)
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new QaRequestError(response.status, await readErrorMessage(response))
  }

  return response.json()
}

export async function createPlan(instruction: string): Promise<PlanResult> {
  return planResultSchema.parse(await postJson('/api/plans', { instruction }))
}

export async function answerPlanQuestions(
  runId: string,
  answers: ClarificationAnswers
): Promise<PlanResult> {
  return planResultSchema.parse(await postJson(`/api/plans/${runId}`, answers))
}

export type RunFailure = { stepIndex: number; title: string; error: string | null }

export async function repairPlan(
  instruction: string,
  plan: TestPlan,
  failure: RunFailure
): Promise<PlanResult> {
  return planResultSchema.parse(await postJson('/api/plans/repair', { instruction, plan, failure }))
}

export async function startTestRun(plan: TestPlan, params: PlanParams) {
  return startRunResponseSchema.parse(await postJson('/api/runs', { plan, params }))
}

export async function fetchTestRun(runId: string): Promise<TestRun> {
  const response = await fetch(`/api/runs/${runId}`, { cache: 'no-store' })

  if (!response.ok) {
    throw new QaRequestError(response.status, await readErrorMessage(response))
  }

  return testRunSchema.parse(await response.json())
}
