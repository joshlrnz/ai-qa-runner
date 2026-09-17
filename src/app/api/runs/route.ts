import { NextResponse } from 'next/server'
import { z } from 'zod'
import { testPlanSchema } from '@/contracts/test-plan'
import { startRun } from '@/runner/start-run'

export const runtime = 'nodejs'

const startRunRequestSchema = z.object({
  plan: testPlanSchema
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

  const result = await startRun(parsedRequest.data.plan)

  return NextResponse.json(
    {
      ...result,
      status: 'queued'
    },
    { status: 202 }
  )
}
