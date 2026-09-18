import { NextResponse } from 'next/server'
import { reconcileRun } from '@/runner/reconcile-run'
import { getRun } from '@/runner/run-store'
import { readRunPlan, readStepResults } from '@/runner/read-step-results'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    runId: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { runId } = await context.params

  try {
    const run = await getRun(runId)

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    const reconciled = await reconcileRun(run)

    if (reconciled.status === 'queued' || reconciled.status === 'running' || reconciled.steps?.length) {
      return NextResponse.json(reconciled)
    }

    // Terminal run: attach per-step outcomes from Playwright's JSON reporter so
    // the UI can show which step failed and offer a grounded retry.
    const plan = await readRunPlan(runId)
    const steps = plan ? await readStepResults(runId, plan) : null

    return NextResponse.json(steps ? { ...reconciled, steps } : reconciled)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to read run'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
