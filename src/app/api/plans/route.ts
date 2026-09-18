import { NextResponse } from 'next/server'
import { z } from 'zod'
import { planTest } from '@/planner/plan-test'
import { withEnvironmentParams } from '@/runner/environment-params'

// Planner calls go out to the model provider; a network timeout or provider
// error should read as "try again", not as an application crash.
function describeUpstreamFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : ''
  const timedOut = /ETIMEDOUT|ECONNRESET|terminated|timeout|fetch failed/i.test(`${message} ${cause}`)

  return timedOut
    ? 'The connection to the model provider timed out before the plan came back. Nothing was changed; try again.'
    : `The planner could not complete: ${message}`
}


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

  let attempt: Awaited<ReturnType<typeof planTest>>

  try {
    attempt = await planTest(parsedRequest.data.instruction)
  } catch (error) {
    console.error('[planner] upstream failure', error)
    return NextResponse.json({ error: describeUpstreamFailure(error) }, { status: 502 })
  }

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
