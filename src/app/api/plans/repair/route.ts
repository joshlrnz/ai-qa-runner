import { NextResponse } from 'next/server'
import { z } from 'zod'
import { testPlanSchema } from '@/contracts/test-plan'
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

const repairRequestSchema = z.object({
  instruction: z.string().min(1),
  plan: testPlanSchema,
  failure: z.object({
    stepIndex: z.number().int().nonnegative(),
    title: z.string(),
    error: z.string().nullable()
  })
})

function describeStep(plan: z.infer<typeof testPlanSchema>, index: number) {
  const step = plan.steps[index]

  if (!step) {
    return `step ${index + 1}`
  }

  if (step.action === 'navigate') {
    return `step ${index + 1}: navigate ${step.path}`
  }

  const value = 'value' in step ? ` with value ${JSON.stringify(step.value)}` : ''
  return `step ${index + 1}: ${step.action} ${step.selector}${value}`
}

// The failed step and its error go back to the planner as part of the
// instruction, so the repaired plan is grounded in the knowledge base again
// rather than patched by hand.
function buildRepairInstruction(input: z.infer<typeof repairRequestSchema>) {
  const { instruction, plan, failure } = input

  return [
    instruction,
    '',
    `A previous plan for this instruction, "${plan.name}", ran against the application and failed at`,
    `${describeStep(plan, failure.stepIndex)}.`,
    failure.error ? `The runner reported: ${failure.error}` : 'The runner reported no error message.',
    '',
    'Draft a corrected plan. Research the knowledge base again for the surface that step was on:',
    'the selector may be wrong for this page, the element may live behind a tab or dialog that has',
    'to be opened first, or the record chosen may be in a state that hides the control. Prefer',
    'documented flows and verified targets over the failed selector. If the knowledge base cannot',
    'express the check, report_blocked with the reason.'
  ].join('\n')
}

export async function POST(request: Request) {
  const parsed = repairRequestSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid repair request', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  let attempt: Awaited<ReturnType<typeof planTest>>

  try {
    attempt = await planTest(buildRepairInstruction(parsed.data))
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
