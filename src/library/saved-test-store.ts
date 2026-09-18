import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { savedTestSchema, type SavedTest } from '@/contracts/saved-test'
import type { PlanParams, TestPlan } from '@/contracts/test-plan'
import { pickNonSecretParams } from '@/runner/plan-params'
import { getSavedTestPath, getSavedTestsDirectory } from './saved-test-paths'

export class UnknownSavedTestError extends Error {
  constructor(testId: string) {
    super(`No saved test with ID ${testId}`)
    this.name = 'UnknownSavedTestError'
  }
}

async function writeSavedTest(savedTest: SavedTest) {
  const parsedTest = savedTestSchema.parse(savedTest)
  const testPath = getSavedTestPath(parsedTest.id)
  const temporaryPath = `${testPath}.tmp`

  await mkdir(getSavedTestsDirectory(), { recursive: true })
  await writeFile(temporaryPath, `${JSON.stringify(parsedTest, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, testPath)

  return parsedTest
}

export async function saveTest(plan: TestPlan, params: PlanParams = {}) {
  const now = new Date().toISOString()

  return writeSavedTest({
    id: randomUUID(),
    name: plan.name,
    plan,
    defaultParams: pickNonSecretParams(plan, params),
    createdAt: now,
    updatedAt: now,
    lastRunId: null,
    lastRunStatus: null,
    lastRunAt: null
  })
}

export async function getSavedTest(testId: string) {
  try {
    const contents = await readFile(getSavedTestPath(testId), 'utf8')
    return savedTestSchema.parse(JSON.parse(contents))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

export async function listSavedTests() {
  let fileNames: string[]

  try {
    fileNames = await readdir(getSavedTestsDirectory())
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return []
    }

    throw error
  }

  const savedTests: SavedTest[] = []

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.json')) {
      continue
    }

    const savedTest = await getSavedTest(fileName.slice(0, -'.json'.length))

    if (savedTest) {
      savedTests.push(savedTest)
    }
  }

  return savedTests.sort((first, second) => second.createdAt.localeCompare(first.createdAt))
}

export async function recordSavedTestRun(
  testId: string,
  lastRun: Pick<SavedTest, 'lastRunId' | 'lastRunStatus' | 'lastRunAt'>
) {
  const savedTest = await getSavedTest(testId)

  if (!savedTest) {
    throw new UnknownSavedTestError(testId)
  }

  return writeSavedTest({
    ...savedTest,
    ...lastRun,
    updatedAt: new Date().toISOString()
  })
}
