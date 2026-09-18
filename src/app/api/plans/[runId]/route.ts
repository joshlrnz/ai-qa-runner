import { NextResponse } from 'next/server'
import { z } from 'zod'
import { clarificationAnswersSchema } from '@/contracts/plan-request'
import { resumePlanTest, UnknownPlanRunError } from '@/planner/plan-test'
import { withEnvironmentParams } from '@/runner/environment-params'

export const runtime = 'nodejs'
export const maxDuration = 300

type RouteContext = {
  params: Promise<{
    runId: string
  }>
}

export async function POST(request: Request, context: RouteContext) {
  const { runId } = await context.params
  const parsedRequest = clarificationAnswersSchema.safeParse(await request.json())

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: 'Invalid answers', details: z.treeifyError(parsedRequest.error) },
      { status: 400 }
    )
  }

  try {
    const attempt = await resumePlanTest(runId, parsedRequest.data)

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
  } catch (error) {
    if (error instanceof UnknownPlanRunError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    throw error
  }
}
