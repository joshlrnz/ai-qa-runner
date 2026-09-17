import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { testRunSchema, type TestRun } from '@/contracts/test-run'
import { getRunDirectory, getRunsDirectory } from './run-paths'

function getResultPath(runId: string) {
  return path.join(getRunDirectory(runId), 'result.json')
}

export async function saveRun(run: TestRun) {
  const parsedRun = testRunSchema.parse(run)
  const runDirectory = getRunDirectory(run.runId)
  const resultPath = getResultPath(run.runId)
  const temporaryPath = `${resultPath}.tmp`

  await mkdir(runDirectory, { recursive: true })
  await writeFile(temporaryPath, `${JSON.stringify(parsedRun, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, resultPath)
}

export async function getRun(runId: string) {
  try {
    const contents = await readFile(getResultPath(runId), 'utf8')
    return testRunSchema.parse(JSON.parse(contents))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

export async function prepareRunsDirectory() {
  await mkdir(getRunsDirectory(), { recursive: true })
}
