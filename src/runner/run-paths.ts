import path from 'node:path'

const runIdPattern = /^[a-zA-Z0-9-]+$/

export function getRunsDirectory() {
  return path.join(process.cwd(), 'runs')
}

export function getRunDirectory(runId: string) {
  if (!runIdPattern.test(runId)) {
    throw new Error('Invalid run ID')
  }

  return path.join(getRunsDirectory(), runId)
}

export function getRunReportDirectory(runId: string) {
  return path.join(getRunDirectory(runId), 'playwright-report')
}
