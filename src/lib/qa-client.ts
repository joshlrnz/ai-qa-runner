import { z } from 'zod'
import { generateResponseSchema, type GenerateResponse } from '@/contracts/test-generation'
import { startRunResponseSchema, testRunSchema, type TestRun } from '@/contracts/test-run'
import type { TestPlan } from '@/contracts/test-plan'

export class QaRequestError extends Error {
  readonly status: number
  // Plan parameter names /api/runs reported as unbound, so the UI can ask for them.
  readonly missingParams: string[]

  constructor(status: number, message: string, missingParams: string[] = []) {
    super(message)
    this.name = 'QaRequestError'
    this.status = status
    this.missingParams = missingParams
  }
}

const errorBodySchema = z.object({
  error: z.string().min(1),
  missingParams: z.array(z.string()).optional()
})

async function readError(response: Response) {
  const text = await response.text()

  if (!text) {
    return { message: `Request failed with status ${response.status}`, missingParams: [] }
  }

  try {
    const parsed = errorBodySchema.safeParse(JSON.parse(text))

    if (parsed.success) {
      return { message: parsed.data.error, missingParams: parsed.data.missingParams ?? [] }
    }
  } catch {
    return { message: text.slice(0, 300), missingParams: [] }
  }

  return { message: text.slice(0, 300), missingParams: [] }
}

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

export async function generateTestPlan(description: string): Promise<GenerateResponse> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ description })
  })

  if (!response.ok) {
    throw new QaRequestError(response.status, await readErrorMessage(response))
  }

  return generateResponseSchema.parse(await response.json())
}

export async function startTestRun(plan: TestPlan, params: Record<string, string> = {}) {
  const response = await fetch('/api/runs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ plan, params })
  })

  if (!response.ok) {
    const { message, missingParams } = await readError(response)
    throw new QaRequestError(response.status, message, missingParams)
  }

  return startRunResponseSchema.parse(await response.json())
}

export async function fetchTestRun(runId: string): Promise<TestRun> {
  const response = await fetch(`/api/runs/${runId}`, { cache: 'no-store' })

  if (!response.ok) {
    throw new QaRequestError(response.status, await readErrorMessage(response))
  }

  return testRunSchema.parse(await response.json())
}
