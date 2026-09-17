import { NextResponse } from 'next/server'
import { getRun } from '@/runner/run-store'

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

    return NextResponse.json(run)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to read run'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
