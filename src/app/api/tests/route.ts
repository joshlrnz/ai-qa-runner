import { NextResponse } from 'next/server'
import { z } from 'zod'
import { saveTestRequestSchema } from '@/contracts/saved-test'
import { listSavedTests, saveTest } from '@/library/saved-test-store'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ tests: await listSavedTests() })
}

export async function POST(request: Request) {
  const parsedRequest = saveTestRequestSchema.safeParse(await request.json())

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: 'Invalid test plan',
        details: z.treeifyError(parsedRequest.error)
      },
      { status: 400 }
    )
  }

  const { plan, params } = parsedRequest.data

  return NextResponse.json(await saveTest(plan, params), { status: 201 })
}
