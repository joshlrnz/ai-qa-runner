import { NextResponse } from 'next/server'
import { z } from 'zod'
import { planParamsSchema, testPlanSchema } from '@/contracts/test-plan'
import { findMissingParams, readParamsFromEnv } from '@/runner/plan-params'
import { startRun } from '@/runner/start-run'

export const runtime = 'nodejs'

const startRunRequestSchema = z.object({
  plan: testPlanSchema,
  params: planParamsSchema.default({})
})

export async function POST(request: Request) {
  const parsedRequest = startRunRequestSchema.safeParse(await request.json())

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: 'Invalid test plan',
        details: z.treeifyError(parsedRequest.error)
      },
      { status: 400 }
    )
  }

  const { plan, params: requestParams } = parsedRequest.data
  // QA_PARAM_* in the server environment (e.g. companyId, email, password in
  // .env) bind by default; values in the request win.
  const params = { ...readParamsFromEnv(process.env), ...requestParams }
  const missingParams = findMissingParams(plan, params)

  if (missingParams.length > 0) {
    return NextResponse.json(
      {
        error: 'Missing plan parameters',
        missingParams
      },
      { status: 400 }
    )
  }

  const result = await startRun(plan, params)

  return NextResponse.json(
    {
      ...result,
      status: 'queued'
    },
    { status: 202 }
  )
}
