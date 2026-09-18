import { NextResponse } from 'next/server'
import { z } from 'zod'
import { planTest } from '@/planner/plan-test'
import { withEnvironmentParams } from '@/runner/environment-params'

export const runtime = 'nodejs'
export const maxDuration = 300

const createPlanRequestSchema = z.object({
  instruction: z.string().min(1)
})

export async function POST(request: Request) {
  const parsedRequest = createPlanRequestSchema.safeParse(await request.json())

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: 'Invalid plan request', details: z.treeifyError(parsedRequest.error) },
      { status: 400 }
    )
  }

  const attempt = await planTest(parsedRequest.data.instruction)

  if (!attempt.result) {
    return NextResponse.json(
      {
        error: 'The planner finished without producing a plan',
        finishReason: attempt.finishReason,
        toolsUsed: attempt.toolNames
      },
      { status: 502 }
    )
  }

  return NextResponse.json(withEnvironmentParams(attempt.result))
}
