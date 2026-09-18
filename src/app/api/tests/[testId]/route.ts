import { NextResponse } from 'next/server'
import { z } from 'zod'
import { recordTestRunRequestSchema } from '@/contracts/saved-test'
import { getSavedTest, recordSavedTestRun, UnknownSavedTestError } from '@/library/saved-test-store'
import { isValidTestId } from '@/library/saved-test-paths'

function notFound(testId: string) {
  return NextResponse.json({ error: `No saved test with ID ${testId}` }, { status: 404 })
}

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    testId: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { testId } = await context.params

  if (!isValidTestId(testId)) {
    return notFound(testId)
  }

  const savedTest = await getSavedTest(testId)

  if (!savedTest) {
    return notFound(testId)
  }

  return NextResponse.json(savedTest)
}

export async function PATCH(request: Request, context: RouteContext) {
  const { testId } = await context.params

  if (!isValidTestId(testId)) {
    return notFound(testId)
  }

  const parsedRequest = recordTestRunRequestSchema.safeParse(await request.json())

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: 'Invalid run result',
        details: z.treeifyError(parsedRequest.error)
      },
      { status: 400 }
    )
  }

  try {
    return NextResponse.json(await recordSavedTestRun(testId, parsedRequest.data))
  } catch (error) {
    if (error instanceof UnknownSavedTestError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    throw error
  }
}
